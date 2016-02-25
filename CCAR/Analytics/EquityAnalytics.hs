module CCAR.Analytics.EquityAnalytics
	(computeChange, computeLogChange)
 where

import 							Data.Bits
import 							Network.Socket
import 							Network.BSD
import 							Data.List as List
import 							System.IO 
import 							Data.Text as T
import 							GHC.Generics
import 							Data.Data
import 							Data.Monoid (mappend, (<>))
import 							Data.Typeable 
import 							Data.Aeson
import 							CCAR.Main.Util as Util
import 							CCAR.Parser.CSVParser as CSVParser
import 							System.Log.Logger as Logger
import 							CCAR.Main.DBUtils 
import 							Database.Persist
import 							Database.Persist.TH 
import							CCAR.Data.MarketDataAPI as MarketDataAPI 
														(queryMarketData
														, queryOptionMarketData
														, MarketDataServer(..))
import							Control.Monad.State as State
import 							Data.Time
import							Data.Functor.Identity as Identity
iModuleName  = "CCAR.Analytics.EquityAnalytics"

{-- Beta is computed as a magnitude of the change, it is roughly defined as follows
	y = a + bx 
	where a = alpha
	and b = beta. The equation is statistically computed with an error or 
	unexplained returns.
	time interval. --}
beta :: (EquitySymbol, EquitySymbol, UTCTime, UTCTime) -> Double
beta = undefined


change  :: [Int] -> State (Int, [(Int, Int)]) ()
change [] = return ()
change (x: xs) = do 
	(prev, l) <- State.get 
	put (x, (x, prev) : l) 
	change xs


computeChange =  \x -> flip execState (0, []) $ change x


computeLogChange input = List.map (\(x, y) -> log(fromIntegral y / (fromIntegral x ))) 
							$ List.filter ( \(x, y) -> (x /= 0) && (y /= 0)) 
								changeArray 
						 where 
						 	(_, changeArray) = computeChange input




