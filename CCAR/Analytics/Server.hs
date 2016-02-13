module CCAR.Analytics.Server(
	ServerHandle(..))
where
import 							System.IO 



data ServerHandle = ServerHandle {
	sHandle :: Handle
} 
