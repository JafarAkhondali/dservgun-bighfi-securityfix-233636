{-# LANGUAGE QuasiQuotes, TemplateHaskell, TypeFamilies, OverloadedStrings #-}
import Yesod.Core
import Yesod.WebSockets
import Yesod.Static
import qualified Data.Text.Lazy as TL
import Control.Monad (forever)
import Control.Monad.Trans.Reader
import Control.Concurrent (threadDelay)
import Control.Monad.IO.Class(liftIO)
import Data.Time
import Conduit
import Data.Monoid ((<>))
import Control.Concurrent.STM.Lifted
import Data.Text as T
import Database.Persist
import Database.Persist.Sqlite
import Database.Persist.TH
import Data.Time
import Data.Typeable
import GHC.Generics
import Data.Data

import Data.Aeson as J
import Data.Aeson.Encode as En
import Data.Text.Lazy.Encoding as E
import Data.Text.Lazy as L



share [mkPersist sqlSettings, mkMigrate "migrateAll"] 
    [persistLowerCase| 
        Person 
            firstName String 
            lastName String 
            nickName String 
            created UTCTime 
            lastLogin UTCTime
            UniquePerson nickName
            deriving Show Typeable Data Generic Eq Ord
        TermsAndConditions
            title String
            description String
            acceptDate UTCTime
            deriving Show Typeable Data Generic Eq Ord
            |]


data LoginStatus = UserExists | UserNotFound | InvalidPassword 
    deriving(Show, Typeable, Data, Generic, Eq, Ord)
data Login = Login {
    person :: Maybe Person
    , loginStatus :: LoginStatus
} deriving (Show, Typeable, Data, Generic, Eq, Ord)

data App = App { chan :: (TChan T.Text)
                , getStatic :: Static}




instance Yesod App

mkYesod "App" [parseRoutes|
/ HomeR GET
/static StaticR  Static getStatic
|]

iParseJSON :: (FromJSON a) => T.Text -> Maybe a
iParseJSON = J.decode . E.encodeUtf8 . L.fromStrict

pJSON :: (FromJSON a) => T.Text -> IO (Maybe a)
pJSON  aText = return $ J.decode  $ E.encodeUtf8  $ L.fromStrict aText

{- Read the message, parse and then send it back. -}
processIncomingMessage :: T.Text -> T.Text
processIncomingMessage aText = L.toStrict $ E.decodeUtf8 $ En.encode $ (iParseJSON aText :: Maybe Person)
{-- Process the login and return a login status --}
processLogin :: Maybe Person -> IO Login
processLogin Nothing = return $ Login {person = Nothing, loginStatus = UserNotFound}
processLogin (Just x) = return $ Login{person = Just x, loginStatus = UserExists}

checkLoginExists :: String -> IO (Maybe (Entity Person))
checkLoginExists aLogin = runSqlite ":memory:" $ do getBy $  UniquePerson aLogin

chatApp :: WebSocketsT Handler ()
chatApp = do
        sendTextData ("Small business management tool chain." :: T.Text)
        name <- receiveData
        personObject <- liftIO $ (pJSON name :: IO (Maybe Person))
        nickNameExists <- liftIO $ processLogin personObject
        sendTextData $ J.encode nickNameExists
        App writeChan _ <- getYesod
        readChan <- atomically $ do
            writeTChan writeChan $ name <> " has joined the chat"
            dupTChan writeChan
        race_
            (forever $ sourceWS $$ mapC TL.toUpper =$ sinkWSText)
            (sourceWS $$ mapM_C (\msg ->
                atomically $ writeTChan writeChan $ name <> ": " <> msg))

getHomeR :: Handler Html
getHomeR = do
    webSockets chatApp
    defaultLayout $ do
        [whamlet|
            <div #output>
            <form #form>
                <input #input autofocus>
        |]
        toWidget [lucius|
            \#output {
                width: 600px;
                height: 400px;
                border: 1px solid black;
                margin-bottom: 1em;
                p {
                    margin: 0 0 0.5em 0;
                    padding: 0 0 0.5em 0;
                    border-bottom: 1px dashed #99aa99;
                }
            }
            \#input {
                width: 600px;
                display: block;
            }
        |]
        toWidget [julius|
            var url = document.URL,
                output = document.getElementById("output"),
                form = document.getElementById("form"),
                input = document.getElementById("input"),
                conn;

            url = url.replace("http:", "ws:").replace("https:", "wss:");
            conn = new WebSocket(url);

            conn.onmessage = function(e) {
                var p = document.createElement("p");
                p.appendChild(document.createTextNode(e.data));
                output.appendChild(p);
            };

            form.addEventListener("submit", function(e){
                conn.send(input.value);
                input.value = "";
                e.preventDefault();
            });
        |]


main :: IO ()
main = do
    runSqlite ":memory:" $ runMigration migrateAll
    chan <- atomically newBroadcastTChan
    static@(Static settings) <- static "static"
    warp 3000 $ App chan static


instance J.ToJSON Person
instance J.FromJSON Person
instance J.ToJSON TermsAndConditions
instance J.FromJSON TermsAndConditions
instance J.ToJSON Login
instance J.FromJSON Login
instance J.ToJSON LoginStatus
instance J.FromJSON LoginStatus