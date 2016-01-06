module CCAR.Data.TradierApi 
	(startup, query, QueryOptionChain, queryMarketData, TradierMarketDataServer(..))
where 

import CCAR.Main.DBOperations (Query, query, manage, Manager)
import Network.HTTP.Conduit 

import Data.Set as Set 
import Data.Map as Map
-- The streaming interface
import           Control.Monad.IO.Class  (liftIO)
import           Data.Aeson              (Value (Object, String, Array) 
										  , toJSON 
										  , fromJSON)
import           Data.Aeson              (encode, object, (.=), (.:), decode
											, parseJSON)
import           Data.Aeson.Parser       (json)
import			 Data.Aeson.Types 		 (parse, ToJSON, FromJSON, toJSON)
import           Data.Conduit            (($$+-))
import           Data.Conduit.Attoparsec (sinkParser)
import           Network.HTTP.Conduit    (RequestBody (RequestBodyLBS),
                                          Response (..), http, method, parseUrl,
                                          requestBody, withManager)
import 			CCAR.Parser.CSVParser as CSVParser(parseCSV, ParseError, parseLine)
import			Control.Concurrent(threadDelay)
import 			Data.Text as T 
import 			Data.Text.Lazy as L
import 			Data.ByteString.Lazy as LB 
import			Data.Text.Lazy.Encoding as LTE
import 			Data.Aeson.Types	 as AeTypes(Result(..), parse)
import 			Data.ByteString.Internal 	 as S
import			Data.HashMap.Strict 		 as M 
import 			Control.Exception hiding(Handler)

import 			Database.Persist
import 			Database.Persist.TH 

import 			qualified CCAR.Main.GroupCommunication as GC
import 			Database.Persist.Postgresql as DB
import 			Data.Time
import			Data.Map
import 			System.Locale(defaultTimeLocale)
import			System.Environment(getEnv)
import Control.Monad.IO.Class 
import Control.Monad
import Control.Monad.Logger 
import Control.Monad.Trans(lift)
import Control.Monad.Trans.Maybe
import Control.Monad.Trans.Resource
import Control.Applicative as Appl
import Data.Monoid(mappend, (<>))
import CCAR.Main.DBUtils
import CCAR.Command.ApplicationError(appError)

import System.Environment(getEnv)
import GHC.Generics
import GHC.IO.Exception
import Data.Vector
import Data.Scientific
import Data.Data
import Data.Monoid (mappend)
import Data.Typeable 
import Control.Monad.Trans.Resource
import Control.Monad.Trans.Maybe(runMaybeT)
import Control.Monad.Trans(lift)
import System.Log.Logger as Logger
import Data.Conduit.Binary as B (sinkFile, lines, sourceFile) 
import Data.Conduit.List as CL 
import Data.ByteString.Char8 as BS(ByteString, pack, unpack) 
import Data.Conduit ( ($$), (=$=), (=$), Conduit, await, yield)
import CCAR.Data.MarketDataAPI as MarketDataAPI
import CCAR.Model.Portfolio as Portfolio
import CCAR.Model.PortfolioSymbol as PortfolioSymbol hiding (symbol)
import CCAR.Main.Util as Util
import Network.WebSockets.Connection as WSConn
import CCAR.Model.CcarDataTypes
import CCAR.Main.Application
import Control.Concurrent.STM.Lifted
iModuleName = "CCAR.Data.TradierApi"
baseUrl =  "https://sandbox.tradier.com/v1"

quotesUrl =  "markets/quotes"
timeAndSales = "markets/timesales"
optionChains = "markets/options/chains"
provider = "Tradier"

historicalMarketData = "markets/history"

insertTradierProvider = 
	(dbOps $ do
		get <- DB.getBy $ UniqueProvider provider 
		liftIO $ Logger.debugM iModuleName $ "Inserting tradier provider " `mappend` (show get)
		y <- case get of 
				Nothing ->do 
					x <- DB.insert $ MarketDataProvider 
							provider baseUrl "" timeAndSales optionChains
					return $ Right x
				Just x -> return $ Left $ "Record exists. Not inserting" 

		liftIO $ Logger.debugM iModuleName $ "Inserted provider " `mappend` (show y)
	) `catch` (\x@(SomeException s) -> do
		Logger.errorM iModuleName $ "Error inserting tradier" `mappend`	 (show x))

