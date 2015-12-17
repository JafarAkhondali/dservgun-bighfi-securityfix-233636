module CCAR.Data.MarketDataAPI 
	(MarketDataServer(..))
where

import Data.Text as T 
import Network.WebSockets.Connection as WSConn
import Network.WebSockets 
import CCAR.Main.Application(App(..))


class MarketDataServer a where 
	{-- | A polling interval to poll for data. Non real time threads.--}
	realtime :: a -> IO Bool 
	pollingInterval :: a -> IO Int 
	runner :: a -> App -> WSConn.Connection -> T.Text -> Bool -> IO ()

