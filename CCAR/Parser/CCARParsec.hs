{--License: license.txt --}
module CCAR.Parser.CCARParsec 
    (readExpr, readExprTree, Stress)
where

import Import
import Data.Text as Text
import CCAR.Model.CcarDataTypes
import CCAR.Model.Maturity
import Control.Monad

syntaxError :: Text -> CCARError
syntaxError = \i -> CCARError $ Text.append "Invalid symbol " i



readExprTree :: Text -> Either ParseError ([Stress], SourcePos) 
readExprTree = \input -> parse parseStatements (Text.unpack $ msg $ syntaxError input)
                            (Text.unpack input)

readExpr :: Text -> Value
readExpr input = case parse (parseStatements) (Text.unpack $ msg $ syntaxError input) (Text.unpack input) of 
    Left parseError ->  toJSON $ syntaxError (pack $ show $ errorPos parseError)
    Right (val, pos) -> toJSON $ (val, show pos)



{-- 
    Basis points are usually in integer.
    Percentages can have floating points therefore lets use rational numbers
--}



spaces :: Parser ()
spaces = skipMany1 space


parseNeg :: Parser Sign
parseNeg = do
    char '-'
    return Negative

parsePos :: Parser Sign
parsePos = do
    char '+'
    return Positive

parseSign :: Parser Sign
parseSign = do
    try parseNeg 
    <|> try parsePos
    <|> return Positive
    <?> "Error parsing sign"

parseBasisPoints :: Parser StressValue
parseBasisPoints = do
        string "bps"
        spaces
        sign <- parseSign 
        many space
        pNum <- many1 alphaNum
        return $ BasisPoints sign $ read (pNum)  



parsePercentage :: Parser StressValue
parsePercentage = do
        _ <- string "pct"
        spaces
        sign <- parseSign
        many space
        pNum <- many1 alphaNum
        spaces
        many space
        _ <- string "%"
        spaces
        pDenom <- liftM read $ many1 digit
        if (pDenom == (0 :: Integer))
            then return $ StressValueError "Divide by zero"
            else return $ Percentage sign $ read (pNum ++ "%" ++ (show pDenom))


parseStressValue :: Parser StressValue
parseStressValue = try parsePercentage 
                <|> try parseBasisPoints 
                <?> "Error parsing stress value"
parseCurrencyStress :: Parser Stress
parseCurrencyStress = do
    _ <- string "Create"
    spaces
    _ <- string "Currency"
    spaces
    _ <- string "Shock"
    spaces
    _ <- string "for"
    spaces
    _ <- string "major"
    spaces
    curr1 <- many1 alphaNum
    spaces
    _ <- string "minor"
    spaces
    curr2 <-many1 alphaNum
    spaces
    stressValue <- parseStressValue
    return $ CurrencyStress  (CurrencyPair (Currency curr1) (Currency curr2)) stressValue


parseEquityStress :: Parser Stress
parseEquityStress = do 
        _ <- string "Create"
        spaces
        _ <- string "Equity"
        spaces 
        _ <- string "Shock"
        spaces
        _ <- string "for"
        spaces
        equitySymbol <- many1 alphaNum
        spaces
        stressValue <- parseStressValue
        return $ EquityStress (Equity equitySymbol) stressValue

parseIndexStress :: Parser Stress 
parseIndexStress = do 
        _ <- string "Create"
        spaces
        _ <- string "Index"
        spaces 
        _ <- string "Shock"
        spaces
        _ <- string "for"
        spaces
        equitySymbol <- many1 alphaNum
        spaces
        stressValue <- parseStressValue
        return $ IndexStress (Index equitySymbol) stressValue

parseSectorStress :: Parser Stress
parseSectorStress = do 
        _ <- string "Create"
        spaces
        _ <- string "Sector"
        spaces 
        _ <- string "Shock"
        spaces
        _ <- string "for"
        spaces
        equitySymbol <- many1 alphaNum
        spaces
        stressValue <- parseStressValue
        return $ SectorStress (Sector equitySymbol) stressValue


parseOptionStress :: Parser Stress
parseOptionStress = do
        _ <- string "Create"
        spaces
        _ <- string "Option"
        spaces
        _ <- string "Shock"
        spaces
        _ <- string "for"
        spaces
        optionSymbol <- many1 alphaNum
        spaces
        _ <- string "Exp"
        spaces
        month <- many1 alphaNum -- Read of month needs to support APR/4 and should be less than 13
        spaces
        year <- many1 alphaNum
        spaces
        _ <- string "Strike"
        spaces
        price <- many1 alphaNum
        spaces
        stressValue <- parseStressValue
        return $ OptionStress (CCAROption optionSymbol (Exp (read month) (read year)) (Str $ read price))
                    stressValue


parseTenorValue :: Parser (Mat, StressValue)
parseTenorValue = do
    _ <- string "("
    tenorValue <- many1 digit
    tenorPeriod <- many1 alphaNum
    _ <- many space
    _ <- string "->"
    _ <- many space
    stressValue <-  parseStressValue
    _ <- string ")"
    return ((createMat tenorValue tenorPeriod), stressValue)
    where
        createMat tenorValue tenorPeriod =
            case tenorPeriod of
                "Y" -> checkBounds (MatY (read tenorValue))
                "M" -> MatM (read tenorValue)
                _ ->   InvalidMaturity

parseTenorCurve :: Parser [(Mat, StressValue)]
parseTenorCurve = do
    _ <- string "["
    _ <- many space
    tenors <- sepBy parseTenorValue (char ',')
    _ <- many space
    _ <- string "]" 
    return tenors

parseMaturity :: Parser Mat 
parseMaturity = do
    tenorValue <- many1 digit
    tenorPeriod <- many1 alphaNum
    return $ createMat tenorValue tenorPeriod
    where
    createMat tenorValue tenorPeriod =
        case tenorPeriod of
            "Y" -> MatY (read tenorValue)
            "M" -> MatM (read tenorValue)
            _ ->   InvalidMaturity

parseRatesStress :: Parser Stress
parseRatesStress = do
    _ <- string "Create"
    spaces
    _ <- string "Rates"
    spaces
    _ <- string "Shock"
    spaces
    _ <- string "for"
    spaces
    currency <- many1 alphaNum
    _ <- many space
    tenors <- parseTenorCurve
    return $ TenorStress (Currency currency) tenors

parseRatesVegaStress :: Parser Stress
parseRatesVegaStress = do
    _ <- string "Create"
    spaces
    _ <- string "Rates"
    spaces
    _ <- string "Vega"
    spaces
    _ <- string "Shock"
    spaces
    _ <- string "for"
    spaces
    currency <- many1 alphaNum
    spaces
    _ <- string "Expiry"
    spaces
    _ <- string "="
    spaces
    tenor <- parseMaturity
    _ <- many space 
    curve <- parseTenorCurve
    return $ TenorVegaStress (Currency currency) tenor curve

parserError :: Parser Stress 
parserError = do
    pos <- getPosition
    return . StressError . syntaxError . pack $ show pos
parseExpr :: Parser Stress
parseExpr = do 
        try parseEquityStress <|> try parseCurrencyStress
        <|> try parseOptionStress
        <|> try parseRatesStress
        <|> try parseRatesVegaStress
        <|> try parseIndexStress
        <|> try parseSectorStress
        <|> try parserError

parseStatements :: Parser([Stress], SourcePos)
parseStatements = do            
            x <- endBy parseExpr eol
            pos <- getPosition
            return (x, pos)

eol :: Parser String
eol = do 
    try (string ";\n")
    <|> try (string ";")