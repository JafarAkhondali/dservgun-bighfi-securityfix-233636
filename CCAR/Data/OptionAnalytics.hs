module OptionAnalytics where

import Data.Bits
import Network.Socket
import Network.BSD
import Data.List as List
import System.IO 
import Data.Text as T
import GHC.Generics
import Data.Data
import Data.Monoid (mappend)
import Data.Typeable 
import Data.Aeson
import CCAR.Main.Util as Util
import CCAR.Parser.CSVParser as CSVParser

data ServerHandle = ServerHandle {
	sHandle :: Handle
}
optionPricer :: HostName -> String -> IO ServerHandle 
optionPricer hostName port = do 
	addrinfos <- getAddrInfo Nothing (Just hostName) (Just port)
	let serverAddr = List.head addrinfos
	sock <- socket (addrFamily serverAddr) 
					Stream defaultProtocol
	setSocketOption sock KeepAlive 1
	connect sock $ addrAddress serverAddr
	h <- socketToHandle sock ReadWriteMode 
	hSetBuffering stdout LineBuffering
	hSetBuffering h (LineBuffering) 
	return $ ServerHandle h 


data OptionPricer = OptionPricer {
	optionSymbol :: T.Text
	, optionType :: T.Text
	, averaging :: T.Text 
	, spotPrice :: Float
	, strikePrice  :: Float
	, riskFreeInterestRate :: Float 
	, dividendYield :: Float
	, volatility :: Float 
	, timeToMaturity :: Float 
	, randomWalks ::  Int 
	, price :: Float
} deriving (Show, Read, Data, Generic, Typeable)

instance ToJSON OptionPricer 
instance FromJSON OptionPricer

closeOptionPricer :: ServerHandle -> IO () 
closeOptionPricer h = hClose (sHandle h)
-- ("TEVA","C","A",100.0,100.0,0.05,0.0,0.2,0.25,1000000,1.0e-20)
testOptionPricer = 
		OptionPricer "TEVA" "C" "A" 
				100.0 100.0 
				0.05 0.0 
				0.2 0.25 
				100000 0.00000000000001

fromCSV:: String -> Either ParseError [String]
fromCSV = \x -> CSVParser.parseLine x

toCSV :: OptionPricer -> String
toCSV (OptionPricer a b c
		d e 
		f g 
		h i 
		j k ) = List.intercalate "|" [show a , show b , show c
				, "" ++ show d, "" ++ show e
				, show f, show g 
				, show h , show i 
				, show j, show k] 
writeOptionPricer :: OptionPricer -> ServerHandle -> IO ()
writeOptionPricer pricer = \ x -> do 
	hPutStrLn (sHandle x) (toCSV pricer)
	hFlush (sHandle x)
	nextString <- hGetLine (sHandle x)
	putStrLn nextString
	hFlush stdout
	writeOptionPricer pricer x