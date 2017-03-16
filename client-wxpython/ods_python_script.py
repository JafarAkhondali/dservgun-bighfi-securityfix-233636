import sys
import urllib
import os
import asyncio
import websockets
from websockets.client import WebSocketClientProtocol
from websockets.protocol import WebSocketCommonProtocol
import traceback
import json
import ssl
import threading
import logging
import datetime
import copy
import webbrowser 
import requests
import urllib 
import tempfile

from urllib.parse import urlencode

logging.basicConfig(filename="./odspythonscript.log", level = 
        logging.DEBUG, filemode = "w", format="format=%(asctime)s %(name)-12s %(levelname)-8s %(threadName)s %(message)s")

logger = logging.getLogger(__name__)    
logger.debug("Loaded script file "  + os.getcwd())


##### Note: Requires python 3.4 or above
##### It seems to be that all functions in a macro need to reside in a single file.
##### We will break them down into modules as the size of the macros grow.
##### 

#### 
# oXChartType = oCharts.getByIndex(0).getEmbeddedObject().getFirstDiagram().getCoordinateSystems()[0].getChartTypes()[0]
# oSeries = oXChartType.getDataSeries()
# oNewSeries = ()
# oNewSeries = (oSeries[4], oSeries[3], oSeries[2], oSeries[1], oSeries[0] )
# oXChartType.setDataSeries(oNewSeries)


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


# class QuantityChanged(XModifyListener, unohelper.Base): 
#     def __init__(self):
#         self.doc = None 
#     def setDocument(self, doc):
#         self.doc = doc
#     def modified(self, oevent):
#         logger.debug("Cell modified");
#     def disposing(self, oevent):
#         pass;    

def loadCABundleOffline(certFile, filename):
    try:
        logger.debug("Loading from " + certFile);
        f = open(certFile, "r")
        fw = open(filename, "w")
        fw.write(f.read())
        fw.close()
    except:
        error = traceback.format_exc() 
        logger.error(error);
        return "Could not load bundle" 
    finally:
        logger.debug("Load ca bundle")
        return "finished loading ca bundle"


def loadCABundle(siteca, filename):
    try:
        logger.debug("Loading from " + siteca);
        f = requests.get(siteca);
        fw = open(filename, "w")
        fw.write(f.text)
        fw.close()
    except:
        error = traceback.format_exc() 
        logger.error(error);
        return "Could not load bundle" 
    finally:
        logger.debug("Load ca bundle")
        return "finished loading ca bundle"

tempFile = tempfile.NamedTemporaryFile(delete=False)
## https://www.labnol.org/internet/direct-links-for-google-drive/28356/
### When connected


#bundleConvenienceLink = "https://drive.google.com/uc?id=0B6WIubsk0HIGN2RPVloxZ2o1STQ&export=download"
#loadCABundle(bundleConvenienceLink, tempFile.name)

### when offline
bundleConvenienceFile = "/home/stack/asm-ccar/bighfi/client-hx/pyclient.ca-bundle"
loadCABundleOffline(bundleConvenienceFile, tempFile.name)

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




class ClientOAuth:
    def __init__(self, loginHint):
        logger.debug("Creating an oauth client")
        self.loginHint = loginHint
        # This url needs to change to the actual site.
        self.url = "https://beta.ccardemo.tech/gmailOauthRequest"
    def getRequest(self):
        logger.debug("Creating a auth request")
        scope = "openid email"
        r = requests.get(self.url + "/" + self.loginHint + "/" + scope)
        oauthJson = json.loads(r.text)
        authUri = oauthJson["authDetails"]["authorizationURI"]
        clientId = oauthJson["clientId"]["unCI"]
        responseType = "code"
        scope = "openid email"
        redirect_uri = oauthJson["redirectURLs"][0]
        login_hint = self.loginHint
        payload = {
                "client_id" : clientId, 
                "response_type" : responseType,
                "scope" : scope,
                "redirect_uri" : redirect_uri,  
                "login_hint" : login_hint}
        logger.debug("Auth uri " + authUri)
        logger.debug("payload " + urlencode(payload))
        authRequest = authUri + "?" + urlencode(payload)
        logger.debug ("Auth url " + authRequest)
        return authRequest

    def showBrowser(self):
        logger.debug ("Display web browser with the server params");
        webbrowser.open(self.getRequest())

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
        key = anEntry.key();
        if key in self.indexMap:
            return self.indexMap[key]
        else:
            return self.availableRowIndex
    def values(self):
        return self.dataMap.values();
