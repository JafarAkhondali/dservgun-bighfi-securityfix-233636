module CCAR.Analytics.OptionPricer (OptionPricer(..)) where 

import 							Data.Typeable 
import 							Data.Aeson
import							Data.Text as T
import 							CCAR.Main.DBUtils 
import							GHC.Generics

data OptionPricer = OptionPricer {
	optionSymbol :: T.Text
	, optionType :: T.Text
	, averaging :: T.Text 
	, spotPrice :: Double
	, strikePrice  :: Double
	, riskFreeInterestRate :: Double 
	, dividendYield :: Double
	, volatility :: Double 
	, timeToMaturity :: Double 
	, randomWalks ::  Int 
	, price :: Double
	, optionChain :: OptionChain
	, bidRatio :: Double
	, commandType :: T.Text

} deriving (Show, Generic, Typeable)

instance ToJSON OptionPricer 
instance FromJSON OptionPricer

