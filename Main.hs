{--License: license.txt --}
import qualified CCAR.Main.Driver as Driver
import qualified CCAR.Tests.TestCases as TestCases
import Test.HUnit
import System.Environment(getArgs)

main :: IO()
main = do 
	args <- getArgs
	case args of 
		[port] -> Driver.driver (read port :: Int)
		"tests":[] ->  doTests
		_		   -> return ()


doTests = do 
	x <- runTestTT $ TestCases.testCase5
	putStrLn (show x)