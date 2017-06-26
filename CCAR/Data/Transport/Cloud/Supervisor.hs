{-# LANGUAGE TemplateHaskell, DeriveDataTypeable, DeriveGeneric #-}
module CCAR.Data.Transport.Cloud.Supervisor
  (supervisor) where 
import Data.Binary  
import Data.Typeable
import GHC.Generics(Generic)
import System.Environment (getArgs)
import Data.Monoid((<>))
import Control.Concurrent(forkIO)
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
import CCAR.Main.Driver(cloudDriver, newApp)
-- Data structures --

newtype CloudServiceName = CloudServiceName String
newtype WebserverPort = WebserverPort Int deriving (Typeable, Generic)

instance Binary WebserverPort
type TestMessage = String -- todo fix this
  
processName :: String 
processName = "CCAROnTheCloud"



-- Core functions-- 

proxyProcess :: App -> Process()
proxyProcess a@(App _ proxy _) =  
  forever $ join $ liftIO $ atomically $ readTChan proxy


------------ Message handling ----------------

handleRemoteMessage :: App -> TestMessage -> Process() 
handleRemoteMessage app aMessage = do 
  say (printf "Received %s" (show aMessage))

handleWhereIsReply _ (WhereIsReply _ Nothing) = return ()
handleWhereIsReply anApp (WhereIsReply _ (Just pid)) = 
    say (printf "Handle whereis reply %s" (show pid))


handleMonitorNotification :: App -> ProcessMonitorNotification ->  Process()
handleMonitorNotification anApp a@(ProcessMonitorNotification _ pid _) = 
  say $ printf "Server on %s has died" (show pid)


-- A simple supervisor that can be used to manage load.

server :: WebserverPort -> Process ()
server (WebserverPort aPortnumber) = do
  say $ printf "%s : %s " 
    ("CCAR.Data.Transport.Cloud.Supervisor" :: String) 
    ("Runnning server" :: String)
  anApp <- liftIO $ newApp
  _ <- liftIO $ forkIO $ cloudDriver aPortnumber anApp
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
  let peers = filter (/= mynode) peers0
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