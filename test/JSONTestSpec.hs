module JSONTestSpec(spec, main)
where 
import Test.Hspec
import CCAR.Model.Company
import Data.Aeson
import Data.Aeson.Types
import CCAR.Model.PortfolioT
import Data.Text

testObject = AssignUser "testCommand" "testCompany" "testUserName" False False
spec :: Spec 
spec = do 
	describe "Parse incoming requests correctly" $ do 
		context "Testing json" $ do 
			it "parses-assign-user" $ do
				let test = testObject
				let testToJSON = toJSON test 
				(fromJSON testToJSON )`shouldBe` (Success test) 

main :: IO ()
main = hspec spec
