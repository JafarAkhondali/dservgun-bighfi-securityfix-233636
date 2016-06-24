import sys
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

logging.basicConfig(filename="odspythonscript.log", level = logging.DEBUG, filemode = "w")

logger = logging.getLogger(__name__)    
logger.debug("Loaded script file")
##### Note: Requires python 3.4 or above
##### It seems to be that all functions in a macro need to reside in a single file.
##### We will break them down into modules as the size of the macros grow.
##### 

##### Todo:
##### Package the server interaction as a library.

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
UNDEFINED = 1040
COMPANY_SELECTION_LIST_CONTROL = "BrokerList"
COMPANY_SELECTION_LIST_CONTROL_INDEX = 0


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
        sheet = model.Sheets.getByName(worksheetName) 
        return sheet   
    @staticmethod
    def convertToBool(aString):    
        if aString.capitalize() == "True" : 
            return True
        else: 
            return False
    @staticmethod
    def updateCellContent(worksheet, cell, value):
        sheet = Util.getWorksheetByName(worksheet)
        tRange = sheet.getCellRangeByName(cell)
        tRange.String = value


class PortfolioGroup:
    def __init__(self, portfolioSummaries):
        self.portfolioWorksheet = "portfolio_analysis_sheet"
        self.portfolioDetailCount = 0
        self.portfolioDetailStartRow = 5

        self.portfolioDetailColumns = {"companyId" : "A"
                                        , "portfolioId" : "B"
                                        , "summary" : "C" }
        self.portfolioSummaries = portfolioSummaries

    def updateContents(self):
        for summaryDictionary in self.portfolioSummaries:
            summary = summaryDictionary["Right"]
            cellPosition = str(self.portfolioDetailCount + self.portfolioDetailStartRow)
            companyCol = self.portfolioDetailColumns["companyId"]
            portfolioCol = self.portfolioDetailColumns["portfolioId"]
            summaryCol = self.portfolioDetailColumns["summary"]

            Util.updateCellContent(self.portfolioWorksheet, 
                                summaryCol + cellPosition, summary["summary"])
            Util.updateCellContent(self.portfolioWorksheet, 
                                portfolioCol + cellPosition, summary["portfolioId"])
            Util.updateCellContent(self.portfolioWorksheet, 
                                companyCol + cellPosition, summary["companyId"])
            self.portfolioDetailCount  = self.portfolioDetailCount + 1                



class CCARClient:
    def __init__(self):

        self.portfolioDetailCount = 0 
        self.portfolioDetailStartRow = 5
        self.portfolioDetailStartCol = "C"
        self.portfolioDetailStartCol1 = "D"
        self.serverHandle = None
        self.INFO_ROW_COUNT = 30
        self.SECURITY_CELL = "B15"
        self.SECURITY_CELL_LOG = "B16"
        self.LOGIN_CELL = "B5"
        self.PASSWORD_CELL = "B6"
        self.ERROR_CELL = "A23"
        self.KEEP_ALIVE_CELL = "B25"
        self.INFO_WORK_SHEET = 0
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
        sheet = self.getWorksheet(self.INFO_WORK_SHEET);
        tRange = sheet.getCellRangeByName(self.INFO_CELL())
        self.INFO_ROW_COUNT = self.INFO_ROW_COUNT + 1
        tRange.String = (str(aMessage))

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

    #################### Begin loop ##############################
    def keepAliveInterval(self) :
        self.interval = self.getCellContent(self.KEEP_ALIVE_CELL)
        return self.interval

    ## Send a keep alive request every n seconds. 
    ## This is not entirely accurate: the client needs to send 
    ## a message only after n seconds of idle period. TODO
    @asyncio.coroutine
    def send(self, aJsonMessage):
        logger.debug(">>>" + str(aJsonMessage));
        yield from self.websocket.send(json.dumps(aJsonMessage))

    @asyncio.coroutine
    def keepAlivePing(self):
        try:
            logger.debug("Starting the keep alive timer..")
            while True: 
                logger.debug("Inside loop")
                reply = self.sendKeepAlive();
                logger.debug("Reply " + str(reply))
                serverConnection = self.websocket                                
                logger.debug("Keep alive ping:" + str(reply) + " Sleeping " + self.keepAliveInterval())        
                yield from serverConnection.send(json.dumps(reply))
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
        logger.debug("Yield from , keep alive ping")
        logger.debug ("keep alive ping")
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
        p = PortfolioGroup(portfolioList);
        p.updateContents();        

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
    def handleManagePortfolioSymbol(self, jsonResponse):
        pass 
    def sendQueryPortfolioSymbol(self, jsonRequest): 
        pass 
    def handleQueryPortfolioSymbol(self, jsonRequest) :
        pass 
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
        pass 
    def handleQueryMarketData(self, jsonRequest) :
        pass 
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
            reply = self.handleManagePortfolioSymbol(payload);
        elif commandType == QUERY_PORTFOLIO_SYMBOL:
            reply = self.handleQueryPortfolioSymbol(payload);
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
            reply = self.handleQueryMarketData(payload);
        elif commandType == HISTORICAL_STRESS_VALUE_COMMAND:
            reply = self.handleHistoricalStressValue(payload);
        else:
            reply = None
        return reply


    
    @asyncio.coroutine
    def ccarLoop(self, userName, password):
        sslCtx = self.getSSLClientContext() # Use ssl client context to test.
        if sslCtx == None:
            self.websocket = yield from websockets.connect(self.clientConnection(), loop = self.loop)
        else:
            self.websocket = yield from websockets.connect(self.clientConnection(), ssl = sslCtx, loop = self.loop)
        logger.debug("CCAR loop %s, ***************", userName)
        try:
            payload = self.sendLoginRequest(userName, password);
            yield from self.websocket.send(payload)
            while True:
                try: 
                    response = yield from  self.websocket.recv()
                    self.updateInfoWorksheet(response)
                    commandType = self.getCommandType(response);                
                    reply = self.processIncomingCommand(response)
                    logger.debug("Reply --> " + str(reply));
                    if reply == None:
                        logger.debug(" Not sending a response " + response);                    
                    else:
                        yield from self.websocket.send(json.dumps(reply))
                except:
                    error = traceback.format_exc()
                    logger.error(error)
                    return "Loop exiting"
        except:
            self.updateErrorWorksheet(traceback.format_exc())
            yield from self.websocket.close()
        

    def LOGGER_CELL():
        return "A23"
    def login (self, loop, userName, password, ssl):
        try:
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

