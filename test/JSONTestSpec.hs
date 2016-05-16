module JSONTestSpec(main, spec)
where 
import Test.Hspec
import CCAR.Model.Company
import Data.Aeson
import Data.Aeson.Types
import CCAR.Model.PortfolioT
import CCAR.Model.Portfolio
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

testPortfolioQuery :: PortfolioQuery  
testPortfolioQuery = undefined

specManageCompany :: Spec 
specManageCompany = do 
	describe "Parse manage company request correctly" $ do 
		context "Parsing incoming ManageCompany request" $ do 
				it "parses-manage-company" $ do 
					let testToJSON = toJSON testManageCompany
					(fromJSON testToJSON) `shouldBe` (Success testManageCompany)

{-- Parse portfolio query json. --}
specParsePortfolioQuery :: Spec 
specParsePortfolioQuery = describe "Parse portfolio query request correctly" $ do 
			context "Parsing incoming portfolio query request" $ do 
				it "parses-portfolio-query" $ do 
					(fromJSON . toJSON $ testPortfolioQuery) `shouldBe`
							(Success testPortfolioQuery)


{-- How do we run multiple specs within a single module --}
spec = do 
	specManageCompany
	specAssignUser
	
main :: IO ()
main = do hspec $ do 
		specAssignUser
		specManageCompany