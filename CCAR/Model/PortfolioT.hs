module CCAR.Model.PortfolioT 
	(PortfolioT(..)
	, PortfolioQuery(..)
	, CompanyID(..)
	, NickName(..)
	, PortfolioUUID(..)
	, CRUD(..)) where 

import Data.Aeson
import Data.Aeson.Types
import Control.Applicative as Appl ((<*>), (<$>), empty, pure)
import Data.Text as T 
import Data.Typeable
import Data.Data
import GHC.Generics
import CCAR.Main.DBUtils
import Data.Monoid
-- Data types


data CRUD = Create | Read | P_Update | Delete 
	deriving(Show, Read, Eq, Data, Generic, Typeable)

newtype PortfolioUUID = PortfolioUUID {unP :: T.Text} 
	deriving (Show, Read, Eq, Data, Generic, Typeable)

newtype CompanyID = CompanyID {unC :: T.Text}
	deriving (Show, Read, Eq, Data, Generic, Typeable) 

instance ToJSON CRUD 
instance FromJSON CRUD
instance ToJSON CompanyID 
instance FromJSON CompanyID
instance ToJSON NickName 
instance FromJSON NickName


data PortfolioT = PortfolioT {
	crudType :: CRUD
	, portfolioId :: PortfolioUUID
	, companyId :: CompanyID
	, userId :: NickName
	, summary :: T.Text 
	, createdBy :: NickName
	, updatedBy :: NickName
} deriving(Show, Read, Eq, Data, Generic, Typeable)


data PortfolioQuery = PortfolioQuery {
	pqCommandType :: T.Text
	, pqNickName :: NickName
	, qCompanyId :: CompanyID 
	, qUserId :: NickName
	, resultSet :: [Either T.Text PortfolioT]
} deriving (Show, Read, Eq, Data, Generic, Typeable)

instance ToJSON PortfolioUUID 
instance FromJSON PortfolioUUID
instance ToJSON PortfolioQuery where 
	toJSON pq@(PortfolioQuery cType nickName qCid userId r) = 
		object [
			"commandType" .= cType 
			, "nickName" .=  unN nickName 
			, "companyId" .= unC qCid 
			, "userId"  .= unN userId 
			, "resultSet" .= r
		]

{-- Notes about the parentheses: 
	I could not get the function to compile without
	explicitly adding parentheses. 
	This is one way to unwrap values into a newtype.
 --}
instance FromJSON PortfolioQuery where 
	parseJSON (Object a)  = PortfolioQuery <$> 
					a .: "commandType" <*> 
					(NickName <$>  a .: "nickName"  ) <*> 
					(CompanyID <$> a .: "companyId" ) <*> 
					(NickName <$> a .: "userId" 	)<*> 
					a .: "resultSet"
	parseJSON _ 		 = Appl.empty

instance ToJSON PortfolioT where
	toJSON p1@(PortfolioT c p c1 u s cr up) =
		object [
			"crudType" .= c 
			, "portfolioId" .= (unP p) 
			, "companyId" .= (unC c1) 
			, "userId" .= (unN u) 
			, "summary" .= s 
			, "createdBy" .=  (unN cr)
			, "updatedBy" .= (unN up)
			, "commandType" .= ("ManagePortfolio" :: T.Text)
		]

instance FromJSON PortfolioT where
	parseJSON (Object a) = do 
			cr <- a .: "crudType" 
			p <- a .: "portfolioId" >>= return . PortfolioUUID
			c <- a .: "companyId" >>= return . CompanyID 
			u <- a .: "userId" >>= return . NickName
			summ <- a .: "summary"
			cre <- a .: "createdBy" >>= return . NickName
			upd <- a .: "updatedBy" >>= return . NickName 
			return $ PortfolioT cr p c u summ cre upd			
{-
		PortfolioT <$>
				a .: "crudType" <*>
				a .: "portfolioId" <*>
				a .: "companyId" <*> 
				a .: "userId" <*>
				a .: "summary" <*>
				a .: "createdBy" <*>
				a .: "updatedBy" -}
	parseJSON _ 	= Appl.empty  

instance Monoid PortfolioUUID where 
	mappend (PortfolioUUID p1) (PortfolioUUID p2) = PortfolioUUID (p1 <> p2)
	mempty = PortfolioUUID ""

testParse :: Result PortfolioT
testParse =  parse parseJSON testtoJson

testtoJson = toJSON $ PortfolioT Create (PortfolioUUID "1") 
					(CompanyID "test") 
					(NickName "test") ("test") (NickName "test") (NickName "test")