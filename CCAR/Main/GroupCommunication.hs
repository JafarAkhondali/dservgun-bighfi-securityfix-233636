{--License: license.txt --}
{-# LANGUAGE RecordWildCards #-}

module CCAR.Main.GroupCommunication 
	(ClientState
    , createClientState
	, ClientIdentifierMap
	, processSendMessage
    , getMessageHistory
	, DestinationType(..) 
    , testMessages
    , ClientIdentifier
    )
where
import Yesod.Core
import Data.Text as T
import Database.Persist.Postgresql as DB
import Data.Aeson as J
import Control.Applicative as Appl
import Data.Aeson.Types as AeTypes(parse, Parser)
import Data.Time(UTCTime, getCurrentTime)
import GHC.Generics
import Data.Data
import CCAR.Main.DBUtils
import CCAR.Main.EnumeratedTypes as Et
import CCAR.Command.ApplicationError
import CCAR.Main.Util as Util

import CCAR.Data.ClientState(ClientState, createClientState, ClientIdentifier, ClientIdentifierMap)
{- 
	The client needs to handle
		. Broadcast 
		- Group broadcast (members can join and leave the group)
		- Private messages (members can send private messages to the group)
		- Response messages (client requests and the server responds with a reply)
	The client needs to handle async concurrent exceptions and mask them as mentioned in
	Marlowe's book.	Following the model in the above book, we can assume that each client spawns 4 threads 
	to write to and a corresponding read channel for each connection to do the write.
-}

{-The server state is represented as -}

type GroupIdentifier = T.Text
data DestinationType = Reply | GroupMessage GroupIdentifier | Broadcast | 
                    PrivateMessage ClientIdentifier | Internal 
		              deriving(Show, Typeable, Data, Generic, Eq)

data SendMessage = SendMessage { from :: T.Text
                                , to :: T.Text
                                , privateMessage ::  T.Text
                                , destination :: DestinationType
                                , sentTime :: UTCTime } deriving (Show, Eq)

createBroadcastMessage :: MessageP -> Maybe SendMessage 
createBroadcastMessage (MessageP fr sentTo pM _ Et.Broadcast currentTime) = Just $ 
        SendMessage fr sentTo pM CCAR.Main.GroupCommunication.Broadcast currentTime
createBroadcastMessage _            = Nothing 

createPersistentMessage :: SendMessage -> MessageP 
createPersistentMessage (SendMessage fr sentTo pM destination currentTime) = 
        MessageP fr sentTo pM Et.Undecided replyType currentTime 
        where replyType = 
		      case destination of 
			         CCAR.Main.GroupCommunication.Reply -> Et.Reply					
			         _ 	  -> Et.Broadcast

getAllMessages :: Int -> IO [Entity MessageP]
getAllMessages limit = dbOps $ selectList [] [Asc MessagePSentTime, LimitTo limit]

saveMessage :: SendMessage -> IO (Key MessageP) 
saveMessage c = dbOps $ do 
                do 
                    cid <- DB.insert $ createPersistentMessage c 
                    $(logInfo) $ T.pack $ show ("Returning " ++ (show cid))
                    return cid

getMessageHistory :: Int -> IO [T.Text]
getMessageHistory limit = do
    allM <- getAllMessages limit
    messages <- mapM (\(Entity _ x) -> do 
                            m <- return $ createBroadcastMessage x
                            case m of
                                Just m1 -> return $ Util.serialize m1
                                Nothing -> return "") allM
    return messages

process :: SendMessage -> IO (DestinationType, Value)
process = \(cm@(SendMessage _ _ _ d _)) -> do
    (x,y) <- case d of 
        CCAR.Main.GroupCommunication.Broadcast -> do 
        	_ <- saveMessage cm 
        	return (CCAR.Main.GroupCommunication.Broadcast,  cm)
        _ -> return (CCAR.Main.GroupCommunication.Reply,  cm) 
    return (x, toJSON y)



genSendMessage :: SendMessage -> Value
genSendMessage (SendMessage f t m d sT) = object ["from" .= f
                    , "to" .= t
                    , "privateMessage" .= m
                    , "commandType" .= ("SendMessage" :: T.Text)
                    , "destination" .= d
                    , "sentTime" .= sT]

parseSendMessage :: Object -> AeTypes.Parser SendMessage 
parseSendMessage v = SendMessage <$> 
                    v .: "from" <*>
                    v .: "to" <*>
                    v .: "privateMessage" <*>
                    v .: "destination" <*>
                    v .: "sentTime"

processSendMessage :: Value -> IO (DestinationType, Value)
processSendMessage (Object a) = 
        case (parse parseSendMessage a) of
            Success r ->  process r 
            Error s -> return (CCAR.Main.GroupCommunication.Reply, 
            			toJSON $ appError $ "Sending message failed " ++ s ++ (show a))
processSendMessage _ = return (CCAR.Main.GroupCommunication.Reply, 
                        toJSON $ appError ("Invalid message in processSendMessage" :: T.Text))



testMessages :: IO Value
testMessages = do 
    currentTime <- getCurrentTime 
    x <- return $ toJSON $ SendMessage "a" "b" "c" CCAR.Main.GroupCommunication.Reply currentTime
    return x

instance ToJSON DestinationType
instance FromJSON DestinationType
instance ToJSON SendMessage where
    toJSON (SendMessage f t m d time) = genSendMessage (SendMessage f t m d time)

instance FromJSON SendMessage where 
    parseJSON (Object v ) = parseSendMessage v 
    parseJSON _           = Appl.empty
