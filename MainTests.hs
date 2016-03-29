module MainTests where 
import 									HSH
import 									qualified Data.List as List(intercalate)
import 									Data.Text
{-- | A main shell script to run the tests --}
main :: IO ()
main = do
	-- stop the selenium server if already running
	-- start selenium server
	-- cabal run --executable <executable name>
	-- cabal test
	-- stop the selenium server
	--stopSeleniumServer
	startSeleniumServer
	runIO ("cabal run --executable ccar-websockets&" :: String)
	runIO ("sleep 5"  :: String) -- sleep for 5 seconds
	runIO ("cabal test" :: String)
	stopSeleniumServer
	runIO ("pkill ccar-websockets" :: String)


data SeleniumServer = SeleniumServer{
	dir :: FilePath
	, exeName :: String
	, version :: String
	, suffix :: String
}

 
instance Show SeleniumServer where
	show (SeleniumServer dir exeName version suffix) = l_intercalate "/" [dir, jar]
			where 
				exe = l_intercalate "-" [exeName, version]
				jar = l_intercalate "." [exe, suffix]
				l_intercalate = List.intercalate

defSS = SeleniumServer "./selenium-server" "selenium-server-standalone" "2.53.0" "jar"
startSeleniumServer = runIO $ "java -jar " ++ show defSS
stopSeleniumServer = runIO $ ("pkill java" ::  String)



