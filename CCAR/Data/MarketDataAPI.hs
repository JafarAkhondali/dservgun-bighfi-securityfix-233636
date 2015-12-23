module CCAR.Data.MarketDataAPI 
	(MarketDataServer(..), getActiveScenario, updateActiveScenario)
where

import Data.Text as T 
import Network.WebSockets.Connection as WSConn
import Network.WebSockets 
import CCAR.Main.Application(App(..))
import Data.Map as Map 
import Control.Concurrent.STM.Lifted
import CCAR.Model.CcarDataTypes
import CCAR.Main.GroupCommunication

class MarketDataServer a where 
	{-- | A polling interval to poll for data. Non real time threads.--}
	realtime :: a -> IO Bool 
	pollingInterval :: a -> IO Int 
	runner :: a -> App -> WSConn.Connection -> T.Text -> Bool -> IO ()



getActiveScenario :: App -> T.Text -> STM [Stress]
getActiveScenario app nn = do 
    cMap <- readTVar $ nickNameMap app 
    clientState <- return $ Map.lookup nn cMap 
    case clientState of 
            Nothing -> return [] 
            Just x1 -> return $ activeScenario x1

updateActiveScenario :: App -> T.Text -> [Stress] -> STM()
updateActiveScenario app nn x = do 
    cMap <- readTVar $ nickNameMap app 
    clientState <- return $ Map.lookup nn cMap
    case clientState of 
            Nothing -> return () 
            Just x1 -> do 
                _ <- writeTVar (nickNameMap app) 
                            (Map.insert nn (x1 {activeScenario = x}) (cMap))
                return ()
