module CCAR.Main.Application
	(App(..)
	, getClientState)
where

import Data.Text as T 
import Data.Map as Map
import CCAR.Main.GroupCommunication as GroupCommunication
import Control.Concurrent.STM.Lifted


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