getMarketData url queryString = do 
	authBearerToken <- getEnv("TRADIER_BEARER_TOKEN") >>= 
		\x ->  return $ S.packChars $ "Bearer " `mappend` x
	runResourceT $ do 
		manager <- liftIO $ newManager tlsManagerSettings 

		req <- liftIO $ parseUrl makeUrl
		req <- return $ req {requestHeaders = 
				[("Accept", "application/json") 
				, ("Authorization", 
					authBearerToken)]
				}
		req <- return $ setQueryString queryString req 
		res <- http req manager 
		value <- responseBody res $$+- sinkParser json 
		return value 
	where 
		makeUrl = S.unpackChars $ LB.toStrict $ LB.intercalate "/" [baseUrl, url]


getQuotes = \x  -> getMarketData quotesUrl [("symbols", Just x)] 

getTimeAndSales y = \x -> getMarketData timeAndSales [("symbol", Just x)]


getHistoricalData = \x -> do 
	Object value <- getMarketData historicalMarketData [("symbol", Just x)]
	
	history <- return $ M.lookup "history" value

	case history of 
		Just (Object aValue) -> do
			day <- return $ M.lookup "day" aValue 
			case day of 
				Just aValue2 -> do 
					case aValue2 of 
						a@(Array x2) -> return $ Right $ fmap (\y -> fromJSON y :: Result MarketDataTradier) x2
						_			-> return $ Left $ "Error processing " `mappend` (show aValue2)

getOptionChains = \x y -> do 
	liftIO $ Logger.debugM iModuleName ("Inside option chains " `mappend` (show x) `mappend` (show y))
	Object value <- getMarketData optionChains [("symbol", Just x), ("expiration", Just y )]
	liftIO $ Logger.debugM iModuleName ("getOptionChains " `mappend` (show x))
	options <- return $ M.lookup "options" value 
	liftIO $ Logger.debugM iModuleName (show options)
	case options of 
		Just (Object object) -> do 
			object <- return $ M.lookup "option" object
			case object of 
				Just aValue -> do
					case aValue of 
						a@(Array x) ->  do  
							return $ Right $ fmap (\y -> fromJSON y :: Result OptionChainMarketData) x 
						_ -> return $ Left $ "Error processing" `mappend` (show y)
				_ -> return $ Left $ "Error processing " `mappend` (show y)
		_ -> return $ Left "Nothing to process"
		


insertOptionChain x = dbOps $ do 
	liftIO $ Logger.debugM iModuleName ("inserting single " `mappend` (show x))
	x <- runMaybeT $ do 
		Just (Entity kId providerEntity) <- 
				lift $ DB.getBy $ UniqueProvider provider
		liftIO $ Logger.debugM iModuleName $ "Entity  " `mappend` (show providerEntity)
   		lift $ DB.insert $ OptionChain  
			(symbol x)
			(underlying x)
			(T.pack $ show $ strike x)
			(expiration x)				
			(optionType x)
			(T.pack $ show $ lastPrice x)
			(T.pack $ show $ bidPrice x) 
			(T.pack $ show $ askPrice x)
			(T.pack $ show $ change x)
			(T.pack $ show $ openInterest x)
			(kId)
	return x	

--insertHistoricalPrice :: MarketDataTradier -> T.Text -> 
insertHistoricalPrice y@(MarketDataTradier date open close high low volume) symb= dbOps $ do 
	liftIO $ Logger.debugM iModuleName $ "Inserting " `mappend` (show y)
	now <- liftIO $ getCurrentTime
	runMaybeT $ do 
		Just utcdate <- return $ parseTime defaultTimeLocale "%F" (T.unpack date)
		Just (Entity kid providerEntity) <- 
			lift $ DB.getBy $ UniqueProvider provider
		Nothing <- lift $ DB.getBy $ MarketDataIdentifier symb utcdate 
		lift $ DB.insert $ MarketData symb 
						utcdate 
						open 
						close 
						high 
						low 
						volume
						now 
						kid

	


