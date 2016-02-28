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
import 							Data.Time(parseTime, UTCTime, LocalTime)
import							System.Locale(defaultTimeLocale, TimeLocale(..))
import							Data.Functor.Identity as Identity
import            				Math.Combinatorics.Exact.Binomial 
import							Control.Monad.Trans.Maybe

iModuleName  = "CCAR.Analytics.EquityAnalytics"



getUTCTime :: Text -> Maybe UTCTime
getUTCTime startDate = parseTime defaultTimeLocale (dateFmt defaultTimeLocale) (T.unpack startDate)
{-- Beta is computed as a magnitude of the change, it is roughly defined as follows
	y = a + bx 
	where a = alpha
	and b = beta. The equation is statistically computed with an error or 
	unexplained returns.
	time interval. --}
--beta :: Text -> Text -> Text -> Text -> IO (Double, Double, [Double], [Double])
beta equity benchmark startDate endDate= runMaybeT $ do
		fTimeFormat <- return "%m/%d/%Y"
		liftIO $ putStrLn $ "Parsing date " ++ (T.unpack startDate)
		Just sDate <- return $ parseTime defaultTimeLocale fTimeFormat (T.unpack startDate)
		liftIO $ putStrLn $ (show sDate)
		Just eDate <- return $ parseTime defaultTimeLocale fTimeFormat (T.unpack endDate)
		liftIO $ putStrLn $ (show eDate)

		symbol <- liftIO $ symbolClose equity sDate eDate
		benSymbol <- liftIO $ symbolClose benchmark sDate eDate
		return $ (linearRegression benSymbol symbol , symbol, benSymbol)


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

logEvaluator prev current = (log prev)/(log current)
pctEvaluotor prev current = (current - prev ) * 100/ prev
computeLogChange input = computeChangeI input logEvaluator
computePctChange input = computeChangeI input pctEvaluotor
computeChangeI input evaluotorFunction = 
	List.map (\(x, y) -> (evaluotorFunction y x)) 
	$ List.filter ( \(x, y) -> (x /= 0) && (y /= 0)) 
		changeArray 
	where 
		(_, changeArray) = computeChange input




average ::(Fractional a, Real a1) => [a1] -> a 
average xs = realToFrac (sum xs) / fromIntegral (List.length xs)

{-- Probability mass function to compute some mass histogram for a probability
	
 --}
probabilityMassFunction :: Integral a => a -> a -> Double -> Double 
probabilityMassFunction k n p = (fromIntegral (n `choose` k)) * (p^k) * ((1 - p)^(n - k))


standardDeviation :: [Double] -> Double
standardDeviation values = (sqrt . sum $ List.map (\x -> (x - mu) * (x - mu)) values) /sqrt_nm1
			where 
				mu = average values
				sqrt_nm1 = sqrt $ (genericLength values - 1)

{-- Compute standard error. I see how precicion was built-into statistics --}
standardError = \input -> standardDeviation input/ (sqrt $ genericLength input)


{-- Compute the variance --}
variance :: [Double] -> Double
variance values = (sum $ List.map (\x -> (x - mu) * (x - mu)) values) /sqrt_nm1
			where 
				mu = average values
				sqrt_nm1 = genericLength values

{-- covariance x y :--}
covariance :: [Double] -> [Double] -> Double
covariance x y = average $ List.zipWith (\xi yi -> (xi - xavg) *(yi - yavg)) x y 
				where 
					xavg = average x 
					yavg = average y

{-- Pearson r correlation coefficient --}
pearsonR :: [Double] -> [Double] -> Double
pearsonR x y = r 
	where 
		xstddev = standardDeviation x 
		ystddev = standardDeviation y 
		r = covariance x y / (xstddev * ystddev)

pearsonRSquared :: [Double] -> [Double] -> Double
pearsonRSquared x y = pearsonR x y ^ 2

{-- Linear regression or beta to find a best-fit line.--}
type Gradient = Double
type Intercept = Double
linearRegression :: [Double] -> [Double] -> (Gradient, Intercept)
linearRegression x y = (gradient, intercept) 
	where
		xavg = average x 
		yavg = average y 
		gradient = covariance x y / (variance x)
		intercept = yavg - (gradient * xavg)
		