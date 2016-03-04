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
import Data.List as List
import Control.Monad.Trans.Maybe
import Control.Monad.IO.Class
import Control.Monad.Trans(lift)
import Control.Monad.Trans.Resource(runResourceT)

readLines :: (Monad m, MonadIO m) => Conduit BS.ByteString m (Either ParseError [String])
readLines = do 
	client <- await 
	case client of 
		Nothing -> return () 
		Just aByteString -> do 
			yield $ CSVParser.parseLine $ BS.unpack aByteString 
			readLines

saveLine :: (Monad m, MonadIO m) => Conduit (Either ParseError [String]) m (ByteString)
saveLine =  do 
	client <- await 
	case client of 
		Nothing -> return () 
		Just a -> do 
			liftIO $ putStrLn $ show a
			case a of 
				Right x -> do 
					_ <- liftIO $ persistEquityBenchmark (T.pack $ x !! 0) (T.pack $ x !! 1)
					return x
			yield $ BS.pack $ (show a) ++ "\n"
			saveLine
deleteLine :: (Monad m, MonadIO m) => Conduit (Either ParseError [String]) m (ByteString)
deleteLine = do 
	client <- await
	case client of 
		Nothing -> return()
		Just oString -> do 
			case oString of 
				Right x -> do
						sym <- return . T.pack $ x !! 0
						ben <- return . T.pack $ x !! 1 
						_ <- liftIO $ unpersistEquityBenchmark sym ben
						return x 
			yield $ BS.pack $ (show oString) ++ "\n"
			deleteLine 



type Symbol = T.Text
type Benchmark = T.Text
persistEquityBenchmark ::  Symbol -> Benchmark -> IO (Maybe Symbol)
persistEquityBenchmark s b = dbOps $ do 
	x <- runMaybeT $ do 
		Nothing <- lift $ getBy $ UniqueBenchmark s b 
		_ <- lift $ DB.insert $ EquityBenchmark s b 
		return s
	return x

-- unpersistEquityBenchmark :: Symbol -> Benchmark -> 
unpersistEquityBenchmark = \sym ben -> dbOps $ 
								DB.deleteBy $ UniqueBenchmark sym ben

setupBenchmarkFile aFileName = runResourceT $ 
	B.sourceFile aFileName $$ B.lines =$= readLines =$= saveLine =$ consume


startup = do 
	dataDirectory <- getEnv("DATA_DIRECTORY")
	equityBenchmarkFile <- getEnv("EQUITY_BENCHMARK_FILE");
	setupBenchmarkFile $ List.intercalate "/" [dataDirectory, equityBenchmarkFile]