data QueryOptionChain = QueryOptionChain {
	qNickName :: T.Text
	, qCommandType :: T.Text
	, qUnderlying :: T.Text
	, optionChain :: [OptionChain] 
} deriving (Show, Eq)


parseQueryOptionChain v = QueryOptionChain <$> 
				v .: "nickName" <*>
				v .: "commandType" <*> 
				v .: "underlying" <*> 
				v .: "optionChain"

genQueryOptionChain (QueryOptionChain n c underlying res) = 
		object [
			"nickName" .= n 
			, "commandType" .= c 
			, "underlying" .= underlying 
			, "optionChain" .= res 

		]


instance ToJSON QueryOptionChain where 
	toJSON = genQueryOptionChain 

instance FromJSON QueryOptionChain where
	parseJSON (Object v) = parseQueryOptionChain v 
	parseJSON _ 		 = Appl.empty



instance Query QueryOptionChain where 
	query = queryOptionChain

data OptionChainMarketData = OptionChainMarketData {
		symbol :: T.Text 
		, underlying :: T.Text 
		, strike :: Scientific
		, expiration :: T.Text
		, optionType :: T.Text
		, lastPrice :: Maybe Scientific
		, bidPrice :: Maybe Scientific
		, askPrice :: Maybe Scientific
		, change :: Maybe Scientific
		, openInterest :: Maybe Scientific
	}deriving (Show, Eq, Data, Generic, Typeable)


instance FromJSON OptionChainMarketData where 
	parseJSON (Object o) = OptionChainMarketData <$> 
								o .: "symbol" <*>
								o .: "underlying" <*> 
								o .: "strike" <*>
								o .: "expiration_date" <*> 
								o .: "option_type" <*>
								o .: "last" <*> 
								o .: "bid" <*> 
								o .: "ask" <*> 
								o .: "change" <*> 
								o .: "open_interest"
	parseJSON _ 		 = Appl.empty
instance ToJSON OptionChainMarketData

{-            symbol Text
            date UTCTime default=CURRENT_TIMESTAMP
            open Text default="0.0"
            close Text default="0.0"
            high Text default="0.0"
            low Text default="0.0"
            volume Text default="0.0"
            lastUpdateTime UTCTime default=CURRENT_TIMESTAMP
            dataProvider MarketDataProviderId 
            MarketDataIdentifier symbol date
-}						

data MarketDataTradier = MarketDataTradier {
	date :: T.Text 
	, open :: Double
	, close :: Double
	, high :: Double
	, low :: Double
	, volume :: Double
} deriving(Show, Eq, Ord)
instance ToJSON MarketDataTradier where 
	toJSON (MarketDataTradier date open close high low volume)	= 
		object [
			"date" .= date 
			, "open" .= open
			, "close" .= close 
			, "high" .= high 
			, "low" .= low 
			, "volume" .= volume 
		]

instance FromJSON MarketDataTradier where 
	parseJSON (Object o) =  do 
			date <- o .: "date" 
			open <- o .: "open" 
			close <- o .:  "close" 
			high <- o .: "high" 
			low <- 	o  .: "low"
			volume <- o .: "volume"
 			return $ MarketDataTradier 
						date 
						open
						close 
						high
						low 
						volume

	parseJSON  _ = Appl.empty

{-- | Returns the option expiration date for n months from now. 
 Complicated logic alert: 
  * Get the number of days left in the current month.
  * Get all the options for the end of the month.
  * This can probably be better replaced by getting 
  the market calendar from the market.

--}
expirationDate n = do 
	x <- liftIO $ getCurrentTime >>= \l 
				-> return $ utctDay l

	(yy, m, d) <- return $ toGregorian x
	-- Compute the number of days
	y <- Control.Monad.foldM (\a b -> 
				return $ 
					a + (gregorianMonthLength yy (m + b)) - d) -- days to subtract
				0 [0..n]
	x2 <- return $ addDays (toInteger y) x -- calendar addition.
	(yy2, m2, d2) <- return $ toGregorian x2 
	monthLength <- return $ toInteger $ gregorianMonthLength yy m2
	res <- return $ addDays (monthLength - (toInteger d2)) x2
	return $ BS.pack $ show res

