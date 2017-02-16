module CCAR.Model.PortfolioSymbol (
	manage
	, readPortfolioSymbol
	, manageSearch
	, daoToDto
	, daoToDtoDefaults
	, testInsert
	, testInsertNew 
	, CRUD(..)
	, PortfolioSymbolT(..)
	, getPortfolioSymbols
	) where 
import CCAR.Main.DBUtils
import GHC.Generics
import Data.Aeson 																as J
import Yesod.Core

import Data.List 																as DList
import Data.Monoid
import CCAR.Model.Portfolio 													as Portfolio (queryPortfolioUUID)
import CCAR.Model.PortfolioT
import Control.Monad.Reader
import Control.Monad.IO.Class													(liftIO)
import Control.Concurrent
import Control.Concurrent.STM.Lifted
import Control.Concurrent.Async
import Control.Exception
import qualified  Data.Map 														as IMap
import Control.Exception
import Control.Monad
import Control.Monad.Trans
import Control.Monad.Trans.Maybe
import Control.Monad.Trans.Either
import Control.Monad.Logger														(runStderrLoggingT)
import Network.WebSockets.Connection 											as WSConn
import Data.Text 																as T
import Data.Text.Lazy 															as L 

import Data.Text.Lazy.Encoding 													as E
import Data.HashMap.Lazy 														as LH (HashMap, lookup)
import Control.Applicative 														as Appl
import Data.Aeson.Encode 														as En
import Data.Aeson.Types 														as AeTypes(Result(..), parse)

import Database.Persist 
import Database.Persist.Postgresql 												as DB
import Database.Persist.TH

import GHC.Generics
import GHC.IO.Exception
import Data.List 																as List hiding(insert, delete)

import Data.Data
import Data.Monoid (mappend)
import Data.Typeable 
import System.IO
import Data.Time
import Data.UUID.V1
import Data.UUID as UUID
import qualified CCAR.Main.EnumeratedTypes										as EnTypes 
import qualified CCAR.Main.GroupCommunication 									as GC
import CCAR.Main.Util as Util
import CCAR.Command.ApplicationError
import Database.Persist.Postgresql 												as Postgresql 
-- For haskell shell
import HSH
import System.IO(openFile, writeFile, IOMode(..))
import System.Log.Logger as Logger




iModuleName = "CCAR.Model.PortfolioSymbol"
managePortfolioSymbolCommand = "ManagePortfolioSymbol"
manageSearchPortfolioCommand = "QueryPortfolioSymbol"
			

data PortfolioSymbolT = PortfolioSymbolT {
	  pstCrudType :: CRUD
	, commandType :: T.Text 
	, portfolioID :: T.Text -- unique uuid for the portfolio
	, symbol :: T.Text 
	, quantity :: T.Text 
	, side :: EnTypes.PortfolioSymbolSide 
	, symbolType :: EnTypes.PortfolioSymbolType 
	, value :: T.Text
	, stressValue :: T.Text
	, createdBy :: T.Text 
	, updatedBy :: T.Text 
	, pSTNickName :: T.Text
} deriving (Show, Read, Eq, Data, Generic, Typeable)



instance ToJSON PortfolioSymbolT where 
	toJSON pS1@(PortfolioSymbolT crType coType portId symbol quantity side symbolType value 
						sVal cr up nickName)= 
			object [
				"crudType" .= crType
				, "commandType" .= coType 
				, "portfolioId" .= portId 
				, "symbol" .= symbol 
				, "quantity" .= quantity
				, "side" .= side 
				, "symbolType" .= symbolType 
				, "value" .= value
				, "stressValue" .= sVal
				, "creator" .= cr 
				, "updator" .= up 
				, "nickName" .= nickName
			]

instance FromJSON PortfolioSymbolT where 
	parseJSON (Object a ) = PortfolioSymbolT <$> 
			a .: "crudType" <*>
			a .: "commandType" <*>
			a .: "portfolioId" <*> 
			a .: "symbol" <*> 
			a .: "quantity" <*>
			a .: "side" <*> 
			a .: "symbolType" <*>
			a .: "value" <*>
			a .: "stressValue" <*>
			a .: "creator" <*> 
			a .: "updator" <*>
			a .: "nickName" 

	parseJSON _ = Appl.empty




data PortfolioSymbolQueryT = PortfolioSymbolQueryT {
	qCommandType :: T.Text 
	, qPortfolioID :: T.Text
	, psqtResultSet :: [Either T.Text PortfolioSymbolT]
	, psqtNickName :: T.Text 
} deriving (Show, Read, Eq, Data, Generic, Typeable)

