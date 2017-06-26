{--License: license.txt --}
import qualified CCAR.Main.Driver as Driver
import qualified CCAR.Tests.TestCases as TestCases
import Test.HUnit
import System.Environment(getArgs)
import CCAR.Data.Transport.Cloud.Supervisor as Supervisor
main :: IO()
main = do 
	args <- getArgs
	case args of 
		[port] -> Driver.driver (read port :: Int)
		"cloud":cloudServiceName : port2 :[] -> 
					Supervisor.supervisor cloudServiceName (read port2 :: Int)
		"tests":[] ->  doTests
		_		   -> return ()


doTests = do 
	x <- runTestTT $ TestCases.testCase5
	putStrLn (show x)