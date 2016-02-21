{-- 
 - License file attached
--}
module Main where 
import 	Control.Parallel.MPI.Fast 
import	Data.Array.Storable 

type ArrayMessage = StorableArray Int Char 
bounds :: (Int, Int) 
bounds = (1,2)

arrMsg :: IO (StorableArray Int Char)
arrMsg = newListArray bounds ['h', 'e']

sendString :: [Char] -> IO (StorableArray Int Char)
sendString aString = newListArray (1, length aString) (aString :: String)

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
					(recvMsg :: ArrayMessage, status) <- intoNewArray (1, 11) 
														$ recv commWorld 0 2
					els <- getElems recvMsg
					putStrLn $ "Got message " ++ (show els)
				_ -> return ()
			loop  rank