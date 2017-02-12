module CCAR.Main.GmailAuth 
	(getGmailOauthR
	, getGmailOauthCallbackR)
where
import Data.Text as T
import CCAR.Main.Application
import Yesod.Core
import CCAR.Main.EnumeratedTypes
import Data.Map as M


getGmailOauthR :: EmailHint -> OpenIdScope -> HandlerT App IO Value
getGmailOauthR = \a s -> do
        r <- getRequest
        rToken <- return $ reqToken r
        x <- lift $ authenticateGmail
        let c = makeCSRFToken rToken
        let y = toJSON $ updateCSRFToken x c
        updateUserMap c a s Google
        return y


getGmailOauthCallbackR :: HandlerT App IO Value
getGmailOauthCallbackR = do
    r <- getRequest
    let params = M.fromList $ reqGetParams r
    let response = makeIdentityResponse Google params             
    case response of 
        Nothing -> returnJson $ object ["error" .= ("Error in oauth callback" :: T.Text)]
        Just resp -> do 
                y <- requestAuthenticationToken resp
                profile <- liftIO $ getUserProfile Google $ makeIdentityToken y
                updatePersonProfile profile
                returnJson $ profile
