
module CCAR.Main.OptionUtils where 
import Control.Applicative
import Text.ParserCombinators.Parsec as Parsec
import Numeric

-- handle special cases for reading option data from the database.


p_optionStrike = do 
    s <- getInput
    case readSigned readFloat s of 
        [(n, s')] -> n <$ setInput s'
        _         -> Control.Applicative.empty 
parse_option_strike input = 
    case parse p_optionStrike ("unknown") input of 
        Right x -> x 
        Left _ -> 0.0

parse_float = parse_option_strike

parse_float_j = do 
    _ <- getInput 
    _ <- string "Just " 
    s <- getInput
    case readSigned readFloat s of 
        [(n, s')] -> n <$ setInput s'
        _         -> Control.Applicative.empty 

parse_float_with_maybe :: forall a. RealFrac a => String -> a
parse_float_with_maybe input = do 
    case parse parse_float_j ("Unknown") input of 
        Right x -> x 
        Left _ -> 0.0
