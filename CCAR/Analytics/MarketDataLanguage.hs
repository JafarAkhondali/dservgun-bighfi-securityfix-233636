module CCAR.Analytics.MarketDataLanguage 
	(evalMDL)

where
import Import
import Data.Text as T
import Data.Time 
import CCAR.Main.DBUtils
import Database.Persist
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


data QueryContainer = QueryContainer {
	commandType :: T.Text
	, query :: [MarketDataQuery]
} deriving(Show, Generic)
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


getHistoricalPrice aSymbol = dbOps $ do 
	y <- selectList [HistoricalPriceSymbol ==. aSymbol] [Asc HistoricalPriceDate]
	mapM (\a@(Entity x z) -> return z) y


--evaluate :: [Entity PortfolioSymbol] -> Map (T.Text, UTCTime) HistoricalPrice -> UTCTime -> Double
evalPortfolio pS priceMap time = mapM (\x y -> do 				
		h <- Map.lookup (portfolioSymbolSymbol y, time) priceMap 				
		pc <- h 
		-- x `mplus` pc 
		return pc
		) pS 



getSymbols aPortfolio = do 
	portfolioSymbolQuery <- selectList [PortfolioSymbolPortfolio ==. aPortfolio] []
	mapM (\a@(Entity x y) -> return y) portfolioSymbolQuery

computeHistoricalPrice aPortfolio = dbOps $ do
	x <- runMaybeT $ do 
		Just (Entity x val) <- lift $ getBy $ UniquePortfolio aPortfolio
		portfolioSymbolQuery <- lift $ getSymbols x

		-- Get all the symbols
		-- Get all the portfoliosymbols
		-- Get all historical prices for all symbols in a set
		-- Compute portfolio value using price historical set
		portfolioSymbolQuery
	return x 
--evalMDL :: Text -> IO [MarketDataQuery]
evalMDL input portfolioId = do 
	l <- return $ parseMDL input
	l2 <- mapM (\x -> do 
		 y <- getHistoricalPrice $ symbol x
		 return x {resultSet = y, portfolioId = portfolioId}
		 ) l
	return $ QueryContainer (T.pack "QueryMarketData") (l2)

