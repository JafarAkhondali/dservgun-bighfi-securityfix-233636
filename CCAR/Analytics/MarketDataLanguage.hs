module CCAR.Analytics.MarketDataLanguage 
	(evalMDL, getHistoricalPrice)

where
import Import
import Data.Text as T
import Data.Time 
import CCAR.Main.DBUtils
import Database.Persist
import Data.Monoid((<>))
import Data.List as List
import Data.Map as Map 
import Data.Set as Set
import Data.Aeson
import GHC.Generics
import Data.Data
import Data.Typeable
import Control.Applicative((<$>), (<*>), pure)
import Control.Monad.IO.Class(liftIO)
import Control.Monad
import Control.Monad.Logger(runStderrLoggingT)
import Control.Monad.Trans
import Control.Monad.Trans.Reader
import Control.Monad.Trans.Maybe(runMaybeT)
import Control.Monad.Trans.State as State
import Data.Monoid ((<>))
import CCAR.Main.Util as Util (parse_float)
import Data.Time as Time

data QueryContainer = QueryContainer {
	commandType :: T.Text
	, query :: [MarketDataQuery]
} deriving(Show, Generic)

{-- fix the data type to accomodate various query strings --}
data MarketDataQuery = MarketDataQuery {
		symbol    :: T.Text
	, 	portfolioId :: T.Text
	, 	resultSet :: [HistoricalPrice]
}deriving (Show, Generic)


instance ToJSON QueryContainer
instance FromJSON QueryContainer
instance ToJSON MarketDataQuery
instance FromJSON MarketDataQuery



-- | Market data language 
-- | This is more of a query language.
-- | select historical for a portfolio_id 
-- | select beta for a portfolio
-- | select market_data for a symbol (generic query)
-- | select risk on portfolio
-- | current implies that the current borrowing rate
-- | compute risk on portfolio using interest rate = current
-- | The following computation returns a bunch of risks on portofolios assuming
-- | the interval
-- | compute risk_aggregate on portfolio with interst_rates [min, max, step]
-- | Since the rate of return could be a function of a users credit score,
-- | compute risk based on the users credit score.
-- | compute risk on portfolio using credit score


parseEquityHistorical = do 
	_ <- string "select" 
	skipMany1 space
	_ <- string "historical" 
	skipMany1 space 
	_ <- string "for" 
	skipMany1 space 
	symbol <- many1 alphaNum
	return $ MarketDataQuery (T.pack symbol) (T.empty) []



parseExpr :: Parser MarketDataQuery
parseExpr = parseEquityHistorical



parseStatements :: Parser[MarketDataQuery]
parseStatements = do            
            x <- endBy parseExpr eol
            return x

eol :: Parser String
eol = do 
    try (string ";\n")
    <|> try (string ";")

parseMDL :: Text -> [MarketDataQuery]
parseMDL input = case parse parseStatements "Error parsing historical" 
			(T.unpack input) of 
	Left err -> [] 
	Right val -> val 


getHistoricalPrice :: T.Text -> IO [HistoricalPrice]
getHistoricalPrice v = do 
	y <- dbOps $ selectList [HistoricalPriceSymbol ==. (v)] [Desc HistoricalPriceDate]
	return $ List.map (\a@(Entity x z) -> z) y


computePrice :: UTCTime -> PortfolioSymbol -> Map (T.Text, UTCTime) HistoricalPrice -> Double
computePrice aDate pSymbol aMap = 
	toDouble $ (pure (\x -> parsedQty * (historicalPriceClose x)))  <*> item
	where 
		item = Map.lookup (key pSymbol aDate) aMap
		key a aDate = (portfolioSymbolSymbol a, aDate)
		parsedQty = Util.parse_float . T.unpack $ portfolioSymbolQuantity pSymbol 
		toDouble :: Maybe Double -> Double 
		toDouble Nothing = 0.0
		toDouble (Just x) = x


evalP :: [PortfolioSymbol] -> UTCTime -> Map(T.Text, UTCTime) HistoricalPrice -> ([PortfolioSymbol], UTCTime, Double)
evalP pS aDate aMap = (pS, aDate, val)
					where 
						val = List.foldl' (\acc ele -> acc + (computePrice aDate ele aMap)) 0 pS

evalPortfolio :: [PortfolioSymbol] -> Set UTCTime -> Map (T.Text, UTCTime) HistoricalPrice -> [([PortfolioSymbol], UTCTime, Double)]
evalPortfolio portfolios dates ref  = Prelude.map (\x -> evalP portfolios x ref) (Set.elems dates)

mkMap :: [HistoricalPrice] -> Map(T.Text, UTCTime) HistoricalPrice
mkMap p = Map.fromList $ fmap (\x -> ((historicalPriceSymbol x, historicalPriceDate x), x)) p


--getSymbols :: forall (m :: * -> *) . MonodIO m => Key Portfolio -> Control.Monad.Trans.Reader.ReaderT [SqlBackend] m [PortfolioSymbol]
getSymbols aPortfolio = do 
	backEnd <- ask
	portfolioSymbolQuery <- selectList [PortfolioSymbolPortfolio ==. aPortfolio] []
	mapM (\a@(Entity _ y) -> return y) portfolioSymbolQuery

computeHistoricalPrice :: T.Text -> IO ([Key MarketDataProvider], [([PortfolioSymbol], UTCTime, Double)])
computeHistoricalPrice aPortfolio = dbOps $ do
	x <- runMaybeT $ do 
		Just (Entity x val) <- lift $ getBy $ UniquePortfolio aPortfolio
		portfolioSymbolQuery <- lift $ getSymbols x
		historicalPrices <- mapM (liftIO . getHistoricalPrice . portfolioSymbolSymbol) 
									portfolioSymbolQuery >>= return . Prelude.concat
		dates <- mapM (\x -> return $ historicalPriceDate x) 
							historicalPrices >>= return . Set.fromList
		provider <- mapM (return . historicalPriceDataProvider) historicalPrices
		let priceMap = mkMap historicalPrices
		return $ (provider, evalPortfolio portfolioSymbolQuery dates priceMap)

	case x of 
		Nothing -> return ([], [])
		Just x -> return x



data PrevState = PrevState {h :: HistoricalPrice}

{-- The uuid for the portfolio. --}
portfolioValue :: T.Text -> IO [HistoricalPrice]
portfolioValue aPortfolio = do 
	(providerSet, x) <- computeHistoricalPrice aPortfolio
	currentTime <- getCurrentTime
	provider <- return $ List.head $ providerSet
	mapM (\(_:_, time, price) -> return $ HistoricalPrice aPortfolio time 0.0 price 0.0 0.0 0 currentTime provider) x


{-- TOdO: Fix this file, the functions can be written better. --}
{-- TODO: Fix the inefficiency here: port sum is being computed everytime user queries for historical data.--}
evalMDL :: Text -> Text -> IO QueryContainer
evalMDL input portfolioId = do 
	l <- return $ parseMDL input
	indStocks <- mapM (\x -> do 
		 y <- getHistoricalPrice $ symbol x 
		 return x {resultSet = y, portfolioId = portfolioId}
		 ) l
	pV <- portfolioValue portfolioId

	return $ QueryContainer (T.pack "QueryMarketData") $ 
				[MarketDataQuery portfolioId portfolioId $ List.reverse pV]
				<> indStocks

