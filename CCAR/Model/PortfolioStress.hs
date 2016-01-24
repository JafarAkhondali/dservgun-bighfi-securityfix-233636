module CCAR.Model.PortfolioStress
	(sectorStress 
	, querySymbolsForSector
	, SectorError
	, makeError)
where 
import CCAR.Model.CcarDataTypes
import CCAR.Main.DBUtils
import GHC.Generics
import Data.Aeson as J
import Yesod.Core
import Data.Time

import Data.Either(rights)
import Control.Monad.IO.Class(liftIO)
import Control.Concurrent
import Control.Concurrent.STM.Lifted
import Control.Concurrent.Async
import Control.Exception
import qualified  Data.Map as IMap
import Control.Exception
import Control.Monad
import Control.Monad.Error
import Control.Monad.Logger(runStderrLoggingT)
import Control.Monad.Trans.Maybe(runMaybeT)
import Control.Monad.Trans.State as State
import Network.WebSockets.Connection as WSConn
import Data.Text as T
import Data.Text.Lazy as L 
import Database.Persist.Postgresql as DB
import Data.Aeson.Encode as En
import Data.Text.Lazy.Encoding as E
import Data.Aeson as J
import Data.HashMap.Lazy as LH (HashMap, lookup)
import Control.Applicative as Appl
import Data.Aeson.Encode as En
import Data.Aeson.Types as AeTypes(Result(..), parse)

import GHC.Generics
import GHC.IO.Exception

import Data.Data
import Data.Monoid (mappend, (<>) )
import Data.Typeable 
import System.IO
import Data.Time
import Data.UUID.V1
import Data.UUID as UUID
import qualified CCAR.Main.EnumeratedTypes as EnTypes 
import qualified CCAR.Main.GroupCommunication as GC
import CCAR.Main.Util as Util
import CCAR.Command.ApplicationError
import Database.Persist.Postgresql as Postgresql 
-- For haskell shell
import HSH
import System.IO(openFile, writeFile, IOMode(..))
import System.Log.Logger as Logger


iModuleName = "CCAR.Model.PortfolioStress"
indexStress :: Stress -> [Stress]
indexStress = undefined

sectorStress :: Stress -> [Stress]
sectorStress = undefined

newtype SectorError = SectorError {message :: T.Text}

instance Error SectorError where 
	noMsg = SectorError "No sector found"
	strMsg = SectorError . (T.pack)


makeError :: T.Text -> SectorError
makeError a = SectorError a



querySymbolsForSector :: T.Text -> IO (Either SectorError [EquitySymbol])
querySymbolsForSector x = do 
	(return . convert) =<<
		(dbOps $ 
			runMaybeT $ do 
				Just (Entity sectorId sectorValue) <- lift $ getBy $ UniqueEquitySector x 
				sectors <- lift $ selectList [EquitySymbolSectorSector ==. sectorId] []
				s <-  lift $ mapM (\x@(Entity k v) -> return v) sectors
				s2 <- lift $ mapM (\x@(EquitySymbolSector x1 y) -> do 
							Just symbol <- Postgresql.get x1
							return symbol) s 
				return s2)
	--return $ convert x



convert :: Maybe a 	-> Either SectorError a 
convert (Just x) 	=  Right x 
convert Nothing  	= Left $ SectorError "Sector Not Found"