instance ToJSON PortfolioSymbolQueryT where 
	toJSON qp@(PortfolioSymbolQueryT cType pID rS nickName) = 
			object [
				"nickName" .= nickName
				, "portfolioId" .= pID
				, "commandType" .= cType
				, "resultSet" .= rS
			]
instance FromJSON PortfolioSymbolQueryT where
	parseJSON (Object a) = PortfolioSymbolQueryT <$> 
								a .: "commandType" <*> 
								a .: "portfolioId" <*> 
								a .: "resultSet" <*> 
								a .: "nickName"
	parseJSON _ 	= Appl.empty



getLatestPrice :: T.Text -> IO [HistoricalPrice]
getLatestPrice v = do 
	y <- dbOps $ selectList [HistoricalPriceSymbol ==. (v)] [Desc HistoricalPriceDate, LimitTo 1]
	return $ List.map (\a@(Entity x z) -> z) y


getPortfolioSymbolsM :: PortfolioUUID -> MaybeT IO [(T.Text, Double)]
getPortfolioSymbolsM = \p -> do 
	Just (Entity pID pValue) <- liftIO . dbOps . getBy . UniquePortfolio . unP $ p 
	entList <- liftIO $ dbOps $ selectList [PortfolioSymbolPortfolio ==. pID] [Asc PortfolioSymbolSymbol] 
	return $ Prelude.map (\a@(Entity k value) -> (portfolioSymbolSymbol value
												 , Util.parse_float $ T.unpack $ 
												 		portfolioSymbolQuantity value)) entList


-- | Return portfolio symbols for a given portfolio UUID.
getPortfolioSymbols :: PortfolioUUID -> IO (Either T.Text [(T.Text, Double)])
getPortfolioSymbols pUUID = dbOps $ do
	result <- runMaybeT $ do 
			Just (Entity pID pValue) <- lift . getBy . UniquePortfolio . unP $ pUUID 
			entList <- lift $ selectList [PortfolioSymbolPortfolio ==. pID] [Asc PortfolioSymbolSymbol] 
			return $ Prelude.map (\a@(Entity k value) -> (portfolioSymbolSymbol value
														 , Util.parse_float $ T.unpack $ 
														 		portfolioSymbolQuantity value)) entList
	return $ processError result $ T.intercalate ":" 
					$ ["Error processing getPortfolioSymbols" , unP pUUID]


queryPortfolioSymbolM :: PortfolioSymbolQueryT -> MaybeT IO PortfolioSymbolQueryT
queryPortfolioSymbolM p@(PortfolioSymbolQueryT cType 
						pUUID 
						resultSet
						nickName) = do 
	Just(Entity portfolioId pValue) <- liftIO $ dbOps $ getBy $ UniquePortfolio pUUID
	portfolioSymbolList <- liftIO $ dbOps $ selectList [PortfolioSymbolPortfolio ==. portfolioId] []
	portfolioSymbolListT  <- liftIO $ mapM (\(Entity k pS) -> dbOps $ do 
			creator <- get $ portfolioSymbolCreatedBy pS  
			updator <- get $ portfolioSymbolUpdatedBy pS  
			case(creator, updator) of 
				(Just cr, Just upd ) -> 
					return $ daoToDto Read 
						pUUID 
						(personNickName cr) 
						(personNickName upd)
						nickName
						pS "0.0") portfolioSymbolList
	return $ p {psqtResultSet = portfolioSymbolListT}


queryPortfolioSymbol' :: PortfolioSymbolQueryT -> EitherT T.Text IO PortfolioSymbolQueryT 
queryPortfolioSymbol' p = 
	do 
		computation <- liftIO $ runMaybeT $ queryPortfolioSymbolM p 
		let r = 
			case computation of 
				Nothing -> Left $ "Unable to query portfolio for " <> (T.pack . show $ p)
				Just x -> Right x
		hoistEither r

queryPortfolioSymbol :: PortfolioSymbolQueryT -> IO (Either T.Text PortfolioSymbolQueryT)
queryPortfolioSymbol p = runEitherT $ queryPortfolioSymbol' p

dtoToDao :: PortfolioSymbolT -> IO PortfolioSymbol 
dtoToDao = undefined



