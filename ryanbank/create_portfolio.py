
# Create  portfolios in JSON format
import json
from collections import defaultdict

portfolio_dir = r'c:\\temp\\data\\'   # Change format for UNIX env

def tree(): return defaultdict(tree)
users = tree()

# Parameters to  create dummy portfolio
companies = ['RB']
regions = ['AMR', 'EMEA']
desks = ['Bond', 'FX', 'IRS']
books = ['B1', 'B2']
positions = ['P1', 'P2']
riskFactors = ['dur', 'mdur', 'DV01'] # + ...'convx', 'delta', 'gamma', 'vega', 'rho', 'theta']

risk = 1  # for now assign risk in increasing order for debugging

for company in companies:
    for region in regions:
        for desk in desks:
            for book in books:
                portfolio_name = company + '_' + region + '_' + desk + '_' + book
                portfolio = tree()
                for position in positions:
                    for riskFactor in riskFactors:
                        portfolio[region][desk][book][position][riskFactor] = risk
                        risk += 1

                with open(portfolio_dir + portfolio_name + '.json', 'wb') as handle:
                    json.dump(portfolio, handle)
