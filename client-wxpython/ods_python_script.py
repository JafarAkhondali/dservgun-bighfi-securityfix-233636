import sys
print("Using " + str(sys.version))
import urllib
import os
os.environ['PYTHONASYNCIODEBUG'] = '1'
import asyncio
import websockets
import traceback
import json
import ssl
import threading
import logging
import datetime
import copy
logging.basicConfig(filename="odspythonscript.log", level = logging.DEBUG, filemode = "w", format="format=%(asctime)s %(name)-12s %(levelname)-8s %(message)s")

logger = logging.getLogger(__name__)    
logger.debug("Loaded script file")




##### Note: Requires python 3.4 or above
##### It seems to be that all functions in a macro need to reside in a single file.
##### We will break them down into modules as the size of the macros grow.
##### 

##### Todo:
##### Package the server interaction as a library.


# Rectangle aRect = new Rectangle( aUpperLeft.X, aUpperLeft.Y, aExtent.Width, aExtent.Height );

#      CellRangeAddress[] aAddresses = new CellRangeAddress[ 1 ];
#      aAddresses[ 0 ] = aRange;

#      // first bool: ColumnHeaders
#      // second bool: RowHeaders
#      aChartCollection.addNewByName( sChartName, aRect, aAddresses, true, false );

#      try
#      {
#          XTableChart aTableChart = UnoRuntime.queryInterface(
#              XTableChart.class, aChartCollectionNA.getByName( sChartName ));

#          // the table chart is an embedded object which contains the chart document
#          aResult = UnoRuntime.queryInterface(
#              XChartDocument.class,
#              UnoRuntime.queryInterface(
#                  XEmbeddedObjectSupplier.class,
#                  aTableChart ).getEmbeddedObject());

#          // create a diagram via the factory and set this as new diagram
#          aResult.setDiagram(
#              UnoRuntime.queryInterface(
#                  XDiagram.class,
#                  UnoRuntime.queryInterface(
#                      XMultiServiceFactory.class,
#                      aResult ).createInstance( sChartServiceName )));
#      }
#      catch( NoSuchElementException ex )
#      {
#          System.out.println( "Couldn't find chart with name " + sChartName + ": " + ex );
#      }
#      catch( Exception ex )
#      {}
#  }

LOGIN_COMMAND = 1000
CCAR_UPLOAD_COMMAND = 1001
MANAGE_COMPANY = 1002
SELECT_ALL_COMPANIES = 1003
QUERY_SUPPORTED_SCRIPTS = 1004
QUERY_ACTIVE_WORKBENCHES = 1005
MANAGE_WORKBENCH = 1006
EXECUTE_WORKBENCH = 1007
SELECT_ACTIVE_PROJECTS = 1008
MANAGE_PROJECT = 1009
PARSED_CCAR_TEXT = 1010
MANAGE_USER = 1011
CREATE_USER_TERMS = 1012
UPDATE_USER_TERMS = 1013
DELETE_USER_TERMS = 1014
QUERY_USER_TERMS = 1015
CREATE_USER_PREFERENCES = 1016
UPDATE_USER_PREFERENCES = 1017
QUERY_USER_PREFERENCES = 1018
DELETE_USER_PREFERENCES = 1019
SEND_MESSAGE = 1020
USER_JOINED = 1021
USER_BANNED = 1022
USER_LOGGED_IN = 1023
USER_LEFT = 1024
ASSIGN_COMPANY = 1025
KEEP_ALIVE = 1026
PORTFOLIO_SYMBOL_TYPES_QUERY = 1027
PORTFOLIO_SYMBOL_SIDES_QUERY = 1028
QUERY_PORTFOLIOS = 1029
MANAGE_PORTFOLIO = 1030
MANAGE_PORTFOLIO_SYMBOL =1031
QUERY_PORTFOLIO_SYMBOL = 1032
MANAGE_ENTITLEMENTS = 1033
QUERY_ENTITLEMENTS = 1034
QUERY_COMPANY_USERS = 1035
MARKET_DATA_UPDATE = 1036
OPTION_ANALYTICS = 1037
QUERY_MARKET_DATA = 1038
HISTORICAL_STRESS_VALUE_COMMAND = 1039
QUERY_OPTION_CHAIN = 1040
UNDEFINED = 1041
COMPANY_SELECTION_LIST_CONTROL = "BrokerList"
COMPANY_SELECTION_LIST_CONTROL_INDEX = 0


## Display a dictionary on the spreadsheet.
## Clients update elements to the map
## Display an element if needed.
## Clients request for the next available row index.
class TableDisplay:
    def __init__(self):
        logger.debug ("Creating table display")
        self.startRow = 2
        # The next available row. Count the header as 
        # the first row.
        self.availableRowIndex = 2
        self.dataMap = {}
        self.indexMap = {}
    def add(self, anEntry):
        key = anEntry.key()
        if key in self.indexMap:
            pass
        else:
            self.indexMap[key] = self.availableRowIndex 
            self.availableRowIndex = self.availableRowIndex + 1
        self.dataMap[key] = anEntry

    def getComputedRow(self, anEntry):
        return self.indexMap[anEntry.key()]

# Design notes: 
# Use composition over inheritance.
class Util:
    # Indexes are zero based.
    @staticmethod
    def getWorksheetByIndex(worksheetIndex): 
        desktop = XSCRIPTCONTEXT.getDesktop()
        model = desktop.getCurrentComponent()
        sheet = model.Sheets.getByIndex(worksheetIndex)    

    @staticmethod
    def getWorksheetByName(worksheetName): 
        desktop = XSCRIPTCONTEXT.getDesktop()
        model = desktop.getCurrentComponent()
        if model == None: 
            logger.fatal("This can never happen")
        sheet = model.Sheets.getByName(worksheetName) 
        return sheet   
    @staticmethod
    def convertToBool(aString):    
        bool(aString)
    @staticmethod
    def updateCellContent(worksheet, cell, value):
        try:
            logger.debug("Updating worksheet by name " + worksheet + str(cell) + ": Value " + str(value))
            sheet = Util.getWorksheetByName(worksheet)
            tRange = sheet.getCellRangeByName(cell)
            tRange.String = value
        except:
            logger.error(traceback.format_exc())
    @staticmethod
    @asyncio.coroutine
    def updateCellContentT(worksheet, cell,value):
        Util.updateCellContent(worksheet, cell, value)
    @staticmethod 
    def workSheetExists(aName):
        sheet = Util.getWorksheetByName(aName);
    @staticmethod
    def insertNewWorksheet(aName): 
        if aName == None:
            return None
        desktop = XSCRIPTCONTEXT.getDesktop()
        model = desktop.getCurrentComponent()
        logger.debug("Model " + str(model.Sheets))
        logger.debug("Creating new sheet " + aName)
        newSheet = model.Sheets.insertNewByName(aName, 1)
        return newSheet