# Design notes: 
# Use composition over inheritance.
class Util:
    # Indexes are zero based.
    @staticmethod
    def convertToBool(aString):    
        bool(aString)




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
    def __hash__(self) :
            return (hash(self.key()))
    def __eq__(self, other):
        if type(self) is type(other):
            result = self.symbol == other.symbol 
            result = result and (self.underlying == other.underlying)
            result = result and (self.strike == other.strike) 
            result = result and (self.expiration == other.expiration);
            return result;
        else:
            return False;

class PortfolioSymbolParseError(Exception) : 
        def __init__(self, value):
            self.value = value
        def __str__(self): 
            return repr(self.value);

class PortfolioSymbol:
    # Deal with Right/Errors inside the constructor
    def __init__(self, ccarClient, jsonRecord) :
        self.ccarClient = ccarClient;
        self.commandType = jsonRecord["commandType"]
        self.crudType = jsonRecord["crudType"]
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
        self.dateTime = str(datetime.datetime.now())
        # self.dateTime = jsonRecord["dateTime"]

    def __eq__(self, other) :
        if type(self) is type(other):
            result = self.portfolioId == other.portfolioId 
            result = result and  (self.symbol == other.symbol)
            result = result and  (self.side == other.side) 
            result = result and  (self.symbolType == other.symbolType)
            return result 
        else:
            return False;
    def __hash__(self): 
        strCat = self.portfolioId + self.symbol + self.side + self.symbolType;
        return (hash(strCat))
    def __str__(self): 
        return repr(self.portfolioId + " " + self.symbol + " " + self.side + " " + 
                                self.quantity + " " + self.value + " " + self.stressValue);


    def key(self): 
        key = self.symbol + self.side + self.symbolType + self.portfolioId;
        logger.debug("Symbol key " + key);
        return key;

    def updateCrudType(self, aCrudType):
        self.crudType = aCrudType;
    
    def asJson(self): 
        jsonRecord = {
                u"commandType"   :       self.commandType 
            ,   u"crudType"      :       self.crudType 
            ,   u"portfolioId"   :       self.portfolioId 
            ,   u"symbol"        :       self.symbol
            ,   u"quantity"      :       self.quantity 
            ,   u"side"          :       self.side 
            ,   u"symbolType"    :       self.symbolType 
            ,   u"value"         :       self.value
            ,   u"stressValue"   :       self.stressValue 
            ,   u"dateTime"      :       self.dateTime
            ,   u"creator"       :       self.creator
            ,   u"updator"       :       self.updator
            ,   u"nickName"      :       self.nickName
        }
        return jsonRecord


    # private function insertPortfolioSymbolI(aSymbol : String, aSymbolType : String, aSide: String, quantity : String){
    #     trace("Inserting portfolio symbol through upload ");
    #     var portfolioSymbolT : PortfolioSymbolT = {
    #         crudType : "Create"
    #         , commandType : "ManagePortfolioSymbol"
    #         , portfolioId : getPortfolioId()
    #         , symbol : aSymbol
    #         , quantity : quantity
    #         , side : aSide
    #         , symbolType : aSymbolType
    #         , value : "0.0"
    #         , stressValue : "0.0"
    #         , creator : MBooks_im.getSingleton().getNickName()
    #         , updator : MBooks_im.getSingleton().getNickName()
    #         , nickName : MBooks_im.getSingleton().getNickName()
    #     }
    #     model.insertStream.resolve(portfolioSymbolT);
    # }
    ## Create a manage portfolio json request
    def createManagePortfolioSymbol(self, crudType): 
        result = {
            crudType : crudType
            , commandType : "ManagePortfolioSymbol"
            , portfolioId : self.portfolioId
            , symbol : self.symbol 
            , quantity : self.quantity 
            , side : self.side 
            , symbolType: self.symbolType
            , value : self.value
            , stressValue : self.stressValue 
            , creator : self.creator 
            , updator : self.updator 
            , nickName : self.nickName            
        }
        return result;


