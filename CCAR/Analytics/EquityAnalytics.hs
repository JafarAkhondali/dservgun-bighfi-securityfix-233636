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
import							CCAR.Main.Util(getUTCTime)
import 							Control.Monad.Trans.Reader
import							CCAR.Model.PortfolioSymbol(getPortfolioSymbols)
iModuleName  = "CCAR.Analytics.EquityAnalytics"


data BetaParameters = BetaParameters {
			equitySymbol :: T.Text
			, benchmarkSymbol :: T.Text
			, startDate :: T.Text
			, endDate :: T.Text
		} deriving (Show, Eq)

data BetaResult = BetaResult {
		gradient :: Gradient
		, intercept :: Intercept 
		, symbolRawData :: [Double]
		, benchmarkRawdata :: [Double]
	} deriving (Show, Eq)

type BetaFormula = ReaderT BetaParameters  IO (Either Text BetaResult)




portfolioBeta :: Text -> Text -> Text -> Text -> IO (Either Text Gradient) 
portfolioBeta portfolioId benchmark startDate endDate = do
	portfolioSymbols <- getPortfolioSymbols portfolioId
	result <- case portfolioSymbols of 
					Left x -> return []
					Right pS -> do 
						x <- return $ List.foldl' (\acc (_,cur) -> (acc + cur)) 0.0 pS
						y <- return $ List.map (\(sym, qty) -> (sym, qty * 100/x )) pS
						putStrLn "Before calling beta..."
						return y
	weightedBeta <- mapM (\(sym, weight) -> do 
				(gradient, intercept) <- beta sym benchmark startDate endDate 
				return $ gradient * weight) result 
	totalWeight <- foldM (\acc cur -> return $ acc + cur) 0.0 $ List.filter (\x -> not . isNaN $  x ) weightedBeta
	return $ Right totalWeight




beta :: Text -> Text -> Text -> Text -> IO (Gradient, Intercept)
beta equity benchmark startDate endDate= do 
	res <- runMaybeT $ do
		flip runReaderT (BetaParameters equity benchmark startDate endDate) $ do 
			BetaParameters e b st end <- ask
			fTimeFormat <- return "%m/%d/%Y"
			Just sDate <- return $ parseTime defaultTimeLocale fTimeFormat (T.unpack st )
			Just eDate <- return $ parseTime defaultTimeLocale fTimeFormat (T.unpack end)
			symbol <- liftIO $ symbolClose e sDate eDate
			benSymbol <- liftIO $ symbolClose b sDate eDate
			return (linearRegression symbol benSymbol)
	case res of
		Nothing -> return (-1, -1)
		Just x -> return x

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

{-- Probability mass function to compute some mass histogram for a probability--}
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
		gradient = covariance x y / (variance y)
		intercept = yavg - (gradient * xavg)


testPBeta = portfolioBeta  "72e4540c-a4c6-11e5-8001-ecf4bb2e10a3" "SPY" "01/03/2016" "02/26/2016"