class OptionChain: 
    def __init__(self, jsonRecord) :
        logger.debug("Creating option chain " + str(jsonRecord))
        self.lastBid = jsonRecord["lastBid"]
        self.strike = jsonRecord["strike"]
        self.change = jsonRecord["change"]
        self.optionType = jsonRecord["optionType"]
        self.expiration = jsonRecord["expiration"]
        self.symbol = jsonRecord["symbol"]
        self.lastPrice = jsonRecord["lastPrice"]
        self.openInterest = jsonRecord["openInterest"]
        self.underlying = jsonRecord["underlying"]
        self.lastAsk = jsonRecord["lastAsk"]
    def key(self):
            return (self.symbol + self.underlying + self.strike + self.expiration)

class PortfolioSymbolParseError(Exception) : 
        def __init__(self, value):
            self.value = value
        def __str__(self): 
            return repr(self.value);
class PortfolioSymbol:
    # Deal with Right/Errors inside the constructor
    def __init__(self, jsonRecord) :
        self.commandType = ""
        self.portfolioId = jsonRecord["portfolioId"]
        self.symbol = jsonRecord["symbol"]
        self.quantity = jsonRecord["quantity"]
        self.side = jsonRecord["side"]
        self.symbolType = jsonRecord["symbolType"]
        self.value = jsonRecord["value"]
        self.stressValue = jsonRecord["stressValue"]
        self.creator = jsonRecord["creator"]
        self.updator = jsonRecord["updator"]
        self.nickName = jsonRecord["nickName"]
    def key(self): 
        return (self.symbol + self.side + self.symbolType + self.portfolioId);
class PortfolioSymbolTable :
    def __init__(self, ccarClient):
        self.ccarClient = ccarClient
        self.table = {}
        self.rowMap = {}
        self.currentRow = 2 # Exclude the header
    @asyncio.coroutine
    def add(self, portfolioSymbol):
        self.table[portfolioSymbol.key()] = portfolioSymbol
        if self.currentRow in self.rowMap:
            self.currentRow = self.currentRow + 1
            self.rowMap[portfolioSymbol.key()] = self.currentRow
        else:
            self.rowMap[portfolioSymbol.key()] = self.currentRow
            self.currentRow = self.currentRow + 1
        yield from self.updatePortfolioDetails(portfolioSymbol);
        return portfolioSymbol
    def getPortfolioSymbols(self):
            return table.values()

    def updatePortfolioDetails(self, value):
        logger.debug("Updating spreadsheet with " + str(value) + " Row number " + 
                            str(self.rowMap[value.key()]))
        portfolioId = value.portfolioId
        row = self.rowMap[value.key()]
        yield from self.ccarClient.loop.create_task(Util.updateCellContentT(portfolioId, "A" + str(row), value.symbol))
        yield from self.ccarClient.loop.create_task(Util.updateCellContentT(portfolioId, "B" + str(row), value.quantity))
        yield from self.ccarClient.loop.create_task(Util.updateCellContentT(portfolioId, "C" + str(row), value.side))
        yield from self.ccarClient.loop.create_task(Util.updateCellContentT(portfolioId, "D" + str(row), value.symbolType))
        yield from self.ccarClient.loop.create_task(Util.updateCellContentT(portfolioId, "E" + str(row), value.value))
        yield from self.ccarClient.loop.create_task(Util.updateCellContentT(portfolioId, "F" + str(row), value.stressValue))
        yield from self.ccarClient.loop.create_task(Util.updateCellContentT(portfolioId, "G" + str(row), str(datetime.datetime.now())))
        yield from asyncio.sleep(0.01, loop = self.ccarClient.loop)


