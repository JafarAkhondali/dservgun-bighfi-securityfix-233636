module CCAR.Tests.EquityAnalytics

where 
import Test.HUnit
import CCAR.Analytics.EquityAnalytics
import Data.Monoid
import Data.Foldable

import Language.Haskell.Interpreter
testChange = computeChange [0,1,2,3]

testCase1 = do 
	(l, changes) <- return $ computeChange [0, 1, 2, 3]
	putStrLn $ show changes
	assertBool "Last number should be 3 " (l == 3)


testCase2 = return $ computeLogChange ([0, 1, 2, 3]) 

testCase3 = return $ computePctChange ([0, 1, 2, 3])



{--TODO: To setup the test case for beta, we need to create some symbols, portfolios.--}
testPBeta = portfolioBeta  "72e4540c-a4c6-11e5-8001-ecf4bb2e10a3" "01/03/2016" "02/26/2016"

data BinaryTree v c = Node v c (BinaryTree v c) (BinaryTree v c)
						| Leaf
						deriving (Show, Eq, Ord)

treeInsert :: (Ord v, Monoid c) => v -> c -> BinaryTree v c -> BinaryTree v c 
treeInsert v c (Node v2 c2 l r) = 
	case compare v v2 of 
		EQ -> Node v2 c2 l r
		LT -> let 
				newLeft = treeInsert v c l
				newCache = c <> cached newLeft <> cached r
				in 
					Node v2 newCache newLeft r
		GT -> let 
				newRight = treeInsert v c r 
				newCache = c <> cached l <> cached newRight 
			 	in 
			 		Node v2 newCache l newRight

treeInsert v c Leaf = Node v c Leaf Leaf

treeFromList :: [Double] -> BinaryTree Double Min
treeFromList = \i -> Prelude.foldr (\x t -> treeInsert x (Min x) t) Leaf i 


cached :: Monoid c => BinaryTree v c -> c
cached (Node _ c _ _) = c 
cached Leaf = mempty

newtype Min = Min Double deriving Show 
instance Monoid Min where
	mempty = Min infinity where infinity = 1 / 0 
	mappend (Min x) (Min y) = Min $ min x y


type TravelGuidePrice = Double 
modifyTravelGuidePrice :: (Functor a) => Double -> a TravelGuidePrice -> a TravelGuidePrice 
modifyTravelGuidePrice x y = fmap (\a -> x * a) y 

data MyMaybe a = MyNothing | MyJust a deriving Show
instance Functor MyMaybe where 
	fmap f MyNothing = MyNothing 
	fmap f (MyJust x) = MyJust (f x)

instance Foldable MyMaybe where
	fold (MyNothing) = mempty 
	fold (MyJust x) = x <> mempty
	--foldMap :: (Monoid m, Foldable t) => (a -> m) -> t a -> m
	foldMap f (MyNothing) = mempty
	foldMap f (MyJust x) = f x

testFoldMap :: Sum Int
testFoldMap = foldMap (*1) $ Right $ Sum 12

testFoldMap2 :: Either String (Sum Int) 
testFoldMap2 = undefined --foldMap (*1) [Right $ Sum 12, Right $ Sum 13]

say :: String -> Interpreter ()
say = liftIO . putStrLn 


testInterpret :: String -> Interpreter String
testInterpret aString = do 
	setImportsQ [("Prelude", Nothing), ("Data.Map", Just "M")]
	interpret aString infer

testNeg :: Int -> Either (String, [Int]) Int 
testNeg x = if x > 0 then 
				Right x 
			else 
				Left ("Negative numbers not allowed", [x])