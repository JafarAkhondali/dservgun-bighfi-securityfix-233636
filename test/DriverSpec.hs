module DriverSpec(main, spec) where 

import Test.Hspec.WebDriver
import Data.Text (pack, unpack, Text)
import Control.Concurrent
import Control.Monad.IO.Class
main :: IO ()
main = hspec spec

absolute = undefined

reminder m = do 
    threadDelay $ 10^6 * 5 
    putMVar m "done"

waiter = do 
    m <- newEmptyMVar
    forkIO $ reminder m
    (takeMVar m) >>= \x -> putStrLn x

spec :: Spec
spec = do 
    session "for login" $ using Firefox $ do
        it "opens page" $ runWD $ 
            openPage "https://beta.ccardemo.tech"
        it "checks user id password" $ runWD $ do
            
            nickName <- findElem $ ById $ pack "nickName"
            nickName `shouldBeTag` (pack "input")
            (pack "test") `sendKeys` nickName
            (pack "\t") `sendKeys` nickName
            liftIO $ waiter
            password <- findElem $ ById $ pack "password"
            password `shouldBeTag` (pack "input")
            (pack "test") `sendKeys` password
            (pack "\t") `sendKeys` password
            liftIO $ waiter
            companyList <- findElem $ ById $ pack "companyList"
            companyList `shouldBeTag` (pack "select")
            liftIO $ waiter
            test123 <- findElem $ ById $ pack "test123"
            test123 `shouldBeTag` (pack "option")
            click test123

            



