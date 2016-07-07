module CCAR.Main.Application
    (App(..)
    , getClientState
    , updateClientState
    , updateActivePortfolio)
where

import Data.Text as T 
import Data.Map as Map
import CCAR.Main.GroupCommunication as GroupCommunication
import Control.Concurrent.STM.Lifted
import Data.Time
import CCAR.Data.ClientState
import Control.Monad.Trans.Reader
import CCAR.Model.PortfolioT
import Control.Monad.Trans
type NickName = T.Text

-- the broadcast channel for the application.
data App = App { chan :: (TChan T.Text)
                , nickNameMap :: ClientMap}


type ClientMap = GroupCommunication.ClientIdentifierMap



-- Convert a result of a map to a list
getClientState :: T.Text -> App -> STM [ClientState]
getClientState nickName app@(App a c) = do
        nMap <- readTVar c
        return $ Map.elems $ filterWithKey(\k _ -> k ==  nickName) nMap


updateClientState :: T.Text -> App -> UTCTime -> STM ()
updateClientState nickName app@(App a c) currentTime = do 
    nMap <- readTVar c 
    if Map.member nickName nMap then do 
        nClientState <- return $ nMap ! nickName
        x <- writeTVar (nickNameMap app) (Map.insert nickName (nClientState {lastUpdateTime = currentTime}) nMap)
        return ()
    else
        return ()

updateActivePortfolio :: T.Text -> App -> PortfolioT -> STM ()
updateActivePortfolio nickName app@(App a c) p = do 
    nMap <- readTVar c 
    if Map.member nickName nMap then do  
        nClientState <- return $ nMap ! nickName
        a <- return $ Just $ makeActivePortfolio p
        writeTVar (nickNameMap app)
                (Map.insert nickName (nClientState {activePortfolio = a }) nMap)
        return ()
    else
        return ()

