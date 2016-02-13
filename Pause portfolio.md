Objective
====================

Suppose a user has a portfolio where he/she is jittery about potential downtrend in the market or going for vacation or involved in busy project or something can’t focus on his/her portfolio for specific time and doesn’t want to sell or rebalance the portfolio. For the user if offered a pause portfolio program where he buys a pause for certain no of days for certain price ( we will provide that matrix of price and duration). after he buys this pause, his portfolio is immune to market movement. His portfolio should be long only stocks and cash/options would not come under pause program. Also he can’t choose the sub portfolio from his portfolio. It needs to be on whole portfolio level. At the end of each day (till duration of his pause)the user will get paid (credit) for closing prices valuation amount if it’s down otherwise it will be a debit. And we cash settle at the end of duration.

Remember the user is not transferring or changing the composition of the portfolio, we will just mirror the portfolio and call it P(i,t) (ith portfolio for time t which is the duration for which they bought the pause).

Our global portfolio (call it GP) will comprise of all P(i,t). Since time could be different for each portfolio, the first order is to group them under same time horizon. 

Most of the company have no short trading policy but this shouldn’t come under that because user is not changing portfolio composition and he/she is able to focus more on important work than the portfolio so helping the organization on employee’s efficiency.

How do we do that:

Determine pausability: focus on P(i,t) only

Identify sector, index and specific for individual stocks. Determine corporate events and dividends schedule. Find out beta (by historical analysis):

Apply negative and positive shocks using sector, index and individual scenarios: simulate returns.. find out skew…

Regress option data (put contracts) with individual and index options to find out best hedge (expiry and strike)

 

Figure out cost vs hedge percentage. Run analysis with shocks again and calculate net impact. See if by merging to GP the cost reduces.

Then we go for pricing for pause…

Thru the API hedge algo should be able to transact on hedges on realtime basis.

 

This is not entirely risk free process because we can’t find perfect hedge but to our work it’s the negative return which needs to be protected so upside potential helps us overcome some of the imperfectness of hedges.  Since the pause program is taking risk but very calculated and minimal and supervised there is more chance to make money.


Pause portfolio user interface

Allow a user to pause their portfolio. When the user pauses a portfolio, they suspend the risk on their portfolio for the duration of the pause. Assume that the user needs the ability to pause a portion of their portfolio or the entire portfolio.


Pause portfolio service

This service accumulates all the portfolios that are paused into a scaled (unscaled accumulated) portfolio for the advisor. This jumbo portfolio 
maintains 
	. Stress scenarios across a variety of segments and its impact on the portfolio. 
	. An optimum portfolio of puts to hedge the portfolio against.


Stress details: 
	. Individual stock.
	. Market segment
	. Index


Hedge details:
	. (Strike, expiration) for each put in the portfolio.


Hedge summary
	. Annualized returns over the time.

Back testing
	. Pause the portfolio between start date and end date.
	. Return all the historical data for the stock and options between the dates

Market events
	. Market 
		. FOMC
		. NFP
	. Index
		. ??
	. Sector
		. ??
	. Individual stock
		. Earnings report
		. Corporate events.


Portfolio constraints
	. Cash to stock ratio if any
	. Kind of positions allowed : (Long, Short, SS etc.)



Global requirement:
	. A query language based on the analytics across a variety of products.
		. select options with bidRatio >= x, bidStrikeRatio >= y sort by bidRatio, bidStrikeRatio desc for symbol = ABC
		. select option with strikePrice > 10 pct of (last, open) for ABC. 
		. select option with lastBid > theoretical for option = ABCXXXXXXX (option symbol)
		


##### How to create a global paused portfolio
	* If a global paused portfolio exists that has a start date earlier to 
	the users portfolio and end date greater than the paused portfolio, then
	add the users pause to the global pause.
	* If no such global pause exists, then, create one and add the user's pause to 
	  this global pause. -- How to deal with this?


##### User interface notes:
	* User should be presented with a list of probably start and end dates based on 
		the list of portfolios that are being actively paused.

#### Data model

        GlobalPausedPortfolio json
        	pausePortfolio PausedPortfolioId 
        	startDate UTCTime default=CURRENT_TIMESTAMP
        	endDate UTCTime default=CURRENT_TIMESTAMP
        	createdBy PersonId 
        	createdOn UTCTime default=CURRENT_TIMESTAMP
        	updatedBy PersonId 
        	updatedOn UTCTime default=CURRENT_TIMESTAMP
        -- Hedges are maintained daily till the portfolio is unpaused.        	
        PausedPortfolioHedge json 
            portfolio PausedPortfolioId 
            currentValue Double
            hedgeDate UTCTime default=CURRENT_TIMESTAMP 
            createdBy PersonId 
            createdOn UTCTime default=CURRENT_TIMESTAMP 
            updatedBy PersonId 
            updatedOn UTCTime default=CURRENT_TIMESTAMP
            deriving Show Eq 
        PausedPortfolioHedgeInstrument json 
            hedge PausedPortfolioHedgeId 
            option OptionChainId 
            createdBy PersonId 
            createdOn UTCTime default=CURRENT_TIMESTAMP
            updatedBy PersonId 
            updatedOn UTCTime default=CURRENT_TIMESTAMP
            deriving Show Eq 

        PausedPortfolio json 
            companyUserId CompanyUserId 
            uuid Text 
            summary Text
            startDate UTCTime default=CURRENT_TIMESTAMP
            endDate UTCTime default=CURRENT_TIMESTAMP
            createdBy PersonId 
            createdOn UTCTime default=CURRENT_TIMESTAMP
            updatedBy PersonId 
            updatedOn UTCTime default=CURRENT_TIMESTAMP
            deriving Show Eq
        PausedPortfolioSymbol json 
            portfolio PausedPortfolioId 
            symbol Text 
            quantity Text 
            side PortfolioSymbolSide
            value Double default=0.0
            createdBy PersonId 
            createdOn UTCTime default=CURRENT_TIMESTAMP
            updatedBy PersonId 
            updatedOn UTCTime default=CURRENT_TIMESTAMP
            deriving Show Eq 
        PausedPortfolioStress json 
            scenarioName Text 
            scenarioText Text
            pausedPortfolio PausedPortfolioId
            createdBy PersonId
            createdOn UTCTime default=CURRENT_TIMESTAMP
            updateBy PersonId 
            updatedOn UTCTime default=CURRENT_TIMESTAMP
            deriving Show Eq 
        PausedPortfolioStressResult json
            stress PausedPortfolioStressId 
            summary Text 
            createdBy PersonId
            createdOn UTCTime default=CURRENT_TIMESTAMP
            updatedBy PersonId 
            updatedOn UTCTime default=CURRENT_TIMESTAMP
            deriving Show Eq 
        PausedPortfolioStressSymbol json 
            result PausedPortfolioStressResultId 
            symbol Text 
            quantity Text 
            side PortfolioSymbolSide 
            stress Text -- The individual symbol stress (derived from the value in the global stress)
            createdBy PersonId 
            createdOn UTCTime default=CURRENT_TIMESTAMP
            updatedBy PersonId 
            updatedOn UTCTime default=CURRENT_TIMESTAMP
            deriving Show Eq 


