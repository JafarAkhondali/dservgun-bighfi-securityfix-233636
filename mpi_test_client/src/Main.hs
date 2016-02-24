{-- 
 - License file attached
--}
module Main where 
import 	Control.Parallel.MPI.Fast 
import	Data.Array.Storable 

type ArrayMessage = StorableArray Int Char 

bufSize = 79
bounds :: (Int, Int) 
bounds = (1,bufSize)


padL :: Int -> String -> String
padL n s
	| length s < n = s ++ replicate (n - length s) ' '
	| otherwise    = s

arrMsg :: IO (StorableArray Int Char)
arrMsg = newListArray bounds ['h', 'e']

sendString :: [Char] -> IO (StorableArray Int Char)
sendString aString = newListArray (1, bufSize) ((padL bufSize aString))

main = mpi $ do
	-- rank <- commRank commWorld
	--loop rank
	commRank commWorld >>= \x -> loop x
	where 
		loop = \ rank -> do 
			case rank of
				0 -> do 
					sendMsg <- sendString ("Hello world" ::String)
					send commWorld 1 2 sendMsg 
				1 -> do 
					(recvMsg :: ArrayMessage, status) <- intoNewArray (1, bufSize) 
														$ recv commWorld 0 2
					els <- getElems recvMsg
					putStrLn $ "Got message " ++ (show els)
				_ -> return ()
			loop  rank