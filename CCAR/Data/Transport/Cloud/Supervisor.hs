{-# LANGUAGE TemplateHaskell, DeriveDataTypeable, DeriveGeneric #-}
module CCAR.Data.Transport.Cloud.Supervisor  where 
import Data.Binary  
import Data.Typeable
import GHC.Generics(Generic)
import System.Environment (getArgs)
import Control.Distributed.Process
import Control.Distributed.Process.Closure
import Control.Distributed.Process.Backend.SimpleLocalnet
import Control.Distributed.Process.Node as Node hiding (newLocalNode)
import System.Log.Logger as Logger
import Control.Monad(forM, forM_)
import Text.Printf

import CCAR.Main.Application(App)

data TestMessage = Ping ProcessId 
  | Pong ProcessId  deriving (Typeable, Generic)

instance Binary TestMessage  

-- A simple supervisor that can be used to manage load.

supervisor :: App -> Process ()
supervisor app = 
  say $ printf "%s : %s " 
    ("CCAR.Data.Transport.Cloud.Supervisor" :: String) 
    ("Runnning supervisor" :: String)





-- This is needed for template haskell.
remotable ['supervisor]

processName :: String 
processName = "CCAROnTheCloud"

master :: Backend -> App -> [NodeId] -> Process () 
master backend app peers = do 
  mynode <- getSelfNode

  peers0 <- liftIO $ findPeers backend 1000000
  let peers = filter (/= mynode) peers0

  say ("peers are " ++ show peers)

  mypid <- getSelfPid
  register processName mypid

  forM_ peers $ \peer -> do
    whereisRemoteAsync peer processName

  supervisor app
-- In cloud haskell, a distributed program is a set of processes
-- thus naming it as processMain
processMain :: App -> IO ()
processMain app = do
 [port] <- getArgs
 backend <- 
  initializeBackend "localhost" port
    (__remoteTable initRemoteTable)

 peers <- findPeers backend 1000000
 node <- newLocalNode backend
 Node.runProcess node (master backend app peers)