defaultExpirationDate = expirationDate 0


insertDummyMarketData = dbOps $ do
	time <- liftIO $ getCurrentTime 
	y <- runMaybeT $ do 
		x <- lift $ selectList [][Asc EquitySymbolSymbol]
		Just (Entity kid providerEntity) <- 
				lift $ DB.getBy $ UniqueProvider provider
		y <- Control.Monad.mapM (\a @(Entity k val) -> do 
				lift $ DB.insert $ MarketData (equitySymbolSymbol val) 
									(time)
									1.0
									1.0
									1.0
									1.0
									1.0
									time 
									kid					
				newTime <- liftIO $ return $ addUTCTime (24 * 3600) time
				lift $ DB.insert $ MarketData (equitySymbolSymbol val) 
									(newTime)
									3.0
									3.0
									3.0
									3.0
									3.0
									time
									kid					
									) x 

		return () 
	return y




--TODO: Exception handling needs to be robust.
insertAndSave :: [String] -> IO (Either T.Text T.Text)
insertAndSave x = (dbOps $ do
	symbol <- return $ T.pack $ x !! 0 
	symbolExists <- getBy $ UniqueEquitySymbol symbol 
	expirationDate <- liftIO $ defaultExpirationDate
	case symbolExists of 
		Nothing ->  do
				i <- DB.insert $ EquitySymbol symbol
							(T.pack $ x !! 1)
							(T.pack $ x !! 2) 
							(T.pack $ x !! 3)
							(T.pack $ x !! 4)
							(read (x !! 5) :: Int )
				liftIO $ Logger.debugM iModuleName ("Insert succeeded " `mappend` (show i))
				return $ Right symbol
		Just x -> return $ Right symbol 
				)
				`catch`
				(\y -> do 
						Logger.errorM iModuleName $ 
							"Failed to insert " `mappend` (show (y :: SomeException))
						return $ Left "ERROR")

	
parseSymbol :: (Monad m, MonadIO m) => Conduit BS.ByteString m (Either ParseError [String])
parseSymbol = do 
	client <- await 
	case client of 
		Nothing -> return () 
		Just aBS -> do 
				yield $ CSVParser.parseLine $ BS.unpack aBS
				parseSymbol


saveSymbol :: (MonadIO m) => Conduit (Either ParseError [String]) m (Either T.Text T.Text)
saveSymbol = do 
	client <- await 
	case client of 
		Nothing -> return () 
		Just oString -> do 
			case oString of 				
				Right x -> do 
					x <- liftIO $ insertAndSave x 										
					yield x 
					return x
			
			saveSymbol

-- | Returns the symbol key.
saveHistoricalData :: (MonadIO m) => Conduit (Either T.Text T.Text) m (Either T.Text T.Text)
saveHistoricalData = do 
	client <- await 
	liftIO $ threadDelay (10^6)
	liftIO $ Logger.debugM iModuleName $ "Saving historical data " `mappend` (show client)
	liftIO $ Prelude.putStrLn $ "saving historical data " `mappend` (show client)
	case client of 
		Nothing -> do 
			return()
			yield $ Left "Nothing to process"
		Just sym -> do 
			case sym of
				Right x -> do 
					_ <- liftIO $ insertHistoricalIntoDb (T.unpack x)
					yield $ Right x
					return $ Right x 
				Left y -> do 
					yield $ Left $ T.pack $ "Nothing to save " `mappend` (show y)
					return $ Left $ "Nothing to save "
			saveHistoricalData 			
	


queryOptionChain aNickName o = do 
	x <- case (parse parseJSON o :: Result QueryOptionChain) of 
		Success r@(QueryOptionChain ni cType underlying _) -> do 
			optionChainE <- dbOps $ selectList [OptionChainUnderlying ==. underlying] []
			optionChain <- Control.Monad.forM optionChainE (\(Entity id x) -> return x)
			return $ Right $ 
				QueryOptionChain ni cType underlying optionChain
		Error s ->  return $ Left $ appError $ "Query users for a company failed  " `mappend` s
	return (GC.Reply, x)

