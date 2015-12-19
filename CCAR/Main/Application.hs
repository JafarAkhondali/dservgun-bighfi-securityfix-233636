module CCAR.Main.Application
	(App(..))
where

import Data.Text as T 
import CCAR.Main.GroupCommunication as GroupCommunication
import Control.Concurrent.STM.Lifted(TChan)
type NickName = T.Text
type ClientMap = GroupCommunication.ClientIdentifierMap

-- the broadcast channel for the application.
data App = App { chan :: (TChan T.Text)
                , nickNameMap :: ClientMap}