daoToDtoDefaultsT :: T.Text -> PortfolioSymbol -> EitherT T.Text IO PortfolioSymbolT 
daoToDtoDefaultsT nickName pS = 
	do 
	portfolioUUID <- liftIO $ Portfolio.queryPortfolioUUID $ portfolioSymbolPortfolio pS
	hoistEither $ 
		case portfolioUUID of 
			Right pUUID -> daoToDto P_Update pUUID nickName nickName nickName pS "0.0"
			Left y -> Left y

-- A default CRUD convertor for portfolio symbol. This hits the database.
daoToDtoDefaults :: T.Text -> PortfolioSymbol -> IO (Either T.Text PortfolioSymbolT)
daoToDtoDefaults n p = runEitherT $ daoToDtoDefaultsT n p


daoToDto :: CRUD -> T.Text -> T.Text -> T.Text -> T.Text -> PortfolioSymbol -> T.Text -> (Either T.Text PortfolioSymbolT) 
daoToDto crudType pUUID creator updator currentRequestor 
			p@(PortfolioSymbol pID symbol quantity side symbolType value cB cT uB uT ) sVal = 
				Right $ PortfolioSymbolT crudType
								managePortfolioSymbolCommand 
								pUUID symbol (quantity) side symbolType
								value sVal
								creator updator currentRequestor


manageSearch :: NickName -> Value -> IO (GC.DestinationType, T.Text) 
manageSearch aNickName aValue@(Object a) = 
	case (fromJSON aValue) of 
		Success r -> do 
				result <- queryPortfolioSymbol r 
				return (GC.Reply, serialize result) 
		Error s -> return (GC.Reply, serialize $ appError $
							"Error processing manage search for portfolio symbol: "  ++ s)


computePortfolioWith :: T.Text -> Double -> IO Double 
computePortfolioWith s v = do 
		lastPriceList<- getLatestPrice s 
		return $ 
			DList.foldr (\e s -> s + (pVal e)) 0.0 $ DList.take 1 lastPriceList
			where 
				pVal e = v * (historicalPriceClose e)

computePortfolio :: PortfolioSymbol -> IO PortfolioSymbol 
computePortfolio  = \x -> do
		let pValue = Util.parse_float $ T.unpack $ portfolioSymbolQuantity x 
		pV <- computePortfolioWith (portfolioSymbolSymbol x) pValue
		return $ x {portfolioSymbolValue = T.pack . show $ pV}


-- create, read , update and delete operations
manage :: NickName -> Value -> IO (GC.DestinationType, T.Text)
manage aNickName aValue@(Object a) = 
	case (fromJSON aValue) of
		Success r -> do 
			res <- process r  
			case res of
				Right (k, (creator, updator, portfolioUUID)) -> do 
					case (pstCrudType r) of 
						Delete -> do 
							reply <- return $ Right r 
							return (GC.Reply, serialize (reply :: Either T.Text PortfolioSymbolT))
						_ 	   -> do 
							portfolioEntity <- dbOps $ get k 
							case portfolioEntity of 
								Just pEVa -> do 
										x <- computePortfolio pEVa							
										res1 <- return $ daoToDto (pstCrudType r) 
											portfolioUUID
											creator
											updator 
											(unN aNickName)
											x "0.0"
										case res1 of 
											Right pT -> return (GC.Reply, serialize res1)
											Left f -> do 
												liftIO $ Logger.errorM iModuleName $ 
													"Error processing manage portfolio " `mappend` (show aValue)
												return (GC.Reply, serialize $ appError $ 
													"Error processing manage portfolio " ++ (T.unpack f))
				Left p2 -> do
							liftIO $ Logger.errorM iModuleName $ 
								"Error processing manage portfolio " `mappend` (show aValue)
							return (GC.Reply, serialize $ appError $ 
								"Error processing manage portfolio " ++ (T.unpack p2))
		Error s -> 
				return (GC.Reply, serialize $ 
							appError $ 
								"Error processing manage portfolio symbol " ++ s)

process :: PortfolioSymbolT -> IO (Either T.Text (Key PortfolioSymbol, (T.Text, T.Text, T.Text)))
process pT = case (pstCrudType pT) of 
	Create -> insertPortfolioSymbol pT 
	Read -> readPortfolioSymbol pT -- single record
	P_Update -> updatePortfolioSymbol pT 
	Delete -> deletePortfolioSymbol pT 		

type P_Creator = T.Text
type P_Updator = T.Text 
type P_PortfolioId = T.Text



