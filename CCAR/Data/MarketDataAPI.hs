module CCAR.Data.MarketDataAPI 
	(MarketDataServer(..), getActiveScenario, updateActiveScenario
        , queryMarketData
        , queryOptionMarketData
        , getActivePortfolio)
where

import          Data.Text as T 
import          Network.WebSockets.Connection as WSConn
import          Network.WebSockets 
import          CCAR.Main.Application(App(..))
import          CCAR.Main.DBUtils
import          Data.Map as Map 
import          Control.Concurrent.STM.Lifted
import          CCAR.Model.CcarDataTypes
import          CCAR.Data.ClientState
import          CCAR.Main.GroupCommunication
import          Database.Persist
import          Database.Persist.TH 
import Control.Applicative ((<$>), (<*>), (*>), (<*), (<$))
import Control.Monad 
import Control.Monad.Trans(liftIO, lift)
import Data.Monoid(mappend)
import Control.Monad.Trans.Maybe



class MarketDataServer a where 
	{-- | A polling interval to poll for data. Non real time threads.--}
	realtime :: a -> IO Bool 
	pollingInterval :: a -> IO Int 
	runner :: a -> App -> WSConn.Connection -> T.Text -> Bool -> IO ()


getActivePortfolio :: T.Text -> App -> STM (Maybe ActivePortfolio)
getActivePortfolio nickName app@(App a c) = do 
    cMap <- readTVar . nickNameMap $ app 
    let clientState = Map.lookup nickName cMap 
    return $ activePortfolio =<< clientState

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


queryMarketData :: IO (Map T.Text HistoricalPrice)
queryMarketData = dbOps $ do 
        -- A bit of a hack. Sort by ascending market data date to replace with the latest element.
        x <- selectList [][Asc HistoricalPriceSymbol, Asc HistoricalPriceDate]
        y <- Control.Monad.mapM (\a@(Entity k val) -> return (historicalPriceSymbol val, val)) x 
        return $ Map.fromList y 



queryOptionMarketData :: [CCAR.Main.DBUtils.PortfolioSymbol] -> IO [Entity CCAR.Main.DBUtils.OptionChain]
queryOptionMarketData symbolList = dbOps $ do 
    r <- Control.Monad.foldM (\acc sym -> do 
            val <- selectList [OptionChainUnderlying ==. (portfolioSymbolSymbol sym)][]
            return (val `mappend` acc) ) [] symbolList
    return r