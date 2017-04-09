module CCAR.Parser.CSVParser 
	(
		parseCSV
		, parseLine
		, ParseError
		, readLines
		, stripHeader
	) where 
import Text.ParserCombinators.Parsec
import Data.Text as T
import Data.Conduit ( ($$), (=$=), (=$), Conduit, await, yield, awaitForever, Sink)
import Data.Conduit.Binary as B (sinkFile, lines, sourceFile) 
import Data.Conduit.List as CL
import Data.Conduit.Lift 
import Control.Monad.State as State
import Data.ByteString.Char8 as BS(ByteString, pack, unpack) 
import Database.Persist as DB
import Database.Persist.TH 
import Data.List as List
import Control.Monad.Trans.Maybe
import Control.Monad.IO.Class
import Control.Monad.Trans(lift)
import Control.Monad.Trans.Resource(runResourceT)


{-- | Strip the header for file. --}
stripHeader :: Monad m => Conduit a m a
stripHeader = evalStateC False $ awaitForever $ \i  -> do
		total <- State.get
		if total == False then
			put True
		else
			yield i

readLines :: (Monad m, MonadIO m) => Conduit BS.ByteString m (Either ParseError [String])
readLines = awaitForever $ \i -> yield $ parseLine $ BS.unpack i 






-- RWH example.
csvFile = endBy line eol

line = sepBy cell (char '|')
cell = quotedCell <|> many (noneOf "|\n")
quotedCell = 
	do 	_ <- char '"'
		content <- many quotedChar 
		char '"' <?> "Incomplete quotes" 
		return content 

-- This function seems like a hack..
-- but i guess that is the only way
-- deal with the boundary.
quotedChar = 
		noneOf "\"" 
	<|> try (string "\"\"" >> return '"')

eol = try (string "\n\r")
	<|> try (string "\r\n")
	<|> string "\n"
	<|> string "\r"
	<?> "End of line"

parseLine :: String -> Either ParseError [String]
parseLine = \x -> parse line "Could not parse" x
parseCSV :: String -> Either ParseError [[String]] 
parseCSV input = parse csvFile "Could not parse" input 
