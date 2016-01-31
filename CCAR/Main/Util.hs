	{--License: license.txt --}
module CCAR.Main.Util
	(serialize, parseDate, parse_time_interval, parse_float)
where
import Data.Text as T  hiding(foldl, foldr)
import Data.Aeson as J
import Control.Applicative as Appl
import Data.Aeson.Encode as En
import Data.Aeson.Types as AeTypes(Result(..), parse)
import Data.Text.Lazy.Encoding as E
import Data.Text.Lazy as L hiding(foldl, foldr)
import System.Locale as Loc 
import Data.Time
import Network.HTTP.Client as HttpClient
import Numeric
import Text.ParserCombinators.Parsec as Parsec
import Control.Applicative
serialize :: (ToJSON a) => a -> T.Text 
serialize  = L.toStrict . E.decodeUtf8 . En.encode  


parseDate (Just aDate) = parseTime Loc.defaultTimeLocale (Loc.rfc822DateFormat) (aDate)



{--| Reads intervals in millis |--}	 
parse_time_interval input = 
	case Parsec.parse parse_time_interval1 ("Unknown") input of 
		Right x -> x 
		Left _ 	-> 10000 -- default time interval



parse_time_interval1 = do 
	s1 <- getInput
	r <- case readSigned readDec s1 of 
		[(n, s')] -> n <$ setInput s'
		_		  -> Control.Applicative.empty	
	spaces
	time_interval <- many1 alphaNum
	i <- case time_interval of 
		"millis" ->  return 1000
		"seconds" -> return $ 10 ^ 6 
		"minutes" -> return $ 60 * 10 ^ 6
	return (r *i)



p_f = do 
	s <- getInput
	case readSigned readFloat s of 
		[(n, s')] -> n <$ setInput s'
		_		  -> Control.Applicative.empty 
parse_float input = 
	case Parsec.parse p_f ("Unable to parse input " ++ (input))  input of 
		Right x -> x 
		Left _ -> 0.0