saveOptionChains :: (MonadIO m) => Conduit (Either T.Text T.Text) m BS.ByteString
saveOptionChains = do 
	symbol <- await
	liftIO $ threadDelay (10^6) -- a second delay  
	case symbol of 
		Nothing -> return () 
		Just x -> do 
			liftIO $ Logger.debugM iModuleName ("Saving option chains for " `mappend` (show x))
			case x of 
				(Right aSymbol) -> do 
					liftIO $ Logger.debugM iModuleName ("Inserting into db " `mappend` (show x))
					d <- defaultExpirationDate
					i <- liftIO $ insertOptionChainsIntoDb (BS.pack $ T.unpack aSymbol) d
					yield $ BS.pack $ "Option chains for " `mappend` 
									(T.unpack aSymbol) `mappend` " retrieved: "
									`mappend` (show i)					
			 	(Left aSymbol) -> do 
			 		liftIO $ Logger.errorM iModuleName $ "Not parsing symbol"  `mappend` (show aSymbol)
			 		yield $ BS.pack $ "Option chain not parsed for " `mappend` (show aSymbol)
			saveOptionChains



insertHistoricalIntoDb xS = do 
	x1 <- getHistoricalData (BS.pack xS)
	Prelude.putStrLn $ show x1
	Logger.debugM iModuleName $ ("Inserting " `mappend` (show xS) `mappend` " database")
	case x1 of 
		Right x2 -> do 
			x <- Data.Vector.forM x2 
					(\x -> 
					case x of 
						Success y -> do 

								insertHistoricalPrice y $ T.pack xS
								return $ Right $ "Inserted  " `mappend`(show y)
						_	-> return $ Left $ "Unable to process " `mappend` (show x))
			return $ Right x
		Left x2 -> do 
			liftIO $ Logger.errorM iModuleName ("Error Historical price "  `mappend` (show xS))
			return $ Left xS



insertOptionChainsIntoDb x y = do 
	Logger.debugM iModuleName ("Inserting " `mappend` show x `mappend` " " `mappend` show y)
	x1 <- getOptionChains x y
	Logger.debugM iModuleName (show x1) 
	case x1 of 
		Right x2 -> do 
				liftIO $ Logger.debugM iModuleName ("Option chains " `mappend` (show x1))
				x <- Data.Vector.forM x2 (\s -> case s of 
						Success y -> insertOptionChain y
							) 
				return $ Right x
		Left x -> do
				liftIO $ Logger.errorM iModuleName ("Error processing option chain " `mappend` (show x))
				return $ Left x


setupSymbols aFileName = do 
	liftIO $ Logger.infoM iModuleName $ "Setting up symbols" `mappend` aFileName
	runResourceT $ 
			B.sourceFile aFileName $$ B.lines =$= parseSymbol =$= saveSymbol 
					=$= saveHistoricalData
					=$= saveOptionChains 
					=$ consume
	liftIO $ Logger.infoM iModuleName $ "Setup completeded " `mappend` aFileName


startup = do 
	dataDirectory <- getEnv("DATA_DIRECTORY")
	insertTradierProvider 
	x <- return $ T.unpack $ T.intercalate "/" [(T.pack dataDirectory), "nasdaq_listed.txt"]
	y <- return $ T.unpack $ T.intercalate "/" [(T.pack dataDirectory), "other_listed.txt"]
	setupSymbols x 
	setupSymbols y 



startup_d = do 
	dataDirectory <- getEnv("DATA_DIRECTORY")
	_ <- insertTradierProvider 
	x <- return $ T.unpack $ T.intercalate "/" [(T.pack dataDirectory), "nasdaq_10.txt"]
	setupSymbols x 


-- test query option chain 

testOptionChain aSymbol = queryOptionChain ("test"  :: String)
						$ toJSON $ QueryOptionChain "test" "Read" aSymbol []



data TradierMarketDataServer = TradierServer 