class PortfolioSymbolTable :
    def __init__(self, ccarClient):
        self.ccarClient = ccarClient
        self.table = TableDisplay()
        self.rowMap = {}
    @asyncio.coroutine
    def add(self, portfolioSymbol):
        self.table.add(portfolioSymbol)
    def getPortfolioSymbols(self):
        return self.table.values()

    def getComputedRow(self, portfolioSymbol):
        return self.table.getComputedRow(portfolioSymbol)

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

    def str(self):
        return str(portfolioSummaries);
    def updateContents(self):
        logger.debug("Updating contents for portfolio group " + str(self))
        for summaryDictionary in self.portfolioSummaries:
            summary = summaryDictionary["Right"]

            cellPosition = str(self.portfolioDetailCount + self.portfolioDetailStartRow)
            companyCol = self.portfolioDetailColumns["companyId"]
            portfolioCol = self.portfolioDetailColumns["portfolioId"]
            summaryCol = self.portfolioDetailColumns["summary"]
            self.brokerDictionary[portfolioCol] = companyCol
            logger.debug("Updating cell contents");
            self.ccarClient.updateCellContent(self.portfolioWorksheet, 
                                summaryCol + cellPosition, summary["summary"])
            self.ccarClient.updateCellContent(self.portfolioWorksheet, 
                                portfolioCol + cellPosition, summary["portfolioId"])
            self.ccarClient.updateCellContent(self.portfolioWorksheet, 
                                companyCol + cellPosition, summary["companyId"])
            self.portfolioDetailCount  = self.portfolioDetailCount + 1                            
            newSheet = self.ccarClient.upsertNewWorksheet(summary["portfolioId"])
            self.createRows(summary["portfolioId"])
            self.portfolioGroupWorksheets[summary["portfolioId"]] = newSheet
            


    def createRows(self, aWorksheetName):
        self.ccarClient.updateCellContent(aWorksheetName, "A1", "Symbol")
        self.ccarClient.updateCellContent(aWorksheetName, "B1", "Quantity")
        self.ccarClient.updateCellContent(aWorksheetName, "C1", "Side")
        self.ccarClient.updateCellContent(aWorksheetName, "D1" ,  "SymbolType")
        self.ccarClient.updateCellContent(aWorksheetName, "E1", "Value")
        self.ccarClient.updateCellContent(aWorksheetName, "F1", "Stress value")
        self.ccarClient.updateCellContent(aWorksheetName, "G1", "Last update time")


    def getPortfolioIds(self):
        result = [] 
        for portfolio in self.portfolioSummaries: 
            summary = portfolio["Right"]
            result.append(summary["portfolioId"])
        return result

    def sendPortfolioRequests(self):
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
        if portfolioSymbol == None:
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
            portfolioSymbol = PortfolioSymbol(self.ccarClient, jsonResponse);
            if portfolioSymbol.crudType == "Delete":
                logger.debug("Portfolio symbol deleted. Updating client " + str(jsonResponse));
                return;
            portfolioId = portfolioSymbol.portfolioId
            self. portfolioSymbolTable = self.getPortfolioSymbolTable(portfolioSymbol.portfolioId)
            self.portfolioSymbolTable.add(portfolioSymbol)
            row = self.portfolioSymbolTable.getComputedRow(portfolioSymbol)
            logger.debug ("Computed row for portfolio symbol " + str(row))
            if row == None:
                pass
            else:
                changes = PortfolioChanges(self.ccarClient, portfolioId);
                crudType = ""; 
                nickName = self.ccarClient.getNickName();
                p = changes.createLocalvalue(portfolioSymbol, nickName, nickName, nickName, crudType, row);
                changes.register(p, portfolioSymbol);
                q = portfolioSymbol.quantity
                if p != None:
                    q = p.quantity
                else:
                    pass;
                # Need to create an event model to handle updates correctly.
                self.ccarClient.loop.create_task(self.ccarClient.updateCellContentT(portfolioId, "A" + str(row), portfolioSymbol.symbol))
                self.ccarClient.loop.create_task(self.ccarClient.updateCellContentT(portfolioId, "B" + str(row), q))
                self.ccarClient.loop.create_task(self.ccarClient.updateCellContentT(portfolioId, "C" + str(row), portfolioSymbol.side))
                self.ccarClient.loop.create_task(self.ccarClient.updateCellContentT(portfolioId, "D" + str(row), portfolioSymbol.symbolType))
                self.ccarClient.loop.create_task(self.ccarClient.updateCellContentT(portfolioId, "E" + str(row), portfolioSymbol.value))
                self.ccarClient.loop.create_task(self.ccarClient.updateCellContentT(portfolioId, "F" + str(row), portfolioSymbol.stressValue))
                self.ccarClient.loop.create_task(self.ccarClient.updateCellContentT(portfolioId, "G" + str(row), str(datetime.datetime.now())))
                yield from asyncio.sleep(0.1, loop = self.ccarClient.loop) # Need to get the waits right.

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
                portfolioSymbol = PortfolioSymbol(self.ccarClient, x);
                logger.debug("Adding portfolio symbol " + str(portfolioSymbol))
                portfolioId = portfolioSymbol.portfolioId
                self. portfolioSymbolTable = self.getPortfolioSymbolTable(portfolioId)
                self.ccarClient.loop.create_task(self.portfolioSymbolTable.add(portfolioSymbol))
                self.ccarClient.loop.create_task(self.sendMarketDataQueryRequest(portfolioSymbol))
                self.ccarClient.loop.create_task(self.sendQueryOptionChain(portfolioSymbol))
                # Find the current row for the portfolio symbol.
                row = self.portfolioSymbolTable.getComputedRow(portfolioSymbol)
                logger.debug ("Computed row for portfolio symbol " + str(row))
                if row == None:
                    pass
                else:
                    changes = PortfolioChanges(self.ccarClient, portfolioId);
                    crudType = "";
                    nickName = self.ccarClient.getNickName();
                    #p = changes.createLocalvalue(portfolioSymbol, nickName, nickName, nickName, crudType, row);
                    q = portfolioSymbol.quantity
                    # if p != None:
                    #     q = p.quantity

                    yield from self.ccarClient.loop.create_task(self.ccarClient.updateCellContentT(portfolioId, "A" + str(row), portfolioSymbol.symbol))
                    yield from self.ccarClient.loop.create_task(self.ccarClient.updateCellContentT(portfolioId, "B" + str(row), q))
                    yield from self.ccarClient.loop.create_task(self.ccarClient.updateCellContentT(portfolioId, "C" + str(row), portfolioSymbol.side))
                    yield from self.ccarClient.loop.create_task(self.ccarClient.updateCellContentT(portfolioId, "D" + str(row), portfolioSymbol.symbolType))                    
                    yield from self.ccarClient.loop.create_task(self.ccarClient.updateCellContentT(portfolioId, "E" + str(row), portfolioSymbol.value))
                    yield from self.ccarClient.loop.create_task(self.ccarClient.updateCellContentT(portfolioId, "F" + str(row), portfolioSymbol.stressValue))
                    yield from self.ccarClient.loop.create_task(self.ccarClient.updateCellContentT(portfolioId, "G" + str(row), str(datetime.datetime.now())))
                    yield from asyncio.sleep(0.1, loop = self.ccarClient.loop) # Need to get the waits right.
        except:
            logger.error("Message " + str(result))
            logger.error(traceback.format_exc())

    
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
        self.high = '%.2f' % float(high)
        self.low = '%.2f' % float(low)
        self.open = '%.2f' % float(openL)
        self.close = '%.2f' % float(close)
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

    ## Return a list of all highs sorted by date.
    def sortedByDate(self):
        pass
        #return self.timeSeries.sort(key=(MarketDataTimeSeries().key()), self.timeSeries)

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
        self.localDict = {} # Maintains local changes to the dictionary
        self.INFO_WORK_SHEET = 0
        self.marketDataRefreshInterval = 1
        self.activePortfolioInterval = 1 # An active portfolio ping request to update any stress data.
        self.marketDataSheet = "MarketDataSheet"
        self.optionDataSheet = "OptionMarketData"
        self.userLoginSheet = "user_info_login"
    #get the doc from the scripting context which is made available to all scripts
        desktop = XSCRIPTCONTEXT.getDesktop()
        model = desktop.getCurrentComponent()
    #check whether there's already an opened document. Otherwise, create a new one
        if not hasattr(model, "Sheets"):
            model = desktop.loadComponentFromURL(
                "private:factory/scalc","_blank", 0, () )
    #get the XText interface
        sheet = model.Sheets.getByIndex(0)

    def updateCellContent(self, worksheet, cell, value):
        try:
            if cell == None:
                logger.debug("No cell found for " + str(value))
            else:                
                logger.debug("Updating worksheet by name " + worksheet + " CELL " + str(cell) + ": Value " + str(value))
                sheet = self.getWorksheetByName(worksheet)
                if sheet == None:
                    logger.debug("No sheet found for " + worksheet);
                    return
                tRange = sheet.getCellRangeByName(cell)
                tRange.String = value
        except:
            logger.error(traceback.format_exc())

    @asyncio.coroutine
    def updateCellContentT(self, worksheet, cell,value):
        self.updateCellContent(worksheet, cell, value)

    def workSheetExists(self, aName):
        sheet = self.getWorksheetByName(aName);
        return (sheet != None)
    
    #Either create a new sheet or return an existing one.
    def upsertNewWorksheet(self, aName): 
        if aName == None:
            return None
        desktop = XSCRIPTCONTEXT.getDesktop()
        model = desktop.getCurrentComponent()
        logger.debug("Model " + str(model.Sheets))
        logger.debug("Creating new sheet " + aName)
        if self.workSheetExists(aName):
            return self.getWorksheetByName(aName)
        else:
            newSheet = model.Sheets.insertNewByName(aName, 1)
            return newSheet

    def getCellContentForSheet(self, sheetName, aCell):
        sheet = self.getWorksheetByName(sheetName);
        tRange = sheet.getCellRangeByName(aCell);
        return tRange.String
    
    def getCellContent(self, aCell): 
        return self.getCellContentForSheet("user_login_sheet", aCell);

    def getWorksheetByIndex(self, worksheetIndex): 
        desktop = XSCRIPTCONTEXT.getDesktop()
        model = desktop.getCurrentComponent()
        sheet = model.Sheets.getByIndex(worksheetIndex)    
    def getWorksheetByName(self, worksheetName): 
        try:
            logger.info("Worksheet name " + worksheetName);
            desktop = XSCRIPTCONTEXT.getDesktop()
            if desktop == None:
                return None;
            model = desktop.getCurrentComponent()
            if model == None: 
                logger.fatal("This can never happen " + worksheetName)
            if model.Sheets != None:
                try:                
                    sheet = model.Sheets.getByName(worksheetName) 
                    return sheet   
                except:
                    logger.error("Couldnt find worksheet " + worksheetName);
                    return None;
            else:
                return None;
        except:
            logger.error(traceback.format_exc())

    def getMarketDataWorksheet(self):
        return self.getWorksheetByName(self.markeDataSheet);

    def getCellContent(self, aCell): 
        sheet = self.getWorksheet(0);
        tRange = sheet.getCellRangeByName(aCell)
        return tRange.String



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


    def getNickName(self): 
        return self.getUserName();        
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
    def checkForChanges(self):
        try:
            keepChecking = True 
            autoSaveInterval = 1.0
            while keepChecking: 
                logger.debug("Checking for changes " + str(self.portfolioGroup))

                if self.portfolioGroup != None: 
                    logger.debug("Iterating through portfolios");              
                    portfolioIds = self.portfolioGroup.getPortfolioIds()
                    for p in portfolioIds :
                        logger.debug("Updating " + str(p))
                        x = PortfolioChanges(self, p);
                        x.collectNewrowsForPortfolio(p);
                    assert self.portfolioGroup != None;
                    self.portfolioGroup.sendPortfolioRequests();
                    yield from asyncio.sleep(autoSaveInterval, loop = self.loop)
                else:
                    logger.debug("Waiting for changes...");
                    yield from asyncio.sleep(autoSaveInterval, loop = self.loop)
                #yield from asyncio.sleep(autoSaveInterval, loop = self.loop)

        except:
            logger.error(traceback.format_exc())
            return None
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
        (self.loop.create_task(self.checkForChanges()))
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
        logger.debug("Updating portfolios");
        self.portfolioGroup = PortfolioGroup(self, portfolioList);
        logger.debug("Portfolio group " + str(self.portfolioGroup));
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
    def sendManagePortfolioSymbol(self, jsonRequest):
        self.sendAsTask(jsonRequest);
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

                    self.loop.create_task(self.updateCellContentT(self.optionDataSheet, "A" + str(computedRow), optionInstance.symbol))
                    self.loop.create_task(self.updateCellContentT(self.optionDataSheet, "B" + str(computedRow), optionInstance.underlying))
                    self.loop.create_task(self.updateCellContentT(self.optionDataSheet, "C" + str(computedRow), optionInstance.strike))
                    self.loop.create_task(self.updateCellContentT(self.optionDataSheet, "D" + str(computedRow), optionInstance.expiration))
                    self.loop.create_task(self.updateCellContentT(self.optionDataSheet, "E" + str(computedRow), optionInstance.lastBid))
                    self.loop.create_task(self.updateCellContentT(self.optionDataSheet, "F" + str(computedRow), optionInstance.lastAsk))
                    self.loop.create_task(self.updateCellContentT(self.optionDataSheet, "G" + str(computedRow), optionInstance.change))
                    self.loop.create_task(self.updateCellContentT(self.optionDataSheet, "H" + str(computedRow), optionInstance.openInterest))
                    yield from asyncio.sleep(0.1, loop = self.loop)         
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
                    self.loop.create_task(self.updateCellContentT(self.marketDataSheet, "A" + str(computedRow), symbol))
                    self.loop.create_task(self.updateCellContentT(self.marketDataSheet, "B" + str(computedRow), event.high))
                    self.loop.create_task(self.updateCellContentT(self.marketDataSheet, "C" + str(computedRow), event.low))
                    self.loop.create_task(self.updateCellContentT(self.marketDataSheet, "D" + str(computedRow), event.open))
                    self.loop.create_task(self.updateCellContentT(self.marketDataSheet, "E" + str(computedRow), event.close))
                    self.loop.create_task(self.updateCellContentT(self.marketDataSheet, "F" + str(computedRow), event.volume))
                    self.loop.create_task(self.updateCellContentT(self.marketDataSheet, "G" + str(computedRow), event.date))
                    yield from asyncio.sleep(0.1, loop = self.loop)         
        except:
            error = traceback.format_exc()
            logger.error(error)
    def sendHistoricalStressValue(self, jsonRequest):
        pass
    def handleHistoricalStressValue(self, jsonResponse): 
        pass



    def clientConnection (self) : 
        CONNECTION_CELL = "B1";
        return self.getCellContentForSheet("settings", CONNECTION_CELL);


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


    #klass=WebSocketClientProtocol, timeout=10, max_size=2 ** 20, 
    #max_queue=2 ** 5, loop=None, origin=None, subprotocols=None, extra_headers=None, **kwds
    @asyncio.coroutine
    def ccarLoop(self, userName, password):
        l = self.loop
        context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
        context.verify_mode = ssl.CERT_REQUIRED
        context.check_hostname = False
        bundle = open(tempFile.name)
        logger.debug(bundle.read())
        context.load_verify_locations(tempFile.name)
        
        logger.debug("Before making connection")
        self.websocket = yield from websockets.client.connect(self.clientConnection()
                , ssl = context # XXX: Remember to using localhost. Write a function for this.
                , loop = self.loop)
        logger.debug("CCAR loop %s, ***************", userName)
        try:
            payload = self.sendLoginRequest(userName, password);
            yield from self.websocket.send(payload)
            while True:
                try: 
                    response = yield from  self.websocket.recv()
                    commandType = self.getCommandType(response);                
                    reply = self.processIncomingCommand(response)
                    #logger.debug("Reply --> " + str(reply));
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
            self.loop = loop
            logger.debug("Connecting using %s -> %s", userName, password)
            if userName == None or userName == "" or password == None or password == "":
                updateCellContent(self.userLoginSheet, LOGGER_CELL(), "User name and or password not found")
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



