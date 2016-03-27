module DriverSpec(main, spec) where 

import Test.Hspec.WebDriver
import Data.Text (pack, unpack)
main :: IO ()
main = hspec spec

absolute = undefined

spec :: Spec
spec = do 
    session "for login" $ using Firefox $ do
        it "opens page" $ runWD $ 
            openPage "http://beta.ccardemo.tech"
        it "checks user id password" $ runWD $ do
            e <- findElem $ ById $ pack "nickName"
            e `shouldBeTag` (pack "input")