class PortfolioGroup:
    def __init__(self, ccarClient, portfolioSummaries):
        self.ccarClient = ccarClient
        self.portfolioWorksheet = "portfolio_analysis_sheet"
        self.portfolioDetailCount = 0
        self.portfolioDetailStartRow = 5
        self.portfolioSymbolTable = None
        self.portfolioDetailColumns = {"companyId" : "A"
                                        , "portfolioId" : "B"
                                        , "summary" : "C" }
        self.portfolioSummaries = portfolioSummaries
        # A dictionary of portfolio id to portfolio symbol table
        self.portfolioGroupDictionary = {}
        # Return the broker managing a given portfolio.
        self.brokerDictionary = {};
        self.portfolioGroupWorksheets = {}

    def updateContents(self):
        for summaryDictionary in self.portfolioSummaries:
            summary = summaryDictionary["Right"]

            cellPosition = str(self.portfolioDetailCount + self.portfolioDetailStartRow)
            companyCol = self.portfolioDetailColumns["companyId"]
            portfolioCol = self.portfolioDetailColumns["portfolioId"]
            summaryCol = self.portfolioDetailColumns["summary"]
            self.brokerDictionary[portfolioCol] = companyCol
            Util.updateCellContent(self.portfolioWorksheet, 
                                summaryCol + cellPosition, summary["summary"])
            Util.updateCellContent(self.portfolioWorksheet, 
                                portfolioCol + cellPosition, summary["portfolioId"])
            Util.updateCellContent(self.portfolioWorksheet, 
                                companyCol + cellPosition, summary["companyId"])
            self.portfolioDetailCount  = self.portfolioDetailCount + 1                            
            newSheet = Util.insertNewWorksheet(summary["portfolioId"])
            self.createRows(summary["portfolioId"])
            self.portfolioGroupWorksheets[summary["portfolioId"]] = newSheet
            


    def createRows(self, aWorksheetName):
        Util.updateCellContent(aWorksheetName, "A1", "Symbol")
        Util.updateCellContent(aWorksheetName, "B1", "Quantity")
        Util.updateCellContent(aWorksheetName, "C1", "Side")
        Util.updateCellContent(aWorksheetName, "D1" ,  "SymbolType")
        Util.updateCellContent(aWorksheetName, "E1", "Value")
        Util.updateCellContent(aWorksheetName, "F1", "Stress value")
        Util.updateCellContent(aWorksheetName, "G1", "Last update time")


    def sendPortfolioRequests(self):
        # var payload : PortfolioSymbolQueryT = {
        #     commandType : "QueryPortfolioSymbol"
        #     , portfolioId : activePortfolio.portfolioId
        #     , nickName : MBooks_im.getSingleton().getNickName()
        #     , resultSet : []
        # }
        for portfolio in self.portfolioSummaries:
            summary = portfolio["Right"]
            payload = {
                'commandType' : "QueryPortfolioSymbol"
                , 'nickName' : self.ccarClient.getUserName()
                , 'portfolioId' : summary["portfolioId"]
                , 'resultSet' : []
            }
            self.ccarClient.sendAsTask(payload);
    def updateAndSend(self):
        self.updateContents()
        self.sendPortfolioRequests()
    def getPortfolioSymbolTable(self, portfolioId):
        result = None
        if portfolioId in self.portfolioGroupDictionary:
            result = self.portfolioGroupDictionary[portfolioId]
        else:
            result = PortfolioSymbolTable(self.ccarClient)
            self.portfolioGroupDictionary[portfolioId] = result

        assert (result != None), "Portfolio symbol table for %s not found" % portfolioId
        return self.portfolioGroupDictionary[portfolioId];

    def sendAsTask(self, payload):
        self.ccarClient.sendAsTask(payload);

    @asyncio.coroutine
    def sendQueryOptionChain(self, portfolioSymbol):
        if portfolioSymbol.portfolioId == portfolioSymbol.symbol:
            return;
        payload = {
            "commandType" : "QueryOptionChain"
            , "nickName" : self.ccarClient.getUserName()
            , "underlying" : portfolioSymbol.symbol
            , "optionChain" : []
        }
        yield from self.ccarClient.send(payload)
    @asyncio.coroutine
    def sendMarketDataQueryRequest(self, portfolioSymbol):
        if portfolioSymbol.portfolioId == portfolioSymbol.symbol:
            return;
        payload = {
        'commandType' : "QueryMarketData"
        , 'nickName' : self.ccarClient.getUserName()
        , 'symbol' : "select historical for " + portfolioSymbol.symbol + ";"
        , 'portfolioId' : portfolioSymbol.portfolioId
        , 'resultSet' : []
        }
        logger.debug("Sending market data request " + str(payload))
        if payload == None:
            return

        yield from self.ccarClient.send(payload);

    @asyncio.coroutine
    def updateUsingManagePortfolioSymbol(self, jsonResponse):
        try:
            logger.debug("Updating using manage portfolio symbol response " + str(jsonResponse))
            portfolioSymbol = PortfolioSymbol(jsonResponse);
            self. portfolioSymbolTable = self.getPortfolioSymbolTable(portfolioSymbol.portfolioId)
            self.ccarClient.loop.create_task(self.portfolioSymbolTable.add(portfolioSymbol))
        except:
            logger.error(traceback.format_exc())

    @asyncio.coroutine
    def handleQueryPortfolioSymbolResponse(self, jsonResponse):
        logger.debug("Handle query portfolio symbol response " + str(jsonResponse))
        resultSet = jsonResponse["resultSet"]
        try :
            for result in resultSet:
                logger.debug("Result " + str(result)) 
                x = result["Right"]
                portfolioSymbol = PortfolioSymbol(x);
                logger.debug("Adding portfolio symbol " + str(portfolioSymbol))
                self. portfolioSymbolTable = self.getPortfolioSymbolTable(portfolioSymbol.portfolioId)
                self.ccarClient.loop.create_task(self.portfolioSymbolTable.add(portfolioSymbol))
                self.ccarClient.loop.create_task(self.sendMarketDataQueryRequest(portfolioSymbol))
                self.ccarClient.loop.create_task(self.sendQueryOptionChain(portfolioSymbol))
                # Find the current row for the portfolio symbol.
                yield from asyncio.sleep(0.01, loop = self.ccarClient.loop)
        except:
            logger.error("Message " + str(result))
            logger.error(traceback.format_exc())
    @asyncio.coroutine
    def display(self):
        row = 2
        if(self.portfolioSymbolTable == None):
            logger.debug("Returning. Symbol table not found")
            return;
        logger.debug("Refreshing display for portfolio symbol table");
        pTable = copy.deepcopy(self.portfolioSymbolTable.table)
        for value in pTable.values():
            portfolioId = value.portfolioId
            if portfolioId == "INVALID PORTFOLIO":
                continue;
            logger.debug("Updating portfolio " + portfolioId)
            logger.debug("Processing " + str(value) + "--->" + portfolioId)
            yield from self.ccarClient.loop.create_task(Util.updateCellContentT(portfolioId, "A" + str(row), value.symbol))
            yield from self.ccarClient.loop.create_task(Util.updateCellContentT(portfolioId, "B" + str(row), value.quantity))
            yield from self.ccarClient.loop.create_task(Util.updateCellContentT(portfolioId, "C" + str(row), value.side))
            yield from self.ccarClient.loop.create_task(Util.updateCellContentT(portfolioId, "D" + str(row), value.symbolType))
            yield from self.ccarClient.loop.create_task(Util.updateCellContentT(portfolioId, "E" + str(row), value.value))
            yield from self.ccarClient.loop.create_task(Util.updateCellContentT(portfolioId, "F" + str(row), value.stressValue))
            yield from self.ccarClient.loop.create_task(Util.updateCellContentT(portfolioId, "G" + str(row), str(datetime.datetime.now())))
            yield from asyncio.sleep(0.01, loop = self.ccarClient.loop)
            row = row + 1

    @asyncio.coroutine
    def refreshDisplay(self):
        while True:
            self.ccarClient.loop.create_task(self.display())
            yield from asyncio.sleep(1, loop = self.ccarClient.loop)
    
    @asyncio.coroutine
    def sendMarketData(self):
        if self.portfolioSymbolTable == None:
            return;
        pTable = copy.deepcopy(self.portfolioSymbolTable.table)
        for value in pTable.values():
            portfolioId = value.portfolioId
            if portfolioId == "INVALID PORTFOLIO":
                continue;
            logger.debug("Updating portfolio " + portfolioId)
            logger.debug("Processing " + str(value) + "--->" + portfolioId)
            yield from self.ccarClient.loop.create_task(self.sendMarketDataQueryRequest(value))
            yield from asyncio.sleep(.1, loop = self.ccarClient.loop)


    @asyncio.coroutine
    def refreshMarketDataRequests(self):
        while True:
            self.ccarClient.loop.create_task(self.sendMarketData());
            yield from asyncio.sleep(.5, loop = self.ccarClient.loop)


