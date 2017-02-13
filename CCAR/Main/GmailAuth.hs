module CCAR.Main.GmailAuth 
	(getGmailOauthR
	, getGmailOauthCallbackR)
where
import GHC.Generics
import Data.Text as T
import Data.Monoid
import CCAR.Main.Application
import CCAR.Main.EnumeratedTypes
import Yesod.Core
import Yesod.WebSockets as YWS
import Control.Monad.Trans.Control    (MonadBaseControl (liftBaseWith, restoreM))
import Network.WebSockets.Connection as WSConn
import Network.WebSockets 
import Yesod.Static
import Control.Exception hiding(Handler)
import qualified GHC.Conc as GHCConc

import Data.Map as M
import Control.Monad as Monad
import Control.Monad.Trans.Maybe
import Control.Monad.IO.Class(liftIO)

import Control.Exception
import Control.Applicative
import System.Log.Logger as Logger
import System.Environment(getEnv)
import System.IO
import Data.Time(getCurrentTime)
import Data.Vector as V
import Data.Aeson 
import Control.Lens hiding((.=))
import Data.Aeson.Lens
import Data.Aeson.Types
import Network.Wreq as Wreq
import CCAR.Main.DBUtils
import Database.Persist
import Database.Persist.Postgresql as DB
import Data.Text.Encoding as TE

data ApplicationType = Web | Desktop | Browser deriving (Show, Generic) 

newtype Project = Project {unPrjId :: T.Text} deriving (Show, Generic) 
newtype ClientSecret = ClientSecret {unClientSecrete :: T.Text} 


instance ToJSON ClientSecret where 
    toJSON _ = object ["secret" .= ("We cant display it in json" :: String)]

instance Show ClientSecret where 
    show _ = "Neither can we on the command line."


data CertificateType = X509 | Unknown deriving (Show, Generic)

newtype ClientIdentifier = ClientIdentifier {unCI :: T.Text} deriving (Show, Generic)
newtype ProjectIdentifier = ProjectIdentifier {unPI :: T.Text} deriving (Show, Generic)
data CertificateDetails = CertificateDetails {
    certType :: CertificateType
    , certURL :: URL
} deriving (Generic, Show)
data AuthorizationProviderDetails = AuthorizationProviderDetails {
    authorizationURI :: URL
    , tokenURI :: URL
    , certificateDetails :: CertificateDetails
} deriving (Generic, Show)

data AuthenticationDetails = AuthenticationDetails {
    applicationType :: ApplicationType
    , clientId :: ClientIdentifier
    , projectId :: ProjectIdentifier
    , authDetails :: AuthorizationProviderDetails 
    , clientSecret :: ClientSecret 
    , redirectURLs :: [URL]
    , javascriptOrigins :: [URL]
    , csrfToken :: Maybe CSRFToken
} deriving (Generic, Show)


instance ToJSON AuthenticationDetails
instance ToJSON ApplicationType
instance ToJSON ClientIdentifier 
instance ToJSON ProjectIdentifier
instance ToJSON AuthorizationProviderDetails
instance ToJSON CSRFToken
instance ToJSON CertificateDetails
instance ToJSON CertificateType 

jsonToAuthenticationDetails :: AsValue s => s -> Maybe AuthenticationDetails
jsonToAuthenticationDetails aString = do 
    secret <- aString ^? key "web" . key "client_secret" . _String
    clientId <- aString ^? key "web" . key "client_id" . _String
    projectId <- aString ^? key "web" . key "project_id" . _String 
    authUri <- aString ^? key "web" . key "auth_uri" . _String 
    token_uri <- aString ^? key "web" . key "token_uri" . _String 
    x509Provider <- aString ^? key "web" . key "auth_provider_x509_cert_url" . _String
    r <- aString ^? key "web" . key "redirect_uris" . _Array >>= \x1 ->
            Monad.mapM (return . textOnly)
                $ V.toList x1           
    javascript_origins <- aString ^? key "web" . key "javascript_origins" . _Array >>= \x1 -> 
            Monad.mapM (return . textOnly) $ V.toList x1

    let authDetails = AuthorizationProviderDetails authUri token_uri
                            $ CertificateDetails X509 x509Provider
    return $ AuthenticationDetails Web (ClientIdentifier clientId)
                                        (ProjectIdentifier projectId) 
                                        authDetails
                                        (ClientSecret secret)
                                        r
                                        javascript_origins
                                        Nothing
    where 
        -- Extract texts from json values. 
        -- Hack: there must be a method in aeson to do this.            
        textOnly :: Value -> T.Text
        textOnly x = case x of 
                            String y -> y
                            _        -> "Not a string"


