module CCAR.Data.EquityBenchmark
	(startup) where 

import Data.Text as T
import CCAR.Parser.CSVParser as CSVParser(parseCSV, ParseError, parseLine)
import System.IO 
import System.Environment(getEnv)
import Data.Conduit ( ($$), (=$=), (=$), Conduit, await, yield)
import Data.Conduit.Binary as B (sinkFile, lines, sourceFile) 
import Data.Conduit.List as CL 
import Data.ByteString.Char8 as BS(ByteString, pack, unpack) 
import Database.Persist as DB
import Database.Persist.TH 
import CCAR.Parser.CSVParser as CSVParser(parseCSV, ParseError, parseLine)
import CCAR.Main.DBUtils

import Control.Monad.Trans.Maybe
import Control.Monad.IO.Class
import Control.Monad.Trans(lift)

readLines :: (Monad m, MonadIO m) => Conduit BS.ByteString m (Either ParseError [String])
readLines = undefined
saveLine :: (MonadIO m) => Conduit (Either ParseError [String]) m (ByteString)
saveLine =  undefined
deleteLine :: (MonadIO m) => Conduit (Either ParseError [String]) m (ByteString)
deleteLine = undefined


type Symbol = T.Text
type Benchmark = T.Text
--persistEquityBenchmark ::  Symbol -> Benchmark -> IO EquityBenchmark
persistEquityBenchmark s b = dbOps $ do 
	x <- runMaybeT $ do 
				Nothing <- lift $ getBy $ UniqueBenchmark s b 
				lift $ DB.insert $ EquityBenchmark s b 
				return s
	return x


startup = undefined