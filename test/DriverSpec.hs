module DriverSpec(main, spec) where 

import Test.Hspec.WebDriver
import Data.Text (pack, unpack, Text)
main :: IO ()
main = hspec spec

absolute = undefined

spec :: Spec
spec = do 
    session "for login" $ using Firefox $ do
        it "opens page" $ runWD $ 
            openPage "https://beta.ccardemo.tech"
        it "checks user id password" $ runWD $ do
            nickName <- findElem $ ById $ pack "nickName"
            nickName `shouldBeTag` (pack "input")
            (pack "test") `sendKeys` nickName

