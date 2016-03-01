module CCAR.Data.Stats
	(computeChange, linearRegression, Gradient, Intercept, computeLogChange, computePctChange) where
import 							Control.Monad.State as State
import 							Data.List as List
import            				Math.Combinatorics.Exact.Binomial 


change  :: [a]-> State (a , [(a , a)]) ()
change [] = return ()
change (x: xs) = do
	(prev, l) <- State.get 
	put (x, (x, prev) : l) 
	change xs


computeChange =  \x -> flip execState (0, []) $ change x

logEvaluator prev current = (log prev)/(log current)
pctEvaluotor prev current = (current - prev ) * 100/ prev
computeLogChange input = computeChangeI input logEvaluator
computePctChange input = computeChangeI input pctEvaluotor
computeChangeI input evaluotorFunction = 
	List.map (\(x, y) -> (evaluotorFunction y x)) 
	$ List.filter ( \(x, y) -> (x /= 0) && (y /= 0)) 
		changeArray 
	where 
		(_, changeArray) = computeChange input




average ::(Fractional a, Real a1) => [a1] -> a 
average xs = realToFrac (sum xs) / fromIntegral (List.length xs)

{-- Probability mass function to compute some mass histogram for a probability--}
probabilityMassFunction :: Integral a => a -> a -> Double -> Double 
probabilityMassFunction k n p = (fromIntegral (n `choose` k)) * (p^k) * ((1 - p)^(n - k))


standardDeviation :: [Double] -> Double
standardDeviation values = (sqrt . sum $ List.map (\x -> (x - mu) * (x - mu)) values) /sqrt_nm1
			where 
				mu = average values
				sqrt_nm1 = sqrt $ (genericLength values - 1)

{-- Compute standard error. I see how precicion was built-into statistics --}
standardError = \input -> standardDeviation input/ (sqrt $ genericLength input)


{-- Compute the variance --}
variance :: [Double] -> Double
variance values = (sum $ List.map (\x -> (x - mu) * (x - mu)) values) /sqrt_nm1
			where 
				mu = average values
				sqrt_nm1 = genericLength values

{-- covariance x y :--}
covariance :: [Double] -> [Double] -> Double
covariance x y = average $ List.zipWith (\xi yi -> (xi - xavg) *(yi - yavg)) x y 
				where 
					xavg = average x 
					yavg = average y

{-- Pearson r correlation coefficient --}
pearsonR :: [Double] -> [Double] -> Double
pearsonR x y = r 
	where 
		xstddev = standardDeviation x 
		ystddev = standardDeviation y 
		r = covariance x y / (xstddev * ystddev)

pearsonRSquared :: [Double] -> [Double] -> Double
pearsonRSquared x y = pearsonR x y ^ 2

{-- Linear regression or beta to find a best-fit line.--}
type Gradient = Double
type Intercept = Double
linearRegression :: [Double] -> [Double] -> (Gradient, Intercept)
linearRegression x y = (gradient, intercept) 
	where
		xavg = average x 
		yavg = average y 
		gradient = covariance x y / (variance y)
		intercept = yavg - (gradient * xavg)
