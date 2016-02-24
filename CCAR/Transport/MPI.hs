module CCAR.Transport.MPI
	(ArrayMessage(..)
	, sendString
	, defaultBufSize)

where 

-- TODO: Make this using Text rather than String
import Control.Parallel.MPI.Fast
import Data.Array.Storable
import Control.Monad.Trans.Reader as Reader


type ArrayMessage = StorableArray Int Char

padL :: String -> Int -> Char -> String
padL s n pChar
	| length s < n = s ++ replicate (n - length s) pChar
	| otherwise = s


data MessageDetails = MessageDetails {
		payload :: String
		, padChar :: Char
		, bufSize :: Int
} deriving (Show, Eq)

defaultBufSize = bufSize defaultMessageDetails

defaultMessageDetails = MessageDetails "" ' ' 80

toPaddedString :: MessageDetails -> [Char]
toPaddedString a@(MessageDetails payload padChar bufSize) = padL payload bufSize padChar

type PadReader = ReaderT (MessageDetails) IO 

-- Pad the string with spaces

{-sendString :: String -> ReaderT (MessageDetails) IO (StorableArray Int Char)-}
sendString aString = do 
	a <- flip runReaderT defaultMessageDetails $ do 
		a@(MessageDetails payload padChar bufSize) <- ask
		return $ toPaddedString $ a {payload = aString}
	newListArray (1, defaultBufSize) a 
	