# We find out all the portfolio changes
class PortfolioChanges:
    def __init__(self, ccarClient, portfolioId):
        logger.debug("Collect a list of all changes for this portfolio")
        self.updates = {} 
        self.adds = {} 
        self.deletes = {}
        self.portfolioId = portfolioId
        self.ccarClient = ccarClient


    def getPortfolioSymbolDict(self, portfolioId):
        logger.debug("Return all the portfolios from the server");
        portfolioSymbolsServer = self.ccarClient.portfolioGroup.getPortfolioSymbolTable(portfolioId).getPortfolioSymbols();
        serverDict = {}
        for s in portfolioSymbolsServer: 
            serverDict[s] = s
        return serverDict;        

    def collectNewrowsForPortfolio(self, portfolioId):
        # This is not going to work.
        # Look at the places where the updates happen.
        logger.debug("Compute changes for a " + portfolioId);
        maxRows = 200; # Approximate page size.
        portfolioSymbolsServer = self.ccarClient.portfolioGroup.getPortfolioSymbolTable(portfolioId).getPortfolioSymbols();
        serverDict = {}
        for s in portfolioSymbolsServer: 
            serverDict[s] = s
        localSymbols = []
        localDict = self.ccarClient.localDict
        logger.debug("Local dictionary " + str(localDict))
        nickName = self.ccarClient.getNickName()
        for x in range(2, maxRows):
            p = self.createPortfolioSymbol(portfolioId, nickName, nickName, nickName, "", x)
            logger.debug("Portfolio created " + str(p));
            if p != None:
                localSymbols.append(p)

        for event in localSymbols :
            logger.debug("Setting s " + str(event))
            localDict[event] = event

        for l in localDict:
            # Create handles both insert and update. This is obviously not efficient.
            # We will manage updates correctly.
            e = localDict[l]            
            if (not e in serverDict):
                e.updateCrudType("Create")
                logger.debug("Adding a new symbol: current portfolio value" + str(l))
                self.ccarClient.sendManagePortfolioSymbol(l.asJson())
        for s in serverDict:
            e = serverDict[s]
            if (not e in localDict):
                e.updateCrudType("Delete")
                logger.debug("Deleting an existing symbol: current portfolio value" + str(e))
                self.ccarClient.sendManagePortfolioSymbol(e.asJson())



    def register(self, localVal, remoteVal):
        if hasChanged(localVal, remoteVal):
            saveLocal(localVal);
        else:
            pass;

    def saveLocal(self, localValue): 
        self.ccarClient.localDict[localValue];

    def hasChanged(self, p1, p2) :
        # Has the value changed
        if p1 == None :
            return False
        if p2 == None : 
            return False;
        return p1.quantity != p2.quantity 

    def createLocalvalue(self, portfolioSymbol, creator, updator, nickName, crudType, row):
        assert (portfolioSymbol != None);
        portfolioId = portfolioSymbol.portfolioId;
        p = self.createPortfolioSymbol(portfolioId, creator, updator, nickName, "", row);
        # if p != None:
        #     p.updateCrudType("Create")
        #     self.ccarClient.sendManagePortfolioSymbol(p.asJson());
        #     return p;


    def createPortfolioSymbol(self, portfolioId, creator, updator, nickName, crudType, row):

                symbol      = self.ccarClient.getCellContentForSheet(portfolioId, "A" + str(row))
                quantity    = self.ccarClient.getCellContentForSheet(portfolioId, "B" + str(row)) 
                side        = self.ccarClient.getCellContentForSheet(portfolioId, "C" + str(row))
                symbolType  = self.ccarClient.getCellContentForSheet(portfolioId, "D" + str(row))
                value       = self.ccarClient.getCellContentForSheet(portfolioId, "E" + str(row))
                stressValue = self.ccarClient.getCellContentForSheet(portfolioId, "F" + str(row))
                dateTime    = str(datetime.datetime.now())
                if symbol == None or symbol == "": 
                    return None;
                logger.debug("Creating portfolio symbol for id " + portfolioId + " for row " + str(row) + " symbol " + symbol + 
                                        " " + "Quantity " + quantity);
                jsonrecord = {
                      "commandType" : "ManagePortfolioSymbol"
                    , "crudType" : crudType
                    , "portfolioId" : portfolioId
                    , "symbol" : symbol 
                    , "quantity" : quantity
                    , "side" : side 
                    , "symbolType" : symbolType 
                    , "value" : value 
                    , "stressValue" : stressValue 
                    , "dateTime" : dateTime
                    , "creator" : creator 
                    , "updator" : updator 
                    , "nickName" : nickName
                }
                logger.debug("Portfolio json " + str(jsonrecord))
                return PortfolioSymbol(self.ccarClient, jsonrecord)



