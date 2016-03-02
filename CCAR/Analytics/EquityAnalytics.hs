module CCAR.Analytics.EquityAnalytics
	(computeLogChange, computePctChange, computeChange, startup)
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
import							CCAR.Data.Stats
import 							Database.Persist as Persist
import 							Database.Persist.TH 
import							CCAR.Data.MarketDataAPI as MarketDataAPI 
														(queryMarketData
														, queryOptionMarketData
														, MarketDataServer(..))
import							Control.Monad.State as State
import 							Data.Time(parseTime, UTCTime, LocalTime)
import							System.Locale(defaultTimeLocale, TimeLocale(..))
import							Data.Functor.Identity as Identity
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

getBenchmark :: Text -> IO Text
getBenchmark aSymbol = dbOps $ do 
	benchmarks <- selectList [EquityBenchmarkSymbol ==. aSymbol] [Asc EquityBenchmarkSymbol] 
	x <- mapM (\x@(Entity id benchmarkSymbol) -> return $ equityBenchmarkBenchmark benchmarkSymbol) benchmarks
	y <- case x of 
			[] -> return "SPY"
			h : _ -> return h 
	return y 

--portfolioBeta :: Text -> Text -> Text -> IO (Either Text Gradient) 
portfolioBeta portfolioId startDate endDate = do
	portfolioSymbols <- getPortfolioSymbols portfolioId
	result <- case portfolioSymbols of 
					Left x -> return []
					Right pS -> do 
						x <- return $ List.foldl' (\acc (_,cur) -> (acc + cur)) 0.0 pS
						y <- return $ List.map (\(sym, qty) -> (sym, qty * 100/x )) pS
						putStrLn "Before calling beta..."
						return y
	weightedBeta <- mapM (\(sym, weight) -> do 
				benchmark <- getBenchmark sym
				
				(gradient, intercept) <- beta sym benchmark startDate endDate 

				return $ gradient * weight) result 
	totalWeight <- foldM (\acc cur -> return $ acc + cur) 0.0 $ List.filter (\x -> not . isNaN $  x ) weightedBeta
	return $ Right (totalWeight, weightedBeta, result)




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


{-- Return the benchmark for the symbol --}
benchmarkFor :: Text -> IO [Text]
benchmarkFor aSymbol = dbOps $ do
	symbols <- selectList [EquityBenchmarkSymbol ==. aSymbol] [Asc EquityBenchmarkBenchmark]
	x <- mapM (\x@(Entity id bench) -> return $ equityBenchmarkBenchmark bench) symbols
	return x



insertB (EquityBenchmark symbol benchmark) = do 
	exists <- getBy $ UniqueBenchmark symbol benchmark
	case exists of
		Nothing -> do 
			_ <- Persist.insert $ EquityBenchmark symbol benchmark					
			return symbol
		Just x -> do 
			liftIO $ Logger.debugM iModuleName $ T.unpack $ T.intercalate ":" ["Benchmark exists", symbol, benchmark] 
			return symbol


startup = dbOps $ do 
	insertB $ EquityBenchmark "AAPL" "SPY"