iModuleName :: String 
iModuleName = "CCAR.Main.GmailAuth"
{-- Read the credentials stored in a file and return the authentication details --}
makeConnectionDetails :: FilePath -> IO (Maybe AuthenticationDetails)
makeConnectionDetails aFile = do 
    handle <- openFile aFile ReadMode
    contents <- hGetContents handle
    return $ jsonToAuthenticationDetails contents

getTokenURI :: AuthenticationDetails -> URL 
getTokenURI = tokenURI . authDetails

clientIdT :: AuthenticationDetails -> T.Text 
clientIdT x = unWrap $ clientId x 
              where 
                unWrap (ClientIdentifier y) = y

clientSecretT :: AuthenticationDetails -> T.Text 
clientSecretT x = unWrap $ clientSecret x 
                where 
                    unWrap (ClientSecret t) = t

redirectUrls :: AuthenticationDetails -> T.Text
redirectUrls = \x -> T.intercalate " " $ redirectURLs x

authenticateGmail :: IO (Maybe AuthenticationDetails)
authenticateGmail = do 
        getEnv ("GMAIL_OAUTH_LOCATION") >>= makeConnectionDetails 
        `catch`
        (\a@(SomeException e) -> do
                Logger.errorM iModuleName $ show a
                return Nothing )




getGmailOauthCallbackR :: MonadHandler m => m Value
getGmailOauthCallbackR = do
    r <- getRequest
    let params = M.fromList $ reqGetParams r
    let response = makeIdentityResponse Google params             
    case response of 
        Nothing -> returnJson $ object ["error" .= ("Error in oauth callback" :: T.Text)]
        Just resp -> do 
                y <- liftIO $ requestAuthenticationToken resp
                profile <- liftIO $ getUserProfile Google $ makeIdentityToken y
                _ <- liftIO $ updatePersonProfile profile
                returnJson $ profile

makeIdentityResponse :: IdentityProvider -> Map T.Text T.Text -> Maybe IdentityResponse 
makeIdentityResponse  identityProvider = \x -> do 
    let otp = M.lookup "code" x 
    let sessionState = M.lookup "session_state" x
    IdentityResponse <$> otp <*> sessionState <*> (pure identityProvider)


class OpenIdConnect a where 
    openIdConnect :: a ->IdentityToken -> IO (Either T.Text OpenIdProfile)

instance OpenIdConnect IdentityProvider where
    openIdConnect a b = gmailOpenIdConnect a b 
    openIdConnect a b = undefined -- For other providers


gmailOpenIdConnect :: IdentityProvider -> IdentityToken -> IO (Either T.Text OpenIdProfile)
gmailOpenIdConnect _ (IdentityToken a) = do 
    apiKey <- T.pack `fmap` getEnv("GOOGLE_API_KEY")
    let authTok = TE.encodeUtf8 $ "Bearer " <> a
    let opts = defaults & header "Authorization" .~ [authTok]
                        & param "key" .~ [apiKey]

    r <- getWith opts "https://www.googleapis.com/plus/v1/people/me/openIdConnect"
    let openIdProfile = OpenIdProfile 
                        (r ^. responseBody . key "kind" . _String)
                        (makeGender $ T.unpack (r ^. responseBody . key "gender" . _String))
                        (r ^. responseBody . key "sub" . _String)
                        (r ^. responseBody . key "name"  . _String)
                        (r ^. responseBody . key "given_name" . _String)
                        (r ^. responseBody . key "family_name" . _String)
                        (r ^. responseBody . key "profile"  . _String)  
                        (r ^. responseBody . key "picture"  . _String)
                        (r ^. responseBody . key "email"  . _String)  
                        (r ^. responseBody . key "email_verified"  . _String)
                        Nothing 
                        Nothing
    return . Right $ openIdProfile 