insertPortfolioSymbol :: PortfolioSymbolT -> IO (Either T.Text (Key PortfolioSymbol, (P_Creator, P_Updator, P_PortfolioId)))
insertPortfolioSymbol a@(PortfolioSymbolT crType commandType 
								portfolioId 
								symbol 
								quantity
								side 
								symbolType
								value
								sVal 
								creator
								updator
								requestor			
						)
						 = do 
				portfolioSymbol <- liftIO $ readPortfolioSymbol a 
				case portfolioSymbol of 
					Right _ -> do 
						liftIO $ Logger.errorM iModuleName 
								$ "Portfolio symbol exists. Updating the record, because we have the record:"
									`mappend` (show a)
						updatePortfolioSymbolI portfolioSymbol a 
					Left _ -> dbOps $ do 
						portfolio <- getBy $ UniquePortfolio portfolioId 
						currentTime <- liftIO $ getCurrentTime
						case portfolio of 
							Just (Entity pID pValue) -> do 
								cr <- getBy $ UniqueNickName creator
								up <- getBy $ UniqueNickName updator 
								req <- getBy $ UniqueNickName requestor 
								case (cr, up, req) of 
									(Just (Entity crID crValue), Just (Entity upID upValue), Just (Entity reqID reqValue)) -> do 
											let pS = PortfolioSymbol pID symbol 
														(quantity) 
														side symbolType 
														"0.0"
														crID currentTime upID currentTime
											portfolioSymbol <- liftIO $ computePortfolio pS
											n <- Postgresql.insert portfolioSymbol
											return $ Right (n, (creator, updator, portfolioId))
									_ -> do 
										liftIO $ Logger.errorM iModuleName $ 
													"Error processing manage portfolio symbol " `mappend` (show a)
										return  $ Left $ T.pack $ "Insert failed " `mappend` (T.unpack portfolioId)
							Nothing -> return $ Left $ T.pack $ "Portfolio not found " `mappend` 
																(T.unpack portfolioId)

updatePortfolioSymbolI portfolioSymbol a@(PortfolioSymbolT crType commandType 
								portfolioId 
								symbol 
								quantity
								side 
								symbolType
								value
								sVal  
								creator
								updator
								requestor) = dbOps $ do 
			currentTime <- liftIO $ getCurrentTime
			liftIO $ Logger.debugM iModuleName $ "Updating portfolio " <> (show a)
			case portfolioSymbol of 
				Right (psID, _) -> do 
								pS <- Postgresql.get psID
								case pS of 
									Just y -> do
										psV <- liftIO $ computePortfolioWith symbol $ Util.parse_float $ T.unpack quantity
										let psvS = (T.pack . show) psV 
										x <- update psID [PortfolioSymbolQuantity =. quantity
													   , PortfolioSymbolUpdatedOn =. currentTime
													   , PortfolioSymbolValue =. psvS]
										return $ Right (psID, (creator, updator, portfolioId))
									Nothing -> return $ Left "Error updating portfolio symbol" 
				Left x -> do 
					liftIO $ Logger.errorM iModuleName $ "Error updating portfolio symbol " `mappend` (show a) 
					return portfolioSymbol

updatePortfolioSymbol :: PortfolioSymbolT -> IO (Either T.Text (Key PortfolioSymbol, (T.Text, T.Text, T.Text)))
updatePortfolioSymbol a@(PortfolioSymbolT crType commandType 
								portfolioId 
								symbol 
								quantity
								side 
								symbolType 
								value
								sVal 
								creator
								updator
								requestor) = dbOps $ do 
		portfolioSymbol <- liftIO $ readPortfolioSymbol a 
		currentTime <- liftIO $ getCurrentTime
		liftIO $ Logger.debugM iModuleName $ "Updating portfolio symbol " <> (show a)
		case portfolioSymbol of 
			Right (psID, _) -> do 
							x <- update psID [PortfolioSymbolQuantity =. (read $ T.unpack quantity)
										   , PortfolioSymbolUpdatedOn =. currentTime]
							return $ Right (psID, (creator, updator, portfolioId))
			Left x -> do 
				liftIO $ Logger.errorM iModuleName $ "Error updating portfolio symbol " `mappend` (show a) 
				return portfolioSymbol

deletePortfolioSymbol :: PortfolioSymbolT -> IO (Either T.Text (Key PortfolioSymbol, (T.Text, T.Text, T.Text)))
deletePortfolioSymbol a = dbOps $ do
	portfolioSymbol <- liftIO $ readPortfolioSymbol a 
	case portfolioSymbol of 
		Right (psID, _) -> do 
			liftIO $ Logger.debugM iModuleName $ "Deleting portfolio symbol " `mappend` (show psID) 
			_ <- Postgresql.delete psID
			return portfolioSymbol 
		Left x -> do 
			liftIO $ Logger.errorM iModuleName $ "Error deleting portfolio symbol " `mappend` (show a)
			return portfolioSymbol


