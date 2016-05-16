module JSONTestSpec(main, spec)
where 
import Test.Hspec
import CCAR.Model.Company
import Data.Aeson
import Data.Aeson.Types
import CCAR.Model.PortfolioT

{-- Some basic datatypes being tested for json parsing --}

testAssignUser :: AssignUser
testAssignUser = AssignUser "testCommand" "testCompany" "testUserName" False False

specAssignUser :: Spec 
specAssignUser = do 
	describe "Parse incoming requests correctly" $ do 
		context "Testing json" $ do 
			it "parses-assign-user" $ do
				let test = testAssignUser
				let testToJSON = toJSON test 
				(fromJSON testToJSON )`shouldBe` (Success test) 


testCompany :: CompanyT 
testCompany = CompanyT "testCompanyName" "testCompanyId" "Image goes here" "test@mail.org"

testManageCompany :: ManageCompany
testManageCompany = ManageCompany (NickName "test_nick_name") Create testCompany  

specManageCompany :: Spec 
specManageCompany = do 
	describe "Parse manage company request correctly" $ do 
		context "Parsing incoming ManageCompany request" $ do 
				it "parses-manage-company" $ do 
					let testToJSON = toJSON testManageCompany
					(fromJSON testToJSON) `shouldBe` (Success testManageCompany)

{-- How do we run multiple specs within a single module --}
spec = specManageCompany
main :: IO ()
main = do 
	hspec specAssignUser
	hspec specManageCompany