getUserProfile :: IdentityProvider -> IdentityToken -> IO (Either T.Text OpenIdProfile)
getUserProfile  a b = openIdConnect a b 



makeIdentityToken :: Maybe T.Text -> IdentityToken 
makeIdentityToken Nothing = IdentityToken "Invalid token" 
makeIdentityToken (Just x) = IdentityToken x


-- If we do have a csrf token, then insert the session.
updateUserMap :: Maybe CSRFToken -> EmailHint -> OpenIdScope -> IdentityProvider -> IO (Key OAuthSession)
updateUserMap (Just (CSRFToken csrfToken)) email scope idP = getCurrentTime >>= \x -> 
                dbOps $ DB.insert $ OAuthSession csrfToken email scope idP Nothing x
updateUserMap Nothing email scope idP = 
                getCurrentTime >>= \x -> do
                    let madeUpStr = T.pack $ "INVALID_TOKEN_" <> (show x)
                    dbOps $ DB.insert $ OAuthSession madeUpStr email scope idP Nothing x 




updatePersonProfile :: Either T.Text OpenIdProfile -> IO (Maybe (Entity OpenIdProfile))
updatePersonProfile (Right aProfile ) = dbOps $ do 
    pro <- DB.getBy $ UniqueProfile $ openIdProfileEmail aProfile 
    case pro of 
        Just (Entity profId _) -> DB.replace profId aProfile >> return pro
        Nothing -> DB.insertEntity aProfile >> return pro
updatePersonProfile (Left _) = return Nothing




makeCSRFToken :: Maybe T.Text -> Maybe CSRFToken 
makeCSRFToken = fmap CSRFToken

updateCSRFToken :: Maybe AuthenticationDetails -> Maybe CSRFToken -> Maybe AuthenticationDetails
updateCSRFToken a c = do 
        b <- a 
        return $ b {csrfToken = c}


data IdentityResponse = IdentityResponse {
    otp :: T.Text -- One time access code to request user credentials
    , sessionState :: T.Text -- CSRF token as well as the book keeping token to manage the current user hint.
    , identityProvider :: IdentityProvider
} deriving (Show, Generic, Eq)

instance ToJSON IdentityResponse 



-- This code is a bit of lens trickery, 
-- return wraps into a maybe
requestAuthenticationToken :: IdentityResponse -> IO (Maybe T.Text)
requestAuthenticationToken ir = do
    Just x <- authenticateGmail
    let tokenUri = T.unpack $ getTokenURI x
{-    let opts = defaults 
            & param "client_id" .~ [clientIdT x]
            & param "client_secret" .~ [clientSecretT x]
            & param "redirect_uri" .~ [redirectUrls x]
            & param "grant_type" .~ ["authorization_code"]
    -- TODO: Review this: why should this be duplicated?-}
    p <- liftIO $ post tokenUri $ 
                    ["client_id" := clientIdT x
                       , "client_secret" := clientSecretT x 
                       , "redirect_uri" := redirectUrls x 
                       , "grant_type" := ("authorization_code" :: T.Text)
                       , "code" := otp ir
                    ]
    access_token <- return $ p ^? Wreq.responseBody . key "access_token" . _String
    return access_token


getGmailOauthR :: MonadHandler m => EmailHint -> OpenIdScope -> m Value
getGmailOauthR a s = do
        r <- getRequest
        rToken <- return $ Just ("Do something here." :: T.Text)
        x <- liftIO $ authenticateGmail
        let c = makeCSRFToken rToken
        let y = toJSON $ updateCSRFToken x c
        _ <- liftIO $ updateUserMap c a s Google
        return y
