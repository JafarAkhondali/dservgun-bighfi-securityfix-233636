module CCAR.Main.Application
    (App(..)
    , getClientState
    , updateClientState)
where

import Data.Text as T 
import Data.Map as Map
import CCAR.Main.GroupCommunication as GroupCommunication
import Control.Concurrent.STM.Lifted
import Data.Time


type NickName = T.Text
type ClientMap = GroupCommunication.ClientIdentifierMap

-- the broadcast channel for the application.
data App = App { chan :: (TChan T.Text)
                , nickNameMap :: ClientMap}


getClientState :: T.Text -> App -> STM [ClientState]
getClientState nickName app@(App a c) = do
        nMap <- readTVar c
        if Map.member nickName nMap then 
            return $ [nMap ! nickName]
        else 
            return [] 

updateClientState :: T.Text -> App -> UTCTime -> STM ()
updateClientState nickName app@(App a c) currentTime = do 
    nMap <- readTVar c 
    if Map.member nickName nMap then do 
        nClientState <- return $ nMap ! nickName
        x <- writeTVar (nickNameMap app) (Map.insert nickName (nClientState {lastUpdateTime = currentTime}) nMap)
        return ()
    else
        return ()
