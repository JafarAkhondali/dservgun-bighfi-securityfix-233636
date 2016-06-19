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

logging.basicConfig(filename="odspythonscript.log", level = logging.DEBUG)

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

def convertToBool(aString):
    if aString.capitalize() == "True" : 
        return True
    else: 
        return False

class CCARClient:
    def __init__(self):
        self.serverHandle = None
        self.INFO_ROW_COUNT = 2
        self.SECURITY_CELL = "B15"
        self.SECURITY_CELL_LOG = "B16"
        self.LOGIN_CELL = "B5"
        self.PASSWORD_CELL = "B6"
        self.ERROR_CELL = "A23"
        self.KEEP_ALIVE_CELL = "B25"
        self.INFO_WORK_SHEET = 2
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


    # Indexes are zero based.
    def getWorksheet(self, anIndex) :
        desktop = XSCRIPTCONTEXT.getDesktop()
        model = desktop.getCurrentComponent()
        sheet = model.Sheets.getByIndex(anIndex)
        return sheet

    def clearInfoWorksheet(self):
        sheet = self.getWorksheet(self.INFO_WORK_SHEET);
        count = 2 ## TBD: Needs to be a constant.
        while count < self.INFO_ROW_COUNT:
            cellId = "A" + str(count)
            trange = sheet.getCellRangeByName(cellId)
            trange.String = ""
            count = count + 1

    def updateInfoWorksheet(self, aMessage) :
        sheet = self.getWorksheet(self.INFO_WORK_SHEET);
        logger.debug("Using sheet " + str(sheet) + " " + self.INFO_CELL())
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

    def getCellContent(self, aCell): 
        sheet = self.getWorksheet(0);
        tRange = sheet.getCellRangeByName(aCell)
        return tRange.String

    def getUserName(self) :
        return self.getCellContent(self.LOGIN_CELL)

    def clearCells(self):
        self.clearInfoWorksheet();
        self.clearErrorWorksheet();

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
        updateInfoWorksheet("Processing sending select all companies " + str(aJsonMessage))
        payload = {
            'nickName' : getUserName()
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
            'nickName' : getUserName()
            , 'commandType' : 'UserLoggedIn'
            , 'userName' : getUserName()}
        return userLoggedIn

    def sendKeepAlive(jsonRequest) :
        k = {
            "nickName" : getUserName()
            , "commandType" : "KeepAlive"
            , "keepAlive" : "Ping"
        }
        return k
        
    def handleKeepAlive(jsonRequest) :
        pass 

    #################### Begin loop ##############################
    def keepAliveInterval() :
        interval = getCellContent(KEEP_ALIVE_CELL())
        return int(interval)

    ## Send a keep alive request every n seconds. 
    ## This is not entirely accurate: the client needs to send 
    ## a message only after n seconds of idle period. TODO

    @asyncio.coroutine
    def keepAlivePing():
        try:
            while True: 
                reply = sendKeepAlive();
                global serverHandle
                serverConnection = serverHandle
                if serverConnection == None:
                    yield from asincio.sleep(5)
                updateInfoWorksheet("Keep alive ping:" + str(reply) + " Sleeping " + keepAliveInterval())        
                yield from serverConnection.send(reply)
                yield from asyncio.sleep(keepAliveInterval())
        except:
            updateErrorWorksheet(traceback.format_exc())


    def handleUserLoggedIn(response):
        return sendSelectAllCompaniesRequest(response);

    def handleLoginResponse(data) :
        loginStatus = data['loginStatus']
        if loginStatus != "UserExists":
            updateErrorWorksheet("User not found. Power users need to be registered");
            return;
        lPassword = getCellContent(PASSWORD_CELL());
        if lPassword != data['login']['password']:
            updateErrorWorksheet("Invalid user name password. Call support");
            return;
        updateInfoWorksheet("Handling login response: " + str(data))
        return sendUserLoggedIn(data);


    def handleUserNotFound (incomingJson) :
        # If the user is not found, let the 
        # register on the website. This 
        # might be a useful feature, security wise
        # A sort of poor man's tfa. 
        # Issues to consider: handling multiple 
        # active connections. 
        # The server needs to count per client type.
        # Browser, Smartphone, desktop
        pass



    def getCommandType(incomingJson) :
        data = json.loads(incomingJson);
        if "commandType" in data: 
            return data["commandType"]
        elif "Right" in data:
            return (data["Right"])["commandType"]
        else:
            return "Undefined"

    def getCommandTypeValue(aCommandType) : 
        return commandDictionary()[aCommandType]



    def handleUndefinedCommandType(incomingMessage) :
        # Do something when command type is not defined.
        pass

    def sendManageCompany(aJsonMessage) :
        # Send a manage company json request
        pass
    def handleManageCompany(aJsonResponse): 
        #Handle manage company
        pass

    # Server response <--
    #{"commandType":"SelectAllCompanies",
    #"company":
    #[{"companyID":"test","companyImage":
    #"data:image/png;base64,
    #iVBORw0KGgoAAAANSUhEUgAAB4AAAAQ4CAIAAABnsVYUAAAAA3NCSVQICAjb4U/gAAAAGXRFWHRTb2",
    #"companyName":"test","generalMailbox":"test@tess.org"},{"companyID":"test123",
    #"companyImage":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB4AAAAQ4CAIAAABnsVYUAAAAA3NCSVQICAjb4U/gAAAAGXRFWHRTb2",
    #"companyName":"test123","generalMailbox":"test123"}],"nickName":"test","crudType":"SelectAllCompanies"}

    def handleSelectAllCompaniesResponse(response): 
        companiesList = response['company'];
        companyIDList = []

        count = 0
        for aCompany in companiesList:
            getCompanySelectListBox().addItem(aCompany["companyID"], count)
            count = count + 1

    def sendQuerySupportedScripts(aJsonRequest) : 
        pass 
    def handleQuerySupportedScripts(aJsonResponse):
        pass 
    def sendQueryActiveWorkbenches(aJsonRequest) :
        pass 
    def handleQueryActiveWorkbenches(aJsonResponse):
        pass 

    def sendManageWorkbench(aJsonRequest):
        pass 
    def handleManageWorkbench(aJsonResponse):
        pass 
    def sendExecuteWorkbench(jsonReuest) : 
        pass
    def handleExecuteWorkbench(jsonRequest) :
        pass 
    def sendSelectActiveProjects (jsonReequest) :
        pass 
    def handleSelectActiveProjects(jsonRequest) :
        pass
    def sendManageProject (jsonRequest) :
        pass 
    def handleManageProject (jsonRequest) :
        pass 
    def sendParsedCCARText(jsonRequest) :
        pass 
    def handleParsedCCARText(jsonRequest) :
        pass 
    def sendManageUser (jsonRequest) :
        pass 
    def handleManageUser (jsonRequest) :
        pass 
    def sendCreateUserTerms(jsonRequest) :
        pass 
    def handleCreateUserTerms(jsonReques) :
        pass 
    def sendUpdateUserTerms(jsonRequest): 
        pass 
    def handleUpdateUserTerms (jsonRequest):
        pass
    def sendDeleteUserTerms(jsonRequest):
        pass 
    def handleDeleteUserTerms(jsonRequest) :
        pass 
    def sendQueryUserTerms(jsonRequest) : 
        pass 
    def handleQueryUserTerms(jsonRequest) :
        pass
    def sendCreateUserPreferences(jsonRequest) :
        pass 
    def handleCreateUserPreferences(jsonRequest) :
        pass
    def sendUpdateUserPreferences(jsonRequest) :
        pass 
    def handleUpdateUserPreferences(jsonRequest) :
        pass
    def sendQueryUserPreferences(jsonRequest):
        pass 
    def handleQueryUserPreferences(jsonRequest):
        pass
    def sendDeleteUserPreferences(jsonRequest):
        pass 
    def handleDeleteUserPreferences(jsonRequest) :
        pass 
    def sendMessage(jsonRequest): 
        pass

    def handleSendMessage(jsonResponse):
        try:    
            updateInfoWorksheet("Not handling " + str(jsonResponse));
            return None
        except:
            updateErrorWorksheet(traceback.format_exc())
            return None
    def sendUserJoined(jsonRequest) :
        pass

    def handleUserJoined(jsonRequest) :
        pass
    def sendUserBanned(jsonRequest):
        pass 
    def handleUserBanned(jsonResponse): 
        pass 
    def sendUserLeft (jsonRequest) :
        pass 
    def handleUserLeft (jsonRequest) :
        pass 
    def sendAssignCompany(jsonRequest): 
        pass 
    ## This functionality should go as an desktop 
    ## may not arbitrarily assign a user to a company
    def handleAssignCompany(jsonResponse): 
        pass
    def sendPortfolioSymbolTypesQuery(jsonRequest) :
        pass 
    def handlePortfolioSymbolTypesQuery(jsonResponse):
        pass 
    def senddPortfolioSymbolSidesQuery(jsonRequest): 
        pass 
    def handlePortfolioSymbolSidesQuery(jsonResponse):
        pass 
    def sendQueryPortfolios(jsonRequest):
        pass 
    def handleQueryPortfolios(jsonResponse): 
        pass 
    def sendManagePortfolio(jsonRequest): 
        pass 
    def handleManagePortfolio(jsonResponse):
        pass
    def sendManagePortfolioSymbol(jsonRequest) :
        pass 
    def handleManagePortfolioSymbol(jsonResponse):
        pass 
    def sendQueryPortfolioSymbol(jsonRequest): 
        pass 
    def handleQueryPortfolioSymbol(jsonRequest) :
        pass 
    def sendManageEntitlements(jsonRequest):
        pass 
    def handleManageEntitlements(jsonResponse): 
        pass 
    def sendQueryEntitlements(jsonRequest): 
        pass 
    def handleQueryEntitlements(jsonRequest):
        pass 
    def sendQueryCompanyUsers(jsonRequest): 
        pass 
    def handleQueryCompanyUsers(jsonRequest): 
        pass 
    def sendMarketDataUpdate(jsonRequest):
        pass 
    def handleMarketDataUpdate(jsonResponse):
        pass 
    def sendOptionAnalytics(jsonRequest) :
        pass 
    def handleQptionAnalytics(jsonResponse): 
        pass 
    def sendQueryMarketData(jsonRequest):
        pass 
    def handleQueryMarketData(jsonRequest) :
        pass 
    def sendHistoricalStressValue(jsonRequest):
        pass
    def handleHistoricalStressValue(jsonResponse): 
        pass



    ## https returns and invalid url. 
    def clientConnection (self) : 
        CONNECTION_CELL = "C3";
        return self.getCellContent(CONNECTION_CELL);


    ### Right in the json response implies no errors.
    def processIncomingCommand(payloadI) :
        cType = getCommandType(payloadI);
        payloadJ = json.loads(payloadI)
        if "Right" in  payloadJ:
            payload = payloadJ["Right"]; 
        elif "Left" in payloadJ:
            updateErrorWorksheet(payloadJ);
            return;
        else:
            payload = payloadJ

        commandType = getCommandTypeValue(cType)
        if commandType == LOGIN_COMMAND: 
            reply = handleLoginResponse(payload);
        elif commandType == CCAR_UPLOAD_COMMAND:
            reply = handleCCARUpload(paylad)
        elif commandType == MANAGE_COMPANY:
            reply = handleManageCompany(payload);
        elif commandType == SELECT_ALL_COMPANIES: 
            reply = handleSelectAllCompaniesResponse(payload);
        elif commandType == QUERY_SUPPORTED_SCRIPTS:
            reply = handleQuerySupportedScripts(payload);
        elif commandType == QUERY_ACTIVE_WORKBENCHES:  
            reply = handleQueryActiveWorkbenches(payload);
        elif commandType == MANAGE_WORKBENCH:
            reply = handleManageWorkbench(payload);
        elif commandType == EXECUTE_WORKBENCH:
            reply = handleExecuteWorkbench(payload);
        elif commandType == SELECT_ACTIVE_PROJECTS:
            reply = handleSelectActiveProjects(payload);
        elif commandType == MANAGE_PROJECT: 
            reply = handleManageProject(payload);
        elif commandType == PARSED_CCAR_TEXT:
            reply = handleParsedCCARText(payload);
        elif commandType == MANAGE_USER:
            reply = handleManageUser(payload);
        elif commandType == CREATE_USER_TERMS:
            reply = handleCreateUserTerms(payload);
        elif commandType == UPDATE_USER_TERMS:
            reply = handleUpdateUserTerms(payload);
        elif commandType == DELETE_USER_TERMS:
            reply = handleDeleteUserTerms(payload);
        elif commandType == QUERY_USER_TERMS:
            reply = handleQueryUserTerms(payload);
        elif commandType == CREATE_USER_PREFERENCES:
            reply = handleCreateUserPreferences(payload);
        elif commandType == UPDATE_USER_PREFERENCES:
            reply = handleUpdateUserPreferences(payload);
        elif commandType == QUERY_USER_PREFERENCES:
            reply = handleQueryUserPreferences(payload);
        elif commandType == DELETE_USER_PREFERENCES:
            reply = handleDeleteUserPreferences(payload);
        elif commandType == SEND_MESSAGE:
            reply = handleSendMessage(payload);
        elif commandType == USER_BANNED:
            reply = handleUserBanned(payload);
        elif commandType == USER_JOINED:
            reply = handleUserJoined(payload);
        elif commandType == USER_LOGGED_IN:
            reply = handleUserLoggedIn(payload);
        elif commandType == USER_LEFT:
            reply = handleUserLeft(payload);
        elif commandType == ASSIGN_COMPANY:
            reply = handleAssignCompany(payload);
        elif commandType ==  KEEP_ALIVE:
            reply = handleKeepAlive(payload);
        elif commandType == PORTFOLIO_SYMBOL_TYPES_QUERY:
            reply = handlePortfolioSymbolTypesQuery(payload);
        elif commandType == PORTFOLIO_SYMBOL_SIDES_QUERY:
            reply = handlePortfolioSymbolSidesQuery(payload);
        elif commandType == QUERY_PORTFOLIOS:
            reply = handleQueryPortfolios(payload);
        elif commandType == MANAGE_PORTFOLIO:
            reply = handleManagePortfolio(payload);
        elif commandType == MANAGE_PORTFOLIO_SYMBOL:
            reply = handleManagePortfolioSymbol(payload);
        elif commandType == QUERY_PORTFOLIO_SYMBOL:
            reply = handleQueryPortfolioSymbol(payload);
        elif commandType == MANAGE_ENTITLEMENTS:
            reply = handleManageEntitlements(payload);
        elif commandType == QUERY_ENTITLEMENTS:
            reply = handleQueryEntitlements(payload);
        elif commandType == QUERY_COMPANY_USERS:
            reply = handleQueryCompanyUsers(payload);
        elif commandType == MARKET_DATA_UPDATE:
            reply = handleMarketDataUpdate(payload);
        elif commandType == OPTION_ANALYTICS:
            reply = handleQptionAnalytics(payload);
        elif commandType == QUERY_MARKET_DATA:
            reply = handleQueryMarketData(payload);
        elif commandType == HISTORICAL_STRESS_VALUE_COMMAND:
            reply = handleHistoricalStressValue(payload);
        else:
            reply = None
        return reply


    
    @asyncio.coroutine
    def ccarLoop(self, userName, password):
        sslCtx = None # Use ssl client context to test.
        websocket = yield from websockets.connect(self.clientConnection())
        logger.debug("CCAR loop %s, ***************", userName)
        try:
            payload = self.sendLoginRequest(userName, password);
            yield from websocket.send(payload)
            while True:
                try: 
                    response = yield from  websocket.recv()
                    self.updateInfoWorksheet("Server response <--" + response)
                    commandType = self.getCommandType(response);                
                    reply = self.processIncomingCommand(response)
                    self.updateInfoWorksheet("Reply --> " + str(reply));
                    if reply == None:
                        self.updateInfoWorksheet("Ignoring " + response);                    
                    else:
                        yield from websocket.send(json.dumps(reply))
                except:
                    error = traceback.format_exc()
                    logger.error(error)
                    return "Loop exiting"
        except:
            self.updateErrorWorksheet(traceback.format_exc())
            yield from websocket.close()
        

    def LOGGER_CELL():
        return "A23"
    def login (self, userName, password, ssl):
        try:
            logger.debug("Connecting using %s -> %s", userName, password)
            if userName == None or userName == "" or password == None or password == "":
                updateCellContent(LOGGER_CELL(), "User name and or password not found")
                return;
            
            asyncio.get_event_loop().run_until_complete(self.ccarLoop(userName, password))
            return (userName + "_" + "***************")
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
        client.login(l, p, convertToBool(s))
    except:
        logger.errors(traceback.format_exc())

g_ExportedScripts = StartClient