instance MarketDataServer TradierMarketDataServer where 
    realtime a = return False
    pollingInterval a = tradierPollingInterval 
    runner i a n t = tradierRunner a n t 


toDouble :: StressValue -> Double 
toDouble (Percentage Positive x) =  fromRational x 
toDouble (Percentage Negative x) =  -1 * (fromRational x)
_                                = 0.0 -- Need to model this better.


updateStressValue :: MarketData -> PortfolioSymbol -> [Stress] -> IO T.Text
updateStressValue a b stress = do 
        m <- return $ (marketDataClose a )
        q <- return $ T.unpack (portfolioSymbolQuantity b)
        qD <- (return (read q :: Double))  `catch` (\x@(SomeException e) -> return 0.0)
        stressM <- return stress 
        symbol <- return $ T.unpack $ portfolioSymbolSymbol b 
        sVT <- Control.Monad.foldM (\sValue s -> 
                case s of 
                    EquityStress (Equity sym) sV -> 
                        if sym == symbol then 
                            return $ sValue + (toDouble sV)
                        else 
                            return sValue
                    _ -> return sValue) 0.0 stressM 
        Logger.debugM iModuleName $ "Total stress " `mappend` (show sVT)
        return $ T.pack $ show (m * qD * (1 - sVT))



-- Refactoring note: move this to market data api.
tradierPollingInterval :: IO Int 
tradierPollingInterval = getEnv("TRADIER_POLLING_INTERVAL") >>= \x -> return $ parse_time_interval x


-- The method is too complex. Need to fix it. 
-- Get all the symbols for the users portfolio,
-- Send a portfolio update : query the portfolio object
-- get the uuid and then map over it.

tradierRunner :: App -> WSConn.Connection -> T.Text -> Bool -> IO ()
tradierRunner app conn nickName terminate = 
    if(terminate == True) then do 
        Logger.infoM iModuleName "Market data thread exiting" 
        return ()
    else do 
        Logger.debugM iModuleName "Waiting for data"
        tradierPollingInterval >>= \x -> threadDelay x        
        mySymbols <- Portfolio.queryUniqueSymbols nickName
        marketDataMap <- MarketDataAPI.queryMarketData
        portfolioIds <- Control.Monad.mapM (\p -> return $ portfolioSymbolPortfolio p) mySymbols
        pSet <- return $ Set.fromList portfolioIds
        portfoliom  <- Control.Monad.mapM (\x -> do 
                        p <- dbOps $  DB.get x 
                        case p of 
                            Just x2 -> return (x, portfolioUuid x2)
                            Nothing -> return (x, "INVALID PORTFOLIO")) 
                        (Set.toList pSet)
        portfolioMap <- return $ Map.fromList portfoliom
        upd <- Control.Monad.mapM (\x -> do 
                activeScenario <- liftIO $ atomically $ getActiveScenario app nickName 
                Logger.infoM iModuleName $ " Active scenario " `mappend` (show activeScenario)
                val <- return $ Map.lookup (portfolioSymbolSymbol x) marketDataMap 
                (stressValue, p) <- case val of 
                        Just v -> do 
                            c <- updateStressValue v x activeScenario
                            return (c, x {portfolioSymbolValue = T.pack $ show $ 
                            		(marketDataClose v) * 
                            			(read $ (T.unpack $ portfolioSymbolQuantity x) :: Double)}) 
                        Nothing -> return ("0.0", x)
                x2 <- return $ Map.lookup (portfolioSymbolPortfolio x) portfolioMap 
                pid <- case x2 of 
                    Nothing -> return "INVALID PORTFOLIO" 
                    Just y -> return y                  
                return $ daoToDto PortfolioSymbol.P_Update pid 
                            nickName nickName nickName p stressValue
            ) mySymbols

        Control.Monad.mapM_  (\p -> do
                liftIO $ Logger.debugM iModuleName ("test" `mappend` (show $ Util.serialize p))
                delay <- tradierPollingInterval
                liftIO $ threadDelay $ delay
                liftIO $ WSConn.sendTextData conn (Util.serialize p) 
                return p 
                ) upd 
        tradierRunner app conn nickName False



