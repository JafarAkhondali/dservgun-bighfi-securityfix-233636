module CCAR.Data.ClientState
    (ClientState(..)
    , ClientIdentifier
    , ClientIdentifierMap
    , ActivePortfolio
    , createClientState
    , makeActivePortfolio
    , runAP) where 

import qualified Data.Map as Map
import Control.Concurrent.STM.Lifted 
import Data.Text as T
import Data.Monoid 
import Data.Time(UTCTime)
import Network.WebSockets.Connection as WSConn (Connection)
import Data.Aeson 
import CCAR.Parser.CCARParsec
import CCAR.Model.PortfolioT
import CCAR.Analytics.OptionPricer
import Data.Typeable
import Data.Data
import GHC.Generics
import Control.Applicative as Appl


type ClientIdentifier = T.Text
newtype ActivePortfolio = ActivePortfolio {unP :: PortfolioT} 
        deriving(Show, Read, Eq, Data, Generic, Typeable)

instance FromJSON ActivePortfolio where 
    parseJSON (Object a)  = ActivePortfolio <$> 
                    a .: "portfolio"  
    parseJSON _          = Appl.empty

instance ToJSON ActivePortfolio where
    toJSON p1@(ActivePortfolio p) =
        object [
            "commandType" .= ("ActivePortfolio" :: T.Text)
            , "portfolio" .= p 
        ]


makeActivePortfolio = ActivePortfolio 
runAP (ActivePortfolio p) = p

data ClientState = ClientState {
			nickName :: ClientIdentifier
			, connection :: WSConn.Connection
			, readChan :: TChan T.Text
			, writeChan :: TChan T.Text
            , jobReadChan :: TChan Value 
            , jobWriteChan :: TChan Value
            , workingDirectory :: FilePath
            , activeScenario :: [Stress]
            , pricerReadQueue :: TBQueue OptionPricer
            , lastMessageType :: T.Text
            , lastUpdateTime :: UTCTime -- The last update time for a message.
            , activePortfolio :: Maybe ActivePortfolio -- The currently selected portfolio.
	}


createClientState :: ClientIdentifier -> WSConn.Connection -> UTCTime -> STM ClientState
createClientState nn aConn currentTime = do 
        w <- newTChan
        r <- dupTChan w 
        jw <- newTChan 
        jwr <- dupTChan jw
        pricerReadQueue <- newTBQueue 5 
        return ClientState{nickName = nn 
                        , connection = aConn
                        , readChan = r 
                        , writeChan = w
                        , jobWriteChan = jw 
                        , jobReadChan = jwr
                        , workingDirectory = ("." <> (T.unpack nn))
                        , activeScenario = []
                        , pricerReadQueue = pricerReadQueue
                        , lastMessageType = ""
                        , lastUpdateTime = currentTime
                        , activePortfolio = Nothing
        }


instance Show ClientState where 
    show cs = (show $ nickName cs) ++  " Connected"
type ClientIdentifierMap = TVar (Map.Map ClientIdentifier ClientState)


