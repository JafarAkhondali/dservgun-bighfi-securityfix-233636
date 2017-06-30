{-# LANGUAGE TemplateHaskell, DeriveDataTypeable, DeriveGeneric #-}
module CCAR.Data.Transport.Cloud.Supervisor
  (supervisor) where 
import Data.Map as Map
import Data.Binary  
import Data.Typeable
import Data.Text
import Data.List as List
import GHC.Generics(Generic)
import System.Environment (getArgs)
import Data.Monoid((<>))
import Control.Concurrent(forkIO, threadDelay)
import Control.Concurrent.Async
import Control.Distributed.Process
import Control.Distributed.Process.Closure
import Control.Distributed.Process.Backend.SimpleLocalnet
import Control.Distributed.Process.Node as Node hiding (newLocalNode)
import Control.Concurrent.STM.Lifted
import Control.Monad
import System.Log.Logger as Logger
import Control.Monad(forM, forM_)
import Text.Printf
import CCAR.Main.Application(App(..))
import CCAR.Main.Driver(cloudDriver, newApp, countAllClients)
-- Data structures --

{-| 
  A name that cloud uses to register and discover peers.
-}
processName :: String 
processName = "CCAROnTheCloud"

newtype CloudServiceName = CloudServiceName String
newtype WebserverPort = WebserverPort Int deriving (Typeable, Generic)

data ProcessMessage = 
  ClientsConnected Int ProcessId -- How many connections
  -- How many requests: should add websocket recquests and http requests
  | RequestsProcessed Int ProcessId 
  | ProcessInfo String ProcessId
  deriving(Typeable, Generic, Show)


------------ Message handling ----------------

{- | 
-}

getAllProcesses :: App -> STM [ProcessId]
getAllProcesses anApp@(App _ _ connMap _) = do 
  m <- readTVar connMap
  return $ List.map (\x -> fst x) $ Map.toList m
{- |
  Updates the connection count for remote process. 
-}
updateConnectionCount :: App -> Int -> ProcessId -> STM ()
updateConnectionCount (App _ _ connMap _) aCount aProcessId = do
  m <- readTVar connMap
  writeTVar connMap (Map.insert aProcessId aCount m)

{- | Deletes all entries related to the process. -}
deleteProcessEntries :: App -> ProcessId -> STM () 
deleteProcessEntries (App _ _ connMap _) aProcessId = do
  m <- readTVar connMap 
  writeTVar connMap $ Map.delete aProcessId m

{- | Entry point for the cloud processes. -}
handleRemoteMessage :: App -> ProcessMessage -> Process() 
handleRemoteMessage app aMessage = do 
  say $ 
    printf $ 
      "handling remote message " <> (show aMessage)
  selfPid <- getSelfPid
  case aMessage of 
    ClientsConnected aNumber aProcessId -> 
        if selfPid /= aProcessId then 
          liftIO $ atomically $ updateConnectionCount app aNumber aProcessId 
        else 
          return()
    _ -> say $ printf
                "%s - %s" ("Processing " :: String) (show aMessage)


{- | Each server publishes a  
  * WhereIsReply when a process calls 'whereIsRemote'
-}
handleWhereIsReply _ (WhereIsReply _ Nothing) = return ()
handleWhereIsReply anApp (WhereIsReply _ (Just pid)) = do
  say (printf "Handle whereis reply %s" (show pid))
  publishInitialAppState pid anApp


{- | When a remote process with 'pid' has stopped, cleanup the local cache by
  * removing all entries corresponding to the process id.
  ** Note: a degenerate case could be that the entire network is coming down, therefore 
  some alerts need to be in place when processes race to the bottom.
-}
handleMonitorNotification :: App -> ProcessMonitorNotification ->  Process()
handleMonitorNotification anApp a@(ProcessMonitorNotification _ pid _) = do
  say $ printf "Server on %s has died" (show pid)
  liftIO $ atomically $ deleteProcessEntries anApp pid 



{- | A listener waiting for messages on the read channel.
-}
proxyProcess :: App -> Process()
proxyProcess a@(App _ proxy _ _) =  
  forever $ join $ liftIO $ atomically $ readTChan proxy

{- | Initial state published when WhereIsReply.
-}

publishInitialAppState :: ProcessId -> App -> Process ()
publishInitialAppState pid app = do 
  count <- liftIO $ atomically $ countAllClients app 
  spid <- getSelfPid  
  allProcesses <- liftIO $ atomically $ getAllProcesses app
  let aP = List.filter (/= spid) allProcesses
  mapM
        (\x -> liftIO $ atomically $ sendRemote app x (ClientsConnected count spid)) 
        aP 
  return ()

{- | Publishes the state of the current process, self pid periodically.
  A process can refuse connections if the load is above a threshold.
-}
publishAppState :: ProcessId -> App -> Process ()
publishAppState pid app@(App _ proxy _ _) = do
  forever $ do
    publishAppState pid app
    liftIO $ threadDelay (10 ^ 6 * 10) -- wake up every second




{- | Send a 'ProcessMessage' to a remote process -}
sendRemote :: App -> ProcessId -> ProcessMessage -> STM ()
sendRemote (App _ proxyChan _ _) pid pmsg = writeTChan proxyChan (send pid pmsg)


{- | 
  Server process that the backend launches. Key functions: 
  * Create a new application.
  * Fork the local process in this case a cloud driver.
  * Publish heartbeats periodically
  * Match on 'ProcessMessage', 'ProcessMonitorNotification', 
    'WhereIsReply' and catch-all.
-}
server :: WebserverPort -> Process ()
server (WebserverPort aPortnumber) = do
  say $ printf "%s : %s " 
    ("CCAR.Data.Transport.Cloud.Supervisor" :: String) 
    ("Runnning server" :: String)
  anApp <- liftIO $ newApp
  liftIO $ forkIO $ cloudDriver aPortnumber anApp
  currentPid <- getSelfPid
  spawnLocal (publishAppState currentPid anApp)

  -- Spawn local so we can start a process (this need not be remote)
  -- because all nodes are peers.
  spawnLocal (proxyProcess anApp)
  forever $
    receiveWait
      [ match $ handleRemoteMessage anApp 
      , match $ handleMonitorNotification anApp 
      , matchIf (\(WhereIsReply l _) -> l == processName)
            $ handleWhereIsReply anApp
      , matchAny $ \_ -> return () -- discard unknown messages.

      ]


modName = "CCAR.Data.Transport.Cloud.Supervisor"
-- This is needed for template haskell.
remotable ['server]


master :: Backend -> WebserverPort -> [NodeId] -> Process () 
master backend webserverPort peers = do 
  mynode <- getSelfNode

  peers0 <- liftIO $ findPeers backend 1000000
  let peers = Prelude.filter (/= mynode) peers0
  liftIO $ Logger.debugM modName $ "Peers are " <> (show peers)
  say ("peers are " ++ show peers)

  mypid <- getSelfPid
  register processName mypid

  forM_ peers $ \peer -> do
    whereisRemoteAsync peer processName

  server webserverPort
-- In cloud haskell, a distributed program is a set of processes
-- thus naming it as processMain
processMain :: CloudServiceName ->  WebserverPort -> IO ()
processMain (CloudServiceName cPort) webserverPort = do
 Logger.debugM modName $ "Setting up backend on " <> (show cPort)
 backend <- 
  initializeBackend "localhost" cPort
    (__remoteTable initRemoteTable)
 peers <- findPeers backend 1000000
 node <- newLocalNode backend
 Node.runProcess node (master backend webserverPort peers)

supervisor :: String -> Int -> IO ()
supervisor cPort wPort = processMain (CloudServiceName cPort) (WebserverPort wPort)


--------- Miscellaenous -----

instance Binary WebserverPort
instance Binary ProcessMessage

  

