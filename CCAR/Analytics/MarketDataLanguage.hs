module CCAR.Analytics.MarketDataLanguage 
	(evalMDL)

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
import Control.Monad.IO.Class(liftIO)
import Control.Monad
import Control.Monad.Logger(runStderrLoggingT)
import Control.Monad.Trans
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


parseEquityHistorical = do 
	string "select" 
	skipMany1 space
	string "historical" 
	skipMany1 space 
	string "for" 
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


getHistoricalPrice v = dbOps $ do 
	y <- selectList [HistoricalPriceSymbol ==. (v)] [Asc HistoricalPriceDate]
	mapM (\a@(Entity x z) -> return z) y


addTimeSeries ::(UTCTime, Double) -> (UTCTime, Double) -> Maybe (UTCTime, Double)
addTimeSeries (t1, d1) (t2, d2) = do 
	if (t1 == t2) 
		then 
			return (t1, d1 + d2) 
		else 
			Nothing

symbolPriceM :: PortfolioSymbol -> [HistoricalPrice] -> [(HistoricalPrice, Double)]
symbolPriceM a b = 	do 
	x1 <- return $ 
			Prelude.filter(\x -> portfolioSymbolSymbol a == (historicalPriceSymbol x)) b
	Prelude.map (\x -> (x, 
						(historicalPriceClose x) * (quantity a))) x1
					where
						quantity a = Util.parse_float $ 
										T.unpack $ portfolioSymbolQuantity a 


computePrice :: UTCTime -> PortfolioSymbol -> Map (T.Text, UTCTime) HistoricalPrice -> Double
computePrice aDate pSymbol aMap = case Map.lookup (key pSymbol aDate) aMap of 
								Nothing -> 0.0
								Just x -> (Util.parse_float . T.unpack $ 
												portfolioSymbolQuantity pSymbol) * (historicalPriceClose x)
							where 
								key a aDate = (portfolioSymbolSymbol a, aDate)


evalP :: [PortfolioSymbol] -> UTCTime -> Map(T.Text, UTCTime) HistoricalPrice -> ([PortfolioSymbol], UTCTime, Double)
evalP pS aDate aMap = (pS, aDate, val)
					where 
						val = List.foldl' (\acc ele -> acc + (computePrice aDate ele aMap)) 0 pS

evalPortfolio :: [PortfolioSymbol] -> Set UTCTime -> Map (T.Text, UTCTime) HistoricalPrice -> [([PortfolioSymbol], UTCTime, Double)]
evalPortfolio portfolios dates ref  = Prelude.map (\x -> evalP portfolios x ref) (Set.elems dates)

mkMap :: [HistoricalPrice] -> Map(T.Text, UTCTime) HistoricalPrice
mkMap p = Map.fromList $ fmap (\x -> ((historicalPriceSymbol x, historicalPriceDate x), x)) p

getSymbols aPortfolio = do 
	portfolioSymbolQuery <- selectList [PortfolioSymbolPortfolio ==. aPortfolio] []
	mapM (\a@(Entity x y) -> return y) portfolioSymbolQuery

computeHistoricalPrice :: T.Text -> IO ([Key MarketDataProvider], [([PortfolioSymbol], UTCTime, Double)])
computeHistoricalPrice aPortfolio = dbOps $ do
	x <- runMaybeT $ do 
		Just (Entity x val) <- lift $ getBy $ UniquePortfolio aPortfolio
		portfolioSymbolQuery <- lift $ getSymbols x
		historicalPrices <- mapM (\x ->  liftIO $ getHistoricalPrice $ 
											portfolioSymbolSymbol x) 
									portfolioSymbolQuery >>= return . Prelude.concat
		dates <- mapM (\x -> return $ historicalPriceDate x) 
							historicalPrices >>= return . Set.fromList
		provider <- mapM (\x -> return $ historicalPriceDataProvider x) historicalPrices
		let priceMap = mkMap historicalPrices
		return $ (provider, evalPortfolio portfolioSymbolQuery dates priceMap)

	case x of 
		Nothing -> return ([], [])
		Just x -> return x



{-- The uuid for the portfolio. --}
portfolioValue :: T.Text -> IO [HistoricalPrice]
portfolioValue aPortfolio = do 
	(providerSet, x) <- computeHistoricalPrice aPortfolio
	currentTime <- getCurrentTime
	provider <- return $ List.head $ providerSet
	mapM (\(h:_, time, price) -> return $ HistoricalPrice aPortfolio time 0.0 price 0.0 0.0 0 currentTime provider) x



{-- TODO: Fix the inefficiency here: port sum is being computed everytime user queries for historical data.--}
evalMDL input portfolioId = do 
	l <- return $ parseMDL input
	indStocks <- mapM (\x -> do 
		 y <- getHistoricalPrice $ symbol x 
		 return x {resultSet = y, portfolioId = portfolioId}
		 ) l
	pV <- portfolioValue portfolioId
	return $ QueryContainer (T.pack "QueryMarketData") $ 
				indStocks <> [MarketDataQuery portfolioId portfolioId pV]