readPortfolioSymbolM :: PortfolioSymbolT -> MaybeT IO (Key PortfolioSymbol, (T.Text, T.Text, T.Text))
readPortfolioSymbolM a@(PortfolioSymbolT crType commandType 
								portfolioId 
								symbol 
								quantity
								side 
								symbolType 
								value
								sVal  
								creator
								updator
								requestor) = do 
	Just (Entity pID pValue) <- liftIO $ dbOps $ getBy $ UniquePortfolio portfolioId
	Just (Entity psID psValue) <- liftIO $ dbOps $ getBy $ UniquePortfolioSymbol pID symbol symbolType side 
	return (psID, (creator, updator, portfolioId))

readPortfolioSymbol :: PortfolioSymbolT -> IO (Either T.Text (Key PortfolioSymbol, (T.Text, T.Text, T.Text)))
readPortfolioSymbol a = do 
	x <- runMaybeT $ readPortfolioSymbolM a 
	case x of 
		Nothing -> return $ Left $ "Error reading portfolio symbol" 
		Just y -> return $ Right y 

uuidAsString = UUID.toString 



{-- | This method as one could no doubt notice is a much better representation of the same code. --}
testInsert index portfolioID = dbOps $ do 
	x <- runMaybeT $ do 
		Just u <- liftIO nextUUID 
		currentTime <- liftIO getCurrentTime
		Just portfolio <- lift $ get portfolioID 
		Just companyUser <- lift $ get $ portfolioCompanyUserId portfolio 
		Just user <- lift $ get $ companyUserUserId companyUser 
		liftIO $ insertPortfolioSymbol $ PortfolioSymbolT Create 
												managePortfolioSymbolCommand
												(portfolioUuid portfolio)
												{-("ABC" `mappend` (T.pack $ show index))-}
												"ABC"
												"314.14"
												EnTypes.Buy
												EnTypes.Equity
												"0.0"
												"0.0"
												(personNickName user)
												(personNickName user)
												(personNickName user)
	case x of 
		Just x -> return x 
		Nothing -> return $ Left $ "testInsert failed"


{-- | This method is mainly as an example of how non monadic code can create the dreaded 
staircase. --}
testInsertNonM :: Integer -> Key Portfolio -> IO (Either T.Text (Key PortfolioSymbol, (T.Text, T.Text, T.Text))) 
testInsertNonM index portfolioID = dbOps $ do
	u <- liftIO $ nextUUID
	currentTime <- liftIO $ getCurrentTime
	portfolio <- get portfolioID 
	case (portfolio, u) of 
		(Just por, Just uuid) ->  do 
			companyUserE <- get $ portfolioCompanyUserId por 
			case companyUserE of 
				Just cuE -> do 
						user <- get $ companyUserUserId cuE
						case user of 
							Just userFound -> 
								liftIO $ insertPortfolioSymbol $ PortfolioSymbolT Create 
												managePortfolioSymbolCommand
												(portfolioUuid por)
												{-("ABC" `mappend` (T.pack $ show index))-}
												"ABC"
												"314.14"
												EnTypes.Buy
												EnTypes.Equity
												"0.0"
												"0.0"
												(personNickName userFound)
												(personNickName userFound)
												(personNickName userFound)
							Nothing -> return $ Left $ "Test insert failed"
				_	-> return $ Left "testinsert failed"
		_ -> return $ Left $ "testInsert failed"										

testInsertNew :: Show a => a -> Key Portfolio -> MaybeT IO (Key PortfolioSymbol)
testInsertNew index pId = do 
	u <- liftIO nextUUID 			
	currentTime <- liftIO getCurrentTime
	Just portfolio <- liftIO $ dbOps $ get pId 
	Just companyUser <- liftIO $ dbOps $ get $ portfolioCompanyUserId portfolio 
	Just user <- liftIO $ dbOps $ get $ companyUserUserId companyUser 
	Just (Entity userId uIgnore) <- liftIO $ dbOps $ getBy $ UniqueNickName $ personNickName user 
	liftIO $ dbOps $ Postgresql.insert $ 
				PortfolioSymbol pId
					("ABC" `mappend` (T.pack $ show index))
					"314.14"
					EnTypes.Buy
					EnTypes.Equity
					"0.0"
					userId 
					currentTime
					userId
					currentTime

	