### End Class
class ClientOAuth :
    def __init__(self, loginHint):
        logger.debug("Creating an oauth client")
        self.loginHint = loginHint
        # This url needs to change to the actual site.
        self.url = "http://localhost:3000/gmailOauthRequest"
    def getRequest(self):
        logger.debug("Creating a auth request")
        r = requests.get(self.url + "/" + self.loginHint)
        oauthJson = json.loads(r.text)
        authUri = oauthJson["authDetails"]["authorizationURI"]
        clientId = oauthJson["clientId"]["unCI"]
        responseType = "code"
        scope = "openid email"
        redirect_uri = oauthJson["redirectURLs"][0]
        login_hint = self.loginHint
        payload = {
                "client_id" : clientId, 
                "response_type" : responseType,
                "scope" : scope,
                "redirect_uri" : redirect_uri,  
                "login_hint" : login_hint}
        logger.debug("Auth uri " + authUri)
        logger.debug("payload " + urlencode(payload))
        authRequest = authUri + "?" + urlencode(payload)
        logger.debug ("Auth url " + authRequest)
        return authRequest

    def showBrowser(self):
        logger.debug ("Display web browser with the server params");
        webbrowser.open(self.getRequest())

class MarketDataChart:
    def __init__(self, ccarClient):
        logger.debug("Creating market data charts")
        self.ccarClient = ccarClient
        if ccarClient != None:
            self.marketDataDict = self.ccarClient.marketDataBak
        else:
            self.marketDataDict = {}

    def allSymbols(self):
        logger.debug("Symbols for this sheet");
        return self.marketDataDict.keys()

    def createChart(self, aSymbol, index):
        if aSymbol in self.marketDataDict:
            logger.debug("Market data dict " + aSymbol)
            marketData = self.marketDataDict[aSymbol]
            marketDataTimeSeries = marketData.timeSeries.sortedByDate();
            sheet = self.ccarClient.getMarketDataWorksheet();
            oCharts = sheet.getCharts()
            mChart = oCharts.getByName("TEST_CHART")
            logger.debug("Mchart " + str(mchart));

            # oXChartType = oCharts.getByIndex(0).getEmbeddedObject().getFirstDiagram().getCoordinateSystems()[0].getChartTypes()[0]
            
            # oSeries = oXChartType.getDataSeries()
            # oNewSeries = ()
            # oNewSeries = (oSeries[4], oSeries[3], oSeries[2], oSeries[1], oSeries[0] )
            # oXChartType.setDataSeries(oNewSeries)

        else:
            logger.error("Key not found " + aSymbol)



def StartClient(*args):
    try:
        login_cell = "B5"
        # oauth = ClientOAuth(l)
        # oauth.showBrowser()
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
        logger.error(traceback.format_exc())





def createChart():
        symbol = "IBM"
        logger.debug("Market data dict " + aSymbol)
        marketData = self.marketDataDict[aSymbol]
        marketDataTimeSeries = marketData.timeSeries.sortedByDate();
        sheet = self.ccarClient.getMarketDataWorksheet();
        oCharts = sheet.getCharts()
        mChart = oCharts.getByName("TEST_CHART")
        logger.debug("Mchart " + str(mchart));

        # oXChartType = oCharts.getByIndex(0).getEmbeddedObject().getFirstDiagram().getCoordinateSystems()[0].getChartTypes()[0]
        
        # oSeries = oXChartType.getDataSeries()
        # oNewSeries = ()
        # oNewSeries = (oSeries[4], oSeries[3], oSeries[2], oSeries[1], oSeries[0] )
        # oXChartType.setDataSeries(oNewSeries)

g_exportedScripts = StartClient,createChart