class MarketDataTimeSeries:

    def __init__(self, symbol, high, low, openL, close, volume, date):
        self.high = high
        self.low = low
        self.open = openL
        self.close = close
        self.date =  date
        self.symbol = symbol
        self.volume = volume
    def printValue(self):
        return (str(self.date) + " " + self.symbol)
    def key(self):
        return self.symbol + self.date 
class MarketData:
    def __init__(self, symbol):
        self.timeSeries = {}
        self.symbol = symbol
    def add(self, event):
        self.timeSeries[event.date] = event
class CCARClient:
    def __init__(self):
        self.marketData = {}
        self.optionTable = TableDisplay()
        self.marketDataRow = 2
        self.marketDataRowMap = {} # 
        self.marketDataBak = {} # To swap dictionaries outside iteration.
        self.portfolioDetailCount = 0 
        self.portfolioDetailStartRow = 5
        self.portfolioDetailStartCol = "C"
        self.portfolioDetailStartCol1 = "D"
        self.portfolioGroup = None
        self.serverHandle = None
        self.INFO_ROW_COUNT = 30
        self.SECURITY_CELL = "B15"
        self.SECURITY_CELL_LOG = "B16"
        self.LOGIN_CELL = "B5"
        self.PASSWORD_CELL = "B6"
        self.ERROR_CELL = "A23"
        self.KEEP_ALIVE_CELL = "B25"
        self.MARKET_DATA_REFRESH_INTERVAL_CELL = "B26"
        self.ACTIVE_PORTFOLIO_INTERVAL_CELL = "B27"

        self.INFO_WORK_SHEET = 0
        self.marketDataRefreshInterval = 1
        self.activePortfolioInterval = 1 # An active portfolio ping request to update any stress data.
        self.marketDataSheet = "MarketDataSheet"
        self.optionDataSheet = "OptionMarketData"
    #get the doc from the scripting context which is made available to all scripts
        desktop = XSCRIPTCONTEXT.getDesktop()
        model = desktop.getCurrentComponent()
    #check whether there's already an opened document. Otherwise, create a new one
        if not hasattr(model, "Sheets"):
            model = desktop.loadComponentFromURL(
                "private:factory/scalc","_blank", 0, () )
    #get the XText interface
        sheet = model.Sheets.getByIndex(0)


    def INFO_CELL(self) : 
        return ("A" + str(self.INFO_ROW_COUNT))


    def getCellContent(self, aCell): 
        sheet = self.getWorksheet(0);
        tRange = sheet.getCellRangeByName(aCell)
        return tRange.String

    def certificateFileName(self):
        return self.getCellContent("E3")

    def getSSLClientContext(self):
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLSv1)
        sslCertificateFileName = self.certificateFileName()
        if sslCertificateFileName == "" or sslCertificateFileName == None:
            return None
        logger.debug("Using certificate " + self.certificateFileName())
        ssl_context.load_verify_locations(self.certificateFileName())
        ssl_context.verify_mode = ssl.CERT_REQUIRED
        return ssl_context


    def getWorksheet(self, anIndex) :
        desktop = XSCRIPTCONTEXT.getDesktop()
        model = desktop.getCurrentComponent()
        sheet = model.Sheets.getByIndex(anIndex)
        return sheet

    def clearInfoWorksheet(self):
        sheet = self.getWorksheet(self.INFO_WORK_SHEET);
        count = self.INFO_ROW_COUNT ## TBD: Needs to be a constant.
        while count < self.INFO_ROW_COUNT:
            cellId = "A" + str(count)
            trange = sheet.getCellRangeByName(cellId)
            trange.String = ""
            count = count + 1

    def updateInfoWorksheet(self, aMessage) :
        logger.info("Processing message " + aMessage);

    def clearErrorWorksheet(self):
        sheet = self.getWorksheet(0);
        tRange = sheet.getCellRangeByName(self.ERROR_CELL)
        tRange.String = ""

    def updateErrorWorksheet(self, aMessage) :
        sheet = self.getWorksheet(0);
        tRange = sheet.getCellRangeByName(self.ERROR_CELL)
        tRange.String = tRange.String + "\n" + (str (aMessage))

    def updateCellContent(self, aCell, aValue) : 
        sheet = self.getWorksheet(0);
        tRange = sheet.getCellRangeByName(aCell)
        tRange.String = aValue

    def getUserName(self) :
        return self.getCellContent(self.LOGIN_CELL)

    def clearCompanySelectionListBox(self):
        logger.debug("Clear the company selection list box")
        
    def clearCells(self):
        self.clearCompanySelectionListBox()
        self.clearInfoWorksheet();
        self.clearErrorWorksheet();
        self.INFO_ROW_COUNT = 30
        self.portfolioDetailCount = 0

    def getCompanySelectListBox(self):
    #get the doc from the scripting context which is made available to all scripts
        desktop = XSCRIPTCONTEXT.getDesktop()
        model = desktop.getCurrentComponent()
        sheet = model.Sheets.getByIndex(0)
        oDrawPage = sheet.DrawPage
        companyList = oDrawPage.getForms().getByIndex(0).getByName(COMPANY_SELECTION_LIST_CONTROL)
        companyListControl = model.getCurrentController().getControl(companyList)
        return companyListControl

    def commandDictionary (self) :
        return {
        u"Login"                 : LOGIN_COMMAND ,   
        "CCARUpload"            : CCAR_UPLOAD_COMMAND
        , "ManageCompany"           : MANAGE_COMPANY 
        , "SelectAllCompanies"      : SELECT_ALL_COMPANIES
        , "QuerySupportedScripts"   : QUERY_SUPPORTED_SCRIPTS 
        , "QueryActiveWorkbenches"  : QUERY_ACTIVE_WORKBENCHES
        , "ManageWorkbench"         : MANAGE_WORKBENCH 
        , "ExecuteWorkbench"        : EXECUTE_WORKBENCH
        , "SelectActiveProjects"    : SELECT_ACTIVE_PROJECTS 
        , "ManageProject"           : MANAGE_PROJECT
        , "ParsedCCARText"          : PARSED_CCAR_TEXT 
        , "ManageUser"              : MANAGE_USER
        , "CreateUserTerms"         : CREATE_USER_TERMS 
        , "UpdateUserTerms"         : UPDATE_USER_TERMS
        , "DeleteUserTerms"         : DELETE_USER_TERMS 
        , "QueryUserTerms"          : QUERY_USER_TERMS
        , "CreateUserPreferences"   : CREATE_USER_PREFERENCES 
        , "UpdateUserPreferences"   : UPDATE_USER_PREFERENCES
        , "QueryUserPreferences"    : QUERY_USER_PREFERENCES 
        , "DeleteUserPreferences"   : DELETE_USER_PREFERENCES
        , "SendMessage"             : SEND_MESSAGE
        , "UserJoined"              : USER_JOINED
        , "UserBanned"              : USER_BANNED 
        , "UserLoggedIn"            : USER_LOGGED_IN
        , "UserLeft"                : USER_LEFT 
        , "AssignCompany"           : ASSIGN_COMPANY
        , "KeepAlive"               : KEEP_ALIVE 
        , "PortfolioSymbolTypesQuery" : PORTFOLIO_SYMBOL_TYPES_QUERY
        , "PortfolioSymbolSidesQuery" : PORTFOLIO_SYMBOL_SIDES_QUERY 
        , "QueryPortfolios"         : QUERY_PORTFOLIOS
        , "ManagePortfolio"         : MANAGE_PORTFOLIO 
        , "ManagePortfolioSymbol"   : MANAGE_PORTFOLIO_SYMBOL
        , "QueryPortfolioSymbol"    : QUERY_PORTFOLIO_SYMBOL 
        , "ManageEntitlements"      : MANAGE_ENTITLEMENTS
        , "QueryEntitlements"       : QUERY_ENTITLEMENTS 
        ,"QueryCompanyUsers"       : QUERY_COMPANY_USERS
        , "MarketDataUpdate"        : MARKET_DATA_UPDATE
        , "OptionAnalytics"         : OPTION_ANALYTICS
        , "QueryMarketData"         : QUERY_MARKET_DATA 
        , "HistoricalStressValueCommand" : HISTORICAL_STRESS_VALUE_COMMAND
        , "QueryOptionChain"        : QUERY_OPTION_CHAIN
        , "Undefined"               : UNDEFINED
        }



    def getSecuritySettings(self) :
        # Return the security settings for this document.
        desktop = XSCRIPTCONTEXT.getDesktop()
        model = desktop.getCurrentComponent()
        sheet = model.Sheets.getByIndex(0)
        tRange = sheet.getCellRangeByName(self.SECURITY_CELL)
        tRangeO = sheet.getCellRangeByName(self.SECURITY_CELL_LOG)
        tRangeO.String = "Using " + tRange.String
        return tRange.String

    def sendSelectAllCompaniesRequest(self, aJsonMessage) :
        logger.debug("Processing sending select all companies " + str(aJsonMessage))
        payload = {
            'nickName' : self.getUserName()
            , 'commandType' : "SelectAllCompanies"
        };
        return payload

    def sendLoginRequest(self, userName, password) : 
        #create a login json request
        login = {
            u'commandType' : 'Login',
            u'nickName' : userName, 
            u'loginStatus' : "Undefined",
            u'login' : None
        }
        jsonLogin = json.dumps(login)
        logger.debug("Login request %s", jsonLogin)
        return jsonLogin

    def sendUserLoggedIn (self, jsonRequest): 
        userLoggedIn = {
            'nickName' : self.getUserName()
            , 'commandType' : 'UserLoggedIn'
            , 'userName' : self.getUserName()}
        return userLoggedIn

    def sendKeepAlive(self) :
        k = {
            "nickName" : self.getUserName()
            , "commandType" : "KeepAlive"
            , "keepAlive" : "Ping"
        }
        return k
        
    def handleKeepAlive(self, jsonRequest) :
        return None 

    def activePortfolioIntervalF(self):
        self.activePortfolioInterval = self.getCellContent(self.ACTIVE_PORTFOLIO_INTERVAL_CELL)
        return self.activePortfolioInterval
    def keepAliveInterval(self) :
        self.interval = self.getCellContent(self.KEEP_ALIVE_CELL)
        return self.interval

    def marketDataRefreshIntervalF(self):
        self.marketDataRefreshInterval = self.getCellContent(self.MARKET_DATA_REFRESH_INTERVAL_CELL)
        return self.marketDataRefreshInterval

    ## Send a keep alive request every n seconds. 
    ## This is not entirely accurate: the client needs to send 
    ## a message only after n seconds of idle period. TODO
    @asyncio.coroutine
    def send(self, aJsonMessage):
        try:
            yield from self.websocket.send(json.dumps(aJsonMessage))
        except:
            logger.error("Unable to send " + str(aJsonMessage))
            # yield from self.websocket.close()
            logger.error(traceback.format_exc())
    @asyncio.coroutine
    def updateActivePortfolios(self):
        while True:
            for portfolioSummary in self.portfolioGroup.portfolioSummaries:
                payload = {
                    "commandType" : "ActivePortfolio"
                    , "portfolio" : portfolioSummary["Right"]
                    , "nickName" : self.getUserName()
                }
                logger.debug("Update active portfolio " + str(payload))
                yield from self.send(payload);
                logger.debug("Sleeping " + self.activePortfolioIntervalF())
                yield from asyncio.sleep(int(self.activePortfolioIntervalF()), loop = self.loop)
            yield from asyncio.sleep(1, loop = self.loop) # When the dictionary is empty.

    @asyncio.coroutine
    def keepAlivePing(self):
        try:
            logger.debug("Starting the keep alive timer..")
            while True: 
                reply = self.sendKeepAlive();
                logger.debug("Reply " + str(reply))
                serverConnection = self.websocket                                
                logger.debug("Keep alive ping:" + str(reply) + " Sleeping " + self.keepAliveInterval())        
                self.sendAsTask(reply)
                yield from asyncio.sleep(int(self.keepAliveInterval()), loop = self.loop)
                
        except:
            logger.error(traceback.format_exc())
            return None

    def handleUserLoggedIn(self, response):
        return self.sendSelectAllCompaniesRequest(response);

    def handleLoginResponse(self, data) :
        loginStatus = data['loginStatus']
        if loginStatus != "UserExists":
            self.updateErrorWorksheet("User not found. Power users need to be registered");
            return;
        lPassword = self.getCellContent(self.PASSWORD_CELL);
        if lPassword != data['login']['password']:
            self.updateErrorWorksheet("Invalid user name password. Call support");
            return;
        (self.loop.create_task(self.keepAlivePing()))
        logger.debug("Handling login response: " + str(data))
        result = self.sendUserLoggedIn(data);
        return result


    def handleUserNotFound (self, incomingJson) :
        # If the user is not found, let the 
        # register on the website. This 
        # might be a useful feature, security wise
        # A sort of poor man's tfa. 
        # Issues to consider: handling multiple 
        # active connections. 
        # The server needs to count per client type.
        # Browser, Smartphone, desktop
        pass



    def getCommandType(self, incomingJson) :
        data = json.loads(incomingJson);
        if "commandType" in data: 
            return data["commandType"]
        elif "Right" in data:
            return (data["Right"])["commandType"]
        else:
            return "Undefined"

    def getCommandTypeValue(self, aCommandType) : 
        return self.commandDictionary()[aCommandType]



    def handleUndefinedCommandType(self, incomingMessage) :
        # Do something when command type is not defined.
        pass

    def sendManageCompany(self, aJsonMessage) :
        # Send a manage company json request
        pass
    def handleManageCompany(self, aJsonResponse): 
        #Handle manage company
        pass

    def handleSelectAllCompaniesResponse(self, response): 
        companiesList = response['company'];
        portfolioQueries = []
        count = 0
        for aCompany in companiesList:
            self.getCompanySelectListBox().addItem(aCompany["companyID"], count)
            count = count + 1
            portfolioQuery = {
                    'commandType' : "QueryPortfolios"
                    , 'nickName' : self.getUserName()
                    , 'companyId' : aCompany["companyID"]
                    , 'userId' : self.getUserName()
                    , 'resultSet' : []

            }
            self.loop.create_task(self.send(portfolioQuery))

        return None
    
    """ 
        Send a json request by wrapping it inside a task 
    """
    def sendAsTask(self, aJsonRequest):
        logger.debug(">>>" + str(aJsonRequest))
        self.loop.create_task(self.send(aJsonRequest));

    def sendQuerySupportedScripts(self, aJsonRequest) : 
        pass 
    def handleQuerySupportedScripts(self, aJsonResponse):
        pass 
    def sendQueryActiveWorkbenches(self, aJsonRequest) :
        pass 
    def handleQueryActiveWorkbenches(self, aJsonResponse):
        pass 

    def sendManageWorkbench(self, aJsonRequest):
        pass 
    def handleManageWorkbench(self, aJsonResponse):
        pass 
    def sendExecuteWorkbench(self, jsonReuest) : 
        pass
    def handleExecuteWorkbench(self, jsonRequest) :
        pass 
    def sendSelectActiveProjects (self, jsonReequest) :
        pass 
    def handleSelectActiveProjects(self, jsonRequest) :
        pass
    def sendManageProject (self, jsonRequest) :
        pass 
    def handleManageProject (self, jsonRequest) :
        pass 
    def sendParsedCCARText(self, jsonRequest) :
        pass 
    def handleParsedCCARText(self, jsonRequest) :
        pass 
    def sendManageUser (self, jsonRequest) :
        pass 
    def handleManageUser (self, jsonRequest) :
        pass 
    def sendCreateUserTerms(self, jsonRequest) :
        pass 
    def handleCreateUserTerms(self, jsonReques) :
        pass 
    def sendUpdateUserTerms(self, jsonRequest): 
        pass 
    def handleUpdateUserTerms (self, jsonRequest):
        pass
    def sendDeleteUserTerms(self, jsonRequest):
        pass 
    def handleDeleteUserTerms(self, jsonRequest) :
        pass 
    def sendQueryUserTerms(self, jsonRequest) : 
        pass 
    def handleQueryUserTerms(self, jsonRequest) :
        pass
    def sendCreateUserPreferences(self, jsonRequest) :
        pass 
    def handleCreateUserPreferences(self, jsonRequest) :
        pass
    def sendUpdateUserPreferences(self, jsonRequest) :
        pass 
    def handleUpdateUserPreferences(self, jsonRequest) :
        pass
    def sendQueryUserPreferences(self, jsonRequest):
        pass 
    def handleQueryUserPreferences(self, jsonRequest):
        pass
    def sendDeleteUserPreferences(self, jsonRequest):
        pass 
    def handleDeleteUserPreferences(self, jsonRequest) :
        pass 
    def sendMessage(self, jsonRequest): 
        pass

    def handleSendMessage(self, jsonResponse):
        try:    
            logger.debug("Not handling " + str(jsonResponse));
            return None
        except:
            self.updateErrorWorksheet(traceback.format_exc())
            return None
    def sendUserJoined(self, jsonRequest) :
        pass

    def handleUserJoined(self, jsonRequest) :
        pass
    def sendUserBanned(self, jsonRequest):
        pass 
    def handleUserBanned(self, jsonResponse): 
        pass 
    def sendUserLeft (self, jsonRequest) :
        pass 
    def handleUserLeft (self, jsonRequest) :
        pass 
    def sendAssignCompany(self, jsonRequest): 
        pass 
    ## This functionality should go as an desktop 
    ## may not arbitrarily assign a user to a company
    def handleAssignCompany(self, jsonResponse): 
        pass
    def sendPortfolioSymbolTypesQuery(self, jsonRequest) :
        pass 
    def handlePortfolioSymbolTypesQuery(self, jsonResponse):
        pass 
    def sendPortfolioSymbolSidesQuery(self, jsonRequest): 
        pass 
    def handlePortfolioSymbolSidesQuery(self, jsonResponse):
        pass 
    def sendQueryPortfolios(self, jsonRequest):
        pass

    def updatePortfolios(self, portfolioList):
        self.portfolioGroup = PortfolioGroup(self, portfolioList);
        self.portfolioGroup.updateAndSend();
        #(self.loop.create_task(self.updateActivePortfolios()))



    def handleQueryPortfolios(self, jsonResponse): 
        logger.debug("Handling query portfolios " + str(jsonResponse));
        resultSet = jsonResponse["resultSet"]
        self.updatePortfolios(resultSet)
        return None
    def sendManagePortfolio(self, jsonRequest): 
        pass 
    def handleManagePortfolio(self, jsonResponse):
        pass
    def sendManagePortfolioSymbol(self, jsonRequest) :
        pass
    @asyncio.coroutine 
    def handleManagePortfolioSymbol(self, jsonResponse):
        logger.debug("Process handle portfolio symbol " + str(jsonResponse))
        self.loop.create_task(self.portfolioGroup.updateUsingManagePortfolioSymbol(jsonResponse))
        

    def sendQueryPortfolioSymbol(self, jsonRequest): 
        pass 
    @asyncio.coroutine
    def handleQueryPortfolioSymbol(self, jsonRequest) :
        logger.debug("Handle query portfolio symbol " + str(jsonRequest))
        yield from self.portfolioGroup.handleQueryPortfolioSymbolResponse(jsonRequest);

        
    def sendManageEntitlements(self, jsonRequest):
        pass 
    def handleManageEntitlements(self, jsonResponse): 
        pass 
    def sendQueryEntitlements(self, jsonRequest): 
        pass 
    def handleQueryEntitlements(self, jsonRequest):
        pass 
    def sendQueryCompanyUsers(self, jsonRequest): 
        pass 
    def handleQueryCompanyUsers(self, jsonRequest): 
        pass 
    def sendMarketDataUpdate(self, jsonRequest):
        pass 
    def handleMarketDataUpdate(self, jsonResponse):
        pass 
    def sendOptionAnalytics(self, jsonRequest) :
        pass 
    def handleQptionAnalytics(self, jsonResponse): 
        pass 
    def sendQueryMarketData(self, jsonRequest):
        logger.debug("Send query market data for each symbol across all the portfolios")
        logger.debug("Will never come here.");


    @asyncio.coroutine
    def handleQueryOptionChain(self, jsonRequest):
        try :
            chain = jsonRequest["optionChain"]
            logger.debug("Handle Query option chain " + str(chain))
            for r in chain:
                logger.debug("Option " + str(r))
                try: 
                    optionInstance = OptionChain(r);
                    self.optionTable.add(optionInstance)
                    logger.debug("Processing option chain " + str(optionInstance))
                    computedRow = self.optionTable.getComputedRow(optionInstance)

                    self.loop.create_task(Util.updateCellContentT(self.optionDataSheet, "A" + str(computedRow), optionInstance.symbol))
                    self.loop.create_task(Util.updateCellContentT(self.optionDataSheet, "B" + str(computedRow), optionInstance.underlying))
                    self.loop.create_task(Util.updateCellContentT(self.optionDataSheet, "C" + str(computedRow), optionInstance.strike))
                    self.loop.create_task(Util.updateCellContentT(self.optionDataSheet, "D" + str(computedRow), optionInstance.expiration))
                    self.loop.create_task(Util.updateCellContentT(self.optionDataSheet, "E" + str(computedRow), optionInstance.lastBid))
                    self.loop.create_task(Util.updateCellContentT(self.optionDataSheet, "F" + str(computedRow), optionInstance.lastAsk))
                    self.loop.create_task(Util.updateCellContentT(self.optionDataSheet, "G" + str(computedRow), optionInstance.change))
                    self.loop.create_task(Util.updateCellContentT(self.optionDataSheet, "H" + str(computedRow), optionInstance.openInterest))

                    yield from asyncio.sleep(0.01, loop = self.loop)         
                except:
                    logger.error(traceback.format_exc())
                    logger.error(chain)

        except:
            logger.error(traceback.format_exc())
            logger.error(jsonRequest)
    @asyncio.coroutine
    def handleQueryMarketData(self, jsonRequest) :
        try:
            r = jsonRequest
            q = r["query"]
            for result in q:
                logger.debug("Processing result" + str(result));
                symbol = result["symbol"]
                portfolioId = result["portfolioId"]
                resultSet = result["resultSet"]
                self.marketDataBak[symbol] = MarketData(symbol)
                for timeSeries in resultSet:
                    if portfolioId == symbol:
                        continue;
                    row = self.marketDataRow
                    high = timeSeries["high"]   
                    low  = timeSeries["low"]
                    openL = timeSeries["open"]
                    close = timeSeries["close"]
                    volume = timeSeries["volume"]
                    date = timeSeries["date"]
                    event = MarketDataTimeSeries(symbol, high, low, openL, close, volume, date)
                    if row in self.marketDataRowMap:
                        self.marketDataRow = self.marketDataRow + 1
                        self.marketDataRowMap[event.key()] = self.marketDataRow
                    else:
                        self.marketDataRowMap[event.key()] = self.marketDataRow 
                        self.marketDataRow = self.marketDataRow + 1

                    logger.debug("Processing time series " + str(timeSeries))
                    (self.marketDataBak[symbol]).add(event)       
                    computedRow = self.marketDataRowMap[event.key()]
                    self.loop.create_task(Util.updateCellContentT(self.marketDataSheet, "A" + str(computedRow), symbol))
                    self.loop.create_task(Util.updateCellContentT(self.marketDataSheet, "B" + str(computedRow), event.high))
                    self.loop.create_task(Util.updateCellContentT(self.marketDataSheet, "C" + str(computedRow), event.low))
                    self.loop.create_task(Util.updateCellContentT(self.marketDataSheet, "D" + str(computedRow), event.open))
                    self.loop.create_task(Util.updateCellContentT(self.marketDataSheet, "E" + str(computedRow), event.close))
                    self.loop.create_task(Util.updateCellContentT(self.marketDataSheet, "F" + str(computedRow), event.volume))
                    self.loop.create_task(Util.updateCellContentT(self.marketDataSheet, "G" + str(computedRow), event.date))
                    yield from asyncio.sleep(0.01, loop = self.loop)         
        except:
            error = traceback.format_exc()
            logger.error(error)
    def sendHistoricalStressValue(self, jsonRequest):
        pass
    def handleHistoricalStressValue(self, jsonResponse): 
        pass



    ## https returns and invalid url. 
    def clientConnection (self) : 
        CONNECTION_CELL = "C3";
        return self.getCellContent(CONNECTION_CELL);


    ### Right in the json response implies no errors.
    def processIncomingCommand(self, payloadI) :
        cType = self.getCommandType(payloadI);
        payloadJ = json.loads(payloadI)
        if "Right" in  payloadJ:
            payload = payloadJ["Right"]; 
        elif "Left" in payloadJ:
            self.updateErrorWorksheet(payloadJ);
            return;
        else:
            payload = payloadJ

        commandType = self.getCommandTypeValue(cType)
        if commandType == LOGIN_COMMAND: 
            reply = self.handleLoginResponse(payload);
        elif commandType == CCAR_UPLOAD_COMMAND:
            reply = self.handleCCARUpload(paylad)
        elif commandType == MANAGE_COMPANY:
            reply = self.handleManageCompany(payload);
        elif commandType == SELECT_ALL_COMPANIES: 
            reply = self.handleSelectAllCompaniesResponse(payload);
        elif commandType == QUERY_SUPPORTED_SCRIPTS:
            reply = self.handleQuerySupportedScripts(payload);
        elif commandType == QUERY_ACTIVE_WORKBENCHES:  
            reply = self.handleQueryActiveWorkbenches(payload);
        elif commandType == MANAGE_WORKBENCH:
            reply = self.handleManageWorkbench(payload);
        elif commandType == EXECUTE_WORKBENCH:
            reply = self.handleExecuteWorkbench(payload);
        elif commandType == SELECT_ACTIVE_PROJECTS:
            reply = self.handleSelectActiveProjects(payload);
        elif commandType == MANAGE_PROJECT: 
            reply = self.handleManageProject(payload);
        elif commandType == PARSED_CCAR_TEXT:
            reply = self.handleParsedCCARText(payload);
        elif commandType == MANAGE_USER:
            reply = self.handleManageUser(payload);
        elif commandType == CREATE_USER_TERMS:
            reply = self.handleCreateUserTerms(payload);
        elif commandType == UPDATE_USER_TERMS:
            reply = self.handleUpdateUserTerms(payload);
        elif commandType == DELETE_USER_TERMS:
            reply = self.handleDeleteUserTerms(payload);
        elif commandType == QUERY_USER_TERMS:
            reply = self.handleQueryUserTerms(payload);
        elif commandType == CREATE_USER_PREFERENCES:
            reply = self.handleCreateUserPreferences(payload);
        elif commandType == UPDATE_USER_PREFERENCES:
            reply = self.handleUpdateUserPreferences(payload);
        elif commandType == QUERY_USER_PREFERENCES:
            reply = self.handleQueryUserPreferences(payload);
        elif commandType == DELETE_USER_PREFERENCES:
            reply = self.handleDeleteUserPreferences(payload);
        elif commandType == SEND_MESSAGE:
            reply = self.handleSendMessage(payload);
        elif commandType == USER_BANNED:
            reply = self.handleUserBanned(payload);
        elif commandType == USER_JOINED:
            reply = self.handleUserJoined(payload);
        elif commandType == USER_LOGGED_IN:
            reply = self.handleUserLoggedIn(payload);
        elif commandType == USER_LEFT:
            reply = self.handleUserLeft(payload);
        elif commandType == ASSIGN_COMPANY:
            reply = self.handleAssignCompany(payload);
        elif commandType ==  KEEP_ALIVE:
            reply = self.handleKeepAlive(payload);
        elif commandType == PORTFOLIO_SYMBOL_TYPES_QUERY:
            reply = self.handlePortfolioSymbolTypesQuery(payload);
        elif commandType == PORTFOLIO_SYMBOL_SIDES_QUERY:
            reply = self.handlePortfolioSymbolSidesQuery(payload);
        elif commandType == QUERY_PORTFOLIOS:
            reply = self.handleQueryPortfolios(payload);
        elif commandType == MANAGE_PORTFOLIO:
            reply = self.handleManagePortfolio(payload);
        elif commandType == MANAGE_PORTFOLIO_SYMBOL:
            t = self.loop.create_task(self.handleManagePortfolioSymbol(payload))
            reply = None
        elif commandType == QUERY_PORTFOLIO_SYMBOL:
            t = self.loop.create_task(self.handleQueryPortfolioSymbol(payload));
            reply = None
        elif commandType == MANAGE_ENTITLEMENTS:
            reply = self.handleManageEntitlements(payload);
        elif commandType == QUERY_ENTITLEMENTS:
            reply = self.handleQueryEntitlements(payload);
        elif commandType == QUERY_COMPANY_USERS:
            reply = self.handleQueryCompanyUsers(payload);
        elif commandType == MARKET_DATA_UPDATE:
            reply = self.handleMarketDataUpdate(payload);
        elif commandType == OPTION_ANALYTICS:
            reply = self.handleQptionAnalytics(payload);
        elif commandType == QUERY_MARKET_DATA:
            t = self.loop.create_task(self.handleQueryMarketData(payload))
            reply = None
        elif commandType == HISTORICAL_STRESS_VALUE_COMMAND:
            reply = self.handleHistoricalStressValue(payload);
        elif commandType == QUERY_OPTION_CHAIN:
            t = self.loop.create_task(self.handleQueryOptionChain(payload))
            reply = None
        else:
            reply = None
        return reply


    
    @asyncio.coroutine
    def ccarLoop(self, userName, password):
        self.websocket = yield from websockets.connect(self.clientConnection(), ssl = True, loop = self.loop)
        logger.debug("CCAR loop %s, ***************", userName)
        try:
            payload = self.sendLoginRequest(userName, password);
            yield from self.websocket.send(payload)
            while True:
                try: 
                    response = yield from  self.websocket.recv()
                    commandType = self.getCommandType(response);                
                    reply = self.processIncomingCommand(response)
                    logger.debug("Reply --> " + str(reply));
                    if reply == None:
                        #logger.debug(" Not sending a response " + response);
                        pass
                    else:
                        yield from self.websocket.send(json.dumps(reply))
                except:
                    error = traceback.format_exc()
                    logger.error(error)
                    return "Loop exiting"
        except:
            logger.error(traceback.format_exc())
            logger.error("Closing connection. See exception above")
            yield from self.websocket.close()
        

    def LOGGER_CELL():
        return "A23"
    def login (self, loop, userName, password, ssl):
        try:
            try:
                logger.debug("Try to disable certificate validation...")
                _create_unverified_https_context = ssl._create_unverified_context
            except AttributeError:
                # Legacy Python that doesn't verify HTTPS certificates by default
                pass
            else:
                # Handle target environment that doesn't support HTTPS verification
                logger.debug("Handling the else");
                ssl._create_default_https_context = _create_unverified_https_context
            self.loop = loop
            logger.debug("Connecting using %s -> %s", userName, password)
            if userName == None or userName == "" or password == None or password == "":
                updateCellContent(LOGGER_CELL(), "User name and or password not found")
                return;
            loop.run_until_complete(self.ccarLoop(userName, password))
        except:
            error = traceback.format_exc() 
            logger.error(error);
            return "Error while logging in" 
        finally:
            logger.debug("Exiting main loop")
            return "Finished processing login"
### End class

def StartClient(*args):
    try:

        """Starts the CCAR client."""
        asyncio.get_event_loop().set_debug(enabled=True);
        logger.debug("Starting the client..%s", str(args))
        client = CCARClient()
        client.clearCells()
        s = client.getSecuritySettings()
        l = client.getCellContent(client.LOGIN_CELL)
        p = client.getCellContent(client.PASSWORD_CELL)
        loop = asyncio.get_event_loop()
        import threading
        t = threading.Thread(target = client.login, args=(loop, l, p, Util.convertToBool(s)))
        t.start()
    except:
        logger.errors(traceback.format_exc())

g_ExportedScripts = StartClient

    