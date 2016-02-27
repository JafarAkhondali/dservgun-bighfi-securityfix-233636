module CCAR.Tests.EquityAnalytics

where 
import Test.HUnit
import CCAR.Analytics.EquityAnalytics


testChange = computeChange [0,1,2,3]

testCase1 = do 
	(l, changes) <- return $ computeChange [0, 1, 2, 3]
	putStrLn $ show changes
	assertBool "Last number should be 3 " (l == 3)


testCase2 = return $ computeLogChange ([0, 1, 2, 3]) 

testCase3 = return $ computePctChange ([0, 1, 2, 3])