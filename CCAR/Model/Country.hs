module CCAR.Model.Country 
	( 
		setupCountries
		, cleanupCountries
		, startup
	)
where

import Control.Monad.IO.Class 
import Control.Monad
import Control.Monad.Logger 
import Control.Monad.Trans(lift)
import Control.Monad.Trans.Maybe
import Control.Monad.Trans.Resource
import Control.Applicative as Appl
import Database.Persist
import Database.Persist.Postgresql as Postgresql 
import Database.Persist.TH 
import CCAR.Main.DBUtils
import CCAR.Command.ApplicationError 
import Data.List as List(intercalate)
import Data.Text as T 
import qualified CCAR.Main.EnumeratedTypes as EnumeratedTypes 
import qualified CCAR.Main.GroupCommunication as GC
import Data.Aeson
import Data.Aeson.Encode as En
import Data.Aeson.Types as AeTypes(Result(..), parse)
import Data.Monoid
import Data.Text.Lazy.Encoding as E
import Data.Text.Lazy as L 

import GHC.Generics
import Data.Data
import Data.Typeable 
import Data.Time
import CCAR.Main.Util 
import System.Log.Logger as Logger
import CCAR.Parser.CSVParser as CSVParser(parseCSV, ParseError, parseLine)
import System.IO 
import System.Environment(getEnv)
import Data.Conduit ( ($$), (=$=), (=$), Conduit, await, yield)
import Data.Conduit.Binary as B (sinkFile, lines, sourceFile) 
import Data.Conduit.List as CL 
import Data.ByteString.Char8 as BS(ByteString, pack, unpack) 




parseLine :: (Monad m, MonadIO m) => Conduit BS.ByteString m (Either ParseError [String])
parseLine = do 
	client <- await 
	case client of 
		Nothing -> return () 
		Just aBS -> do 
				yield $ CSVParser.parseLine $ BS.unpack aBS
				CCAR.Model.Country.parseLine 
 
saveLine :: (MonadIO m) => Conduit (Either ParseError [String]) m ByteString
saveLine = do 
	client <- await 
	case client of 
		Nothing -> return () 
		Just oString -> do 
			case oString of 				
				Right x -> do 
					_ <- liftIO $ insertLine x			
					return x
			yield $ BS.pack  $ (show oString) ++ "\n"
			saveLine 

deleteLine ::(MonadIO m) => Conduit (Either ParseError [String]) m ByteString
deleteLine  = do 
	client <- await 
	case client of 
		Nothing -> return () 
		Just oString -> do 
			case oString of 				
				Right x -> do 
					_ <- liftIO $ removeLine x			
					return x

			yield $ BS.pack  $ (show oString) ++ "\n"
			deleteLine 


conduitBasedSetup aFileName = runResourceT $ 
	B.sourceFile aFileName 
	$$ B.lines =$= CCAR.Model.Country.parseLine =$= saveLine =$ consume

conduitBasedDelete aFileName = runResourceT $ 
	B.sourceFile aFileName 
		$$ B.lines =$= CCAR.Model.Country.parseLine =$= deleteLine =$ consume


data CRUD = Create | Read | C_Update | Delete
    deriving(Show, Eq, Read, Data, Generic, Typeable)



type ISO_3 = T.Text 
type ISO_2 = T.Text 
type Name = T.Text 
type Domain = T.Text 

add :: ISO_3 -> ISO_2 -> Name -> Domain -> IO (Maybe ISO_3)
add a b c d = dbOps $ do 
	runMaybeT $ do 
		Nothing <- lift $ getBy $ UniqueISO3 a 
		lift $ insert $ Country c a b d 
		return a 

remove aCountryCode	= dbOps $ deleteBy $ UniqueISO3 aCountryCode


iModuleName = "CCAR.Model.Country"

removeLine aLine = remove (T.pack $ aLine !! 2)

insertLine aLine =  
	add (T.pack $ aLine !! 2) 
		(T.pack $ aLine !! 1) 
		(T.pack $ aLine !! 3) 
		(T.pack $ aLine !! 4)



deleteCountries = conduitBasedDelete
setupCountries = conduitBasedSetup
cleanupCountries aFileName = conduitBasedDelete
	


startup = do 
	dataDirectory <- getEnv("DATA_DIRECTORY");
	countryFile <- getEnv("COUNTRY_FILE");
	setupCountries $ List.intercalate "/" [dataDirectory, countryFile]