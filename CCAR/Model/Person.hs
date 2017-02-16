{--License: license.txt --}
module CCAR.Model.Person 
    (updateLogin
    , checkLoginExists 
    , queryAllPersons 
    , getAllNickNames 
    , insertPerson
    , updatePerson
    , deletePerson
    , queryPerson 
    , fixPreferences 
    , getMessageCount 
    , createGuestLogin)
where
import CCAR.Main.DBUtils
import GHC.Generics
import Data.Aeson as J
import Yesod.Core
import Control.Monad.Trans.Maybe
import Control.Monad.IO.Class(liftIO)
import Control.Concurrent
import Control.Concurrent.STM.Lifted
import Control.Concurrent.Async
import qualified  Data.Map as IMap
import Control.Exception
import Control.Monad
import Control.Monad.Logger(runStderrLoggingT)
import Network.WebSockets.Connection as WSConn
import Data.Text as T
import Data.Text.Lazy as L 
import Database.Persist.Postgresql as DB
import Data.Aeson.Encode as En
import Data.Text.Lazy.Encoding as E
import Data.Aeson as J
import Control.Applicative as Appl
import Data.Aeson.Encode as En
import Data.Aeson.Types as AeTypes(Result(..), parse)
import GHC.Generics
import Data.Data
import Data.Typeable 
import System.IO
import Data.Time
import System.Log.Logger as Logger

data CRUD = Create  | Update PersonId | Query PersonId | Delete PersonId deriving(Show, Eq, Generic)

updateLogin :: Person -> IO (Maybe Person) 
updateLogin p = do
        connStr <- getConnectionString
        poolSize <- getPoolSize
        runStderrLoggingT $ withPostgresqlPool connStr poolSize $ \pool -> 
                liftIO $ do 
                    now <- getCurrentTime
                    flip runSqlPersistMPool pool $ do 
                        DB.updateWhere [PersonNickName ==. (personNickName p)][PersonLastLoginTime =. now]                         
                    return $ Just p 

checkLoginExists :: T.Text  -> IO (Maybe (Entity Person))
checkLoginExists aNickName = do 
    x <- liftIO $ dbOps $ do
        y <- getBy $ UniqueNickName aNickName
        return y
    return x
queryAllPersons :: IO [Entity Person]
queryAllPersons = do dbOps $ DB.selectList [] [LimitTo 200]

getAllNickNames :: IO [T.Text] 
getAllNickNames = do
    persons <- queryAllPersons
    mapM (\(Entity k p) -> return $ personNickName p) persons


iModuleName :: String 
iModuleName = "CCAR.Model.Person"
insertPerson :: Person -> IO ((Key Person)) 
insertPerson p = do 
    Logger.debugM iModuleName $ 
            show $ "Inside insert person " ++ (show p)
    dbOps $ do 
            pid <- DB.insert p
            _ <- DB.insert $ Preferences {preferencesPreferencesFor = pid
        			, preferencesMaxHistoryCount = 300} -- Need to get this from the default function.
            $(logInfo) $ T.pack $ show  ("Returning " ++ (show pid))
            return pid

updatePerson :: PersonId -> Person -> IO (Maybe Person)
updatePerson pid p = dbOps $ do 
    _ <- DB.replace (pid) p
    get pid

queryPerson :: PersonId -> IO (Maybe Person) 
queryPerson pid =  dbOps $ get pid 


deletePerson :: PersonId -> Person -> IO (Maybe Person)
deletePerson pid p = dbOps $ do 
        _ <- DB.delete pid 
        return $ Just p 

fixPreferences :: Maybe (Entity Person) -> IO (Key Preferences)
fixPreferences (Just (Entity k p1)) = dbOps $ do 
        preferences <- DB.selectFirst [PreferencesPreferencesFor ==. k ][]
                -- We should have only one preferences instance per person.
        case preferences of
            Nothing ->  do 
                        DB.insert $ Preferences 
                            {preferencesPreferencesFor = k 
                            , preferencesMaxHistoryCount = 300 }

-- How to handle this -- really need to handle this.
fixPreferences Nothing = undefined

getMessageCountM :: T.Text -> MaybeT IO Int 
getMessageCountM = \x -> do 
    Just (Entity personId _) <- liftIO $ dbOps $ DB.getBy $ UniqueNickName x 
    Just (Entity _ (Preferences _ c)) <- liftIO $ dbOps $ DB.selectFirst [PreferencesPreferencesFor ==. personId] []
    return c

getMessageCount :: T.Text -> IO Int 
getMessageCount = \x -> do
    Logger.debugM iModuleName  $ 
            "Message Count " ++ (show x)
    c <- runMaybeT . getMessageCountM $ x
    case c of 
        Just y -> return y
        Nothing -> return 10


createGuestLogin :: NickName -> IO (Key GuestLogin) 
createGuestLogin aNickName = do 
    currentTime <- getCurrentTime
    dbOps $ do 
        person <- DB.getBy $ UniqueNickName . unN $ aNickName 
        case person of 
            Just (Entity personId _ ) -> insert $ GuestLogin currentTime personId 
            -- Need to deal with Nothing here.




instance ToJSON CRUD
instance FromJSON CRUD
