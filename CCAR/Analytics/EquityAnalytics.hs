module CCAR.Analytics.EquityAnalytics
	(computeLogChange, computePctChange, computeChange)
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
beta :: Text -> Text -> UTCTime -> UTCTime -> IO [(Double, Double)]
beta equity benchmark startDate endDate= do 
	symbol <- symbolClose equity startDate endDate 
	benSymbol <- symbolClose benchmark startDate endDate
	return $ List.zip symbol benSymbol


symbolClose :: Text -> UTCTime -> UTCTime -> IO [(Double)]
symbolClose aSymbol startDate endDate = dbOps $ do 
	symbols <- selectList [HistoricalPriceSymbol ==. aSymbol
						, HistoricalPriceDate >=. startDate
						, HistoricalPriceDate <=. endDate] [Asc HistoricalPriceDate]
	x <- mapM(\x@(Entity id historicalPrice) -> return $ (historicalPriceClose historicalPrice)) symbols 
	return (computeLogChange x)

change  :: [a]-> State (a , [(a , a)]) ()
change [] = return ()
change (x: xs) = do
	(prev, l) <- State.get 
	put (x, (x, prev) : l) 
	change xs


computeChange =  \x -> flip execState (0, []) $ change x

logEvaluator prev current = log (prev/current)
pctEvaluotor prev current = (prev - current ) * 100 / current
computeLogChange input = computeChangeI input logEvaluator
computePctChange input = computeChangeI input pctEvaluotor
computeChangeI input evaluotorFunction = 
	List.map (\(x, y) -> (evaluotorFunction y x)) 
	$ List.filter ( \(x, y) -> (x /= 0) && (y /= 0)) 
		changeArray 
	where 
		(_, changeArray) = computeChange input


