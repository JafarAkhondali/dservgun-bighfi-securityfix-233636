{-# LANGUAGE OverloadedStrings #-}

module CCAR.Entitlements.GmailAuthentication(authenticateGmail, EmailHint) where
import Prelude	
import Data.Aeson
import Data.Aeson.Lens
import Control.Lens hiding((.=))
import Data.Text as T 
import Control.Monad
import Control.Exception
import System.IO
import System.Environment
import Data.Vector as V
import GHC.Generics
import System.Log.Logger as Logger


iModuleName :: String 
iModuleName = "CCAR.Entitlements.GmailAuthentication"

type EmailHint = T.Text
data ApplicationType = Web | Desktop | Browser deriving (Show, Generic) 
newtype Project = Project {unPrjId :: T.Text} deriving (Show, Generic) 
newtype ClientSecret = ClientSecret {unClientSecrete :: T.Text} 
instance Show ClientSecret where 
	show _ = "************************"

instance ToJSON ClientSecret where 
	toJSON _ = object ["secret" .= ("We cant display it in json" :: String)]
data CertificateType = X509 | Unknown deriving (Show, Generic)
type URL = T.Text
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
} deriving (Generic, Show)

instance ToJSON AuthenticationDetails
instance ToJSON AuthorizationProviderDetails 
instance ToJSON CertificateDetails 
instance ToJSON ApplicationType 
instance ToJSON ClientIdentifier
instance ToJSON ProjectIdentifier
instance ToJSON CertificateType

newtype Login = Login {unLoginhint :: T.Text} deriving (Show, Generic)


jsonToAuthenticationDetails :: AsValue s => s -> Maybe AuthenticationDetails
jsonToAuthenticationDetails aString = do 
	secret <- aString ^? key "web" . key "client_secret" . _String
	clientId <- aString ^? key "web" . key "client_id" . _String
	projectId <- aString ^? key "web" . key "project_id" . _String 
	authUri <- aString ^? key "web" . key "auth_uri" . _String 
	token_uri <- aString ^? key "web" . key "token_uri" . _String 
	x509Provider <- aString ^? key "web" . key "auth_provider_x509_cert_url" . _String
 	r <- aString ^? key "web" . key "redirect_uris" . _Array >>= \x1 ->
 			Control.Monad.mapM (return . textOnly)
 				$ V.toList x1			
	javascript_origins <- aString ^? key "web" . key "javascript_origins" . _Array >>= \x1 -> 
 			Control.Monad.mapM (return . textOnly) $ V.toList x1

	let authDetails = AuthorizationProviderDetails authUri token_uri
							$ CertificateDetails X509 x509Provider
	return $ AuthenticationDetails Web (ClientIdentifier clientId)
									 	(ProjectIdentifier projectId) 
									 	authDetails
									 	(ClientSecret secret)
									 	r
									 	javascript_origins
	where 
		isSome (Just y) = True
		isSome _ 		= False
		-- Extract texts from json values. 
		-- Hack: there must me a method in aeson to do this.			
		textOnly :: Value -> T.Text
		textOnly x = case x of 
							String y -> y
							_ 		 -> "Not a string"
{-- Read the credentials stored in a file and return the authentication details --}
makeConnectionDetails :: FilePath -> IO (Maybe AuthenticationDetails)
makeConnectionDetails aFile = do 
	fHandle <- openFile aFile ReadMode
	contents <- hGetContents fHandle
	return $ jsonToAuthenticationDetails contents


authenticateGmail :: EmailHint -> IO (Maybe AuthenticationDetails)
authenticateGmail email = do 
		getEnv ("GMAIL_OAUTH_LOCATION") >>= makeConnectionDetails 
		`catch`
		(\a@(SomeException e) -> do
							Logger.errorM iModuleName $ show a
							return Nothing )

