import sys
import urllib
import asyncio
import websockets
import traceback
import json
##### Note: Requires python 3.4 or above
##### It seems to be that all functions in a macro need to reside in a single file.
##### We will break them down into modules as the size of the macros grow.
##### 

##### Todo:
##### Package the server interaction as a library.


serverHandle = None

def convertToBool(aString):
    if aString.capitalize() == "True" : 
        return True
    else: 
        return False

def SECURITY_CELL(): 
    return "B15"

def SECURITY_CELL_LOG(): 
    return "B16"

def LOGIN_CELL() :
    return"B5" 
def PASSWORD_CELL() :
    return "B6"

def INFO_CELL() :
    return "A32";

def ERROR_CELL(): 
    return "A29"

def clearInfoWorksheet():
    sheet = getWorksheet(0);
    tRange = sheet.getCellRangeByName(INFO_CELL())
    tRange.String = ""


def updateInfoWorksheet(aMessage) :
    sheet = getWorksheet(0);
    tRange = sheet.getCellRangeByName(INFO_CELL())
    tRange.String = tRange.String + "\n" + (str(aMessage))

def clearErrorWorksheet():
    sheet = getWorksheet(0);
    tRange = sheet.getCellRangeByName(ERROR_CELL())
    tRange.String = ""

def updateErrorWorksheet(aMessage) :
    sheet = getWorksheet(0);
    tRange = sheet.getCellRangeByName(ERROR_CELL())
    tRange.String = tRange.String + "\n" + (str (aMessage))

def updateCellContent(aCell, aValue) : 
    sheet = getWorksheet(0);
    tRange = sheet.getCellRangeByName(aCell)
    tRange.String = aValue

def getCellContent(aCell): 
    sheet = getWorksheet(0);
    tRange = sheet.getCellRangeByName(aCell)
    return tRange.String

def getUserName() :
    return getCellContent(LOGIN_CELL())

def clearCells():
    clearInfoWorksheet();
    clearErrorWorksheet();


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
DELETE_USER_PREFERENCES = 1019; SEND_MESSAGE = 1020
USER_JOINED = 1021
USER_BANNED = 1022
USER_LOGGED_IN = 1023;USER_LEFT = 1024
ASSIGN_COMPANY = 1025;KEEP_ALIVE = 1026
PORTFOLIO_SYMBOL_TYPES_QUERY = 1027;PORTFOLIO_SYMBOL_SIDES_QUERY = 1028
QUERY_PORTFOLIOS = 1029; MANAGE_PORTFOLIO = 1030; MANAGE_PORTFOLIO_SYMBOL =1031
QUERY_PORTFOLIO_SYMBOL = 1032; MANAGE_ENTITLEMENTS = 1033; QUERY_ENTITLEMENTS = 1034
QUERY_COMPANY_USERS = 1035; MARKET_DATA_UPDATE = 1036; OPTION_ANALYTICS = 1037
QUERY_MARKET_DATA = 1038; HISTORICAL_STRESS_VALUE_COMMAND = 1039; UNDEFINED = 1040

def commandDictionary () :
    return {
    u"Login"                 : LOGIN_COMMAND ,   "CCARUpload"            : CCAR_UPLOAD_COMMAND
    , "ManageCompany"           : MANAGE_COMPANY , "SelectAllCompanies"      : SELECT_ALL_COMPANIES
    , "QuerySupportedScripts"   : QUERY_SUPPORTED_SCRIPTS , "QueryActiveWorkbenches"  : QUERY_ACTIVE_WORKBENCHES
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


# Indexes are zero based.
def getWorksheet(anIndex) :
    desktop = XSCRIPTCONTEXT.getDesktop()
    model = desktop.getCurrentComponent()
    sheet = model.Sheets.getByIndex(anIndex)
    return sheet

def getSecuritySettings() :
    # Return the security settings for this document.
    desktop = XSCRIPTCONTEXT.getDesktop()
    model = desktop.getCurrentComponent()
    sheet = model.Sheets.getByIndex(0)
    tRange = sheet.getCellRangeByName(SECURITY_CELL())
    tRangeO = sheet.getCellRangeByName(SECURITY_CELL_LOG())
    tRangeO.String = "Using " + tRange.String
    return tRange.String

def sendSelectAllCompaniesRequest(aJsonMessage) :
    payload = {
        'nickName' : getUserName()
        , 'commandType' : "SelectAllCompanies"
    };
    return payload

def sendLoginRequest(userName, password) : 
    #create a login json request
    login = {
        u'commandType' : 'Login',
        u'nickName' : userName, 
        u'loginStatus' : "Undefined",
        u'login' : None
    }
    return json.dumps(login)

def sendUserLoggedIn (jsonRequest): 
    userLoggedIn = {
        'commandType' : 'UserLoggedIn'
        , 'userName' : jsonRequest['login']['nickName']}
    return userLoggedIn

     
def handleUserLoggedIn(response):
    updateInfoWorksheet("User logged in");
    updateInfoWorksheet(response)
    return sendSelectAllCompaniesRequest(response);

def handleLoginResponse(data) :
    updateInfoWorksheet("Login response")
    updateInfoWorksheet(data);
    loginStatus = data['loginStatus']
    if loginStatus != "UserExists":
        updateErrorWorksheet("User not found. Power users need to be registered");
        return;
    lPassword = getCellContent(PASSWORD_CELL());
    if lPassword != data['login']['password']:
        updateErrorWorksheet("Invalid user name password. Call support");
        return;
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


def keepAliveTimer () :
    # A keep alive timer thread that starts
    # once a user is validated.
    pass

def getCommandType(incomingJson) :
    data = json.loads(incomingJson);
    updateInfoWorksheet("Inside getCommandType");
    updateInfoWorksheet(data.keys())
    updateInfoWorksheet(data)
    if "commandType" in data: 
        return data["commandType"]
    elif "Right" in data:
        return (data["Right"])["commandType"]
    else:
        return "Undefined"

def getCommandTypeValue(aCommandType) : 
    updateInfoWorksheet("Processing commandType " + aCommandType)
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

def handleSelectAllCompaniesResponse(response): 
    updateInfoWorksheet(response);

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
    pass
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
def sendKeepAlive(jsonRequest) :
    pass
def handleKeepAlive(jsonRequest) :
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
def clientConnection () : 
    CONNECTION_CELL = "C3";
    return getCellContent(CONNECTION_CELL);
    #return "https://beta.ccardemo.tech"
    #return "wss://beta.ccardemo.tech/chat"

def updateModel(aConnection) :
    """Update the document model with the current server handle. """
    global serverHandle 
    serverHandle = aConnection


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
    updateInfoWorksheet("###Command Type ### " + cType)
    commandType = getCommandTypeValue(cType)
    
    if commandType == LOGIN_COMMAND: 
        reply = handleLoginResponse(payload);
    elif commandType == CCAR_UPLOAD_COMMAND:
        reply = handleCCARUpload(paylad)
    elif commandType == MANAGE_COMPANY:
        reply = handleManageCompany(payload);
    elif commandType == SELECT_ALL_COMPANIES: 
        reply = handleSelectAllCompanies(payload);
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
        raise (BaseException("Invalid command " + payload))
    return reply

#################### Begin loop ##############################

@asyncio.coroutine
def ccarLoop(userName, password, useSsl):
    websocket = yield from websockets.connect(clientConnection())
    updateModel(websocket)

    try:
        payload = sendLoginRequest(userName, password);
        yield from websocket.send(payload)
        while True:
            response = yield from websocket.recv()
            commandType = getCommandType(response);
            updateInfoWorksheet("Login request command type " + commandType);
            reply = processIncomingCommand(response)
            updateInfoWorksheet("Sending reply " + str(reply))
            yield from websocket.send(json.dumps(reply))
            updateInfoWorksheet("Reply sent");
    except:
        updateErrorWorksheet(traceback.format_exc())
    finally:
        yield from websocket.close()


def LOGGER_CELL():
    return "A23"

def login (userName, password, ssl) :
    try:
        if userName == None or userName == "" or password == None or password == "":
            updateCellContent(LOGGER_CELL(), "User name and or password not found")
            return;
        asyncio.get_event_loop().run_until_complete(ccarLoop(userName, password, ssl))
        return (userName + "_" + "***************")
    except:
        error = traceback.format_exc() 
        updateErrorWorksheet(error)
        return "Error while logging in" 
    finally:
        return "Finished processing login"

def StartClient(*args):
    """Starts the CCAR client."""
#get the doc from the scripting context which is made available to all scripts
    desktop = XSCRIPTCONTEXT.getDesktop()
    model = desktop.getCurrentComponent()
#check whether there's already an opened document. Otherwise, create a new one
    if not hasattr(model, "Sheets"):
        model = desktop.loadComponentFromURL(
            "private:factory/scalc","_blank", 0, () )
#get the XText interface
    sheet = model.Sheets.getByIndex(0)
    tRange = sheet.getCellRangeByName("C5")
    tRange.String = sys.executable
    tRange = sheet.getCellRangeByName("C10")
    clearCells();
    s = getSecuritySettings()
    l = getCellContent(LOGIN_CELL())
    p = getCellContent(PASSWORD_CELL())
    tRange.String = login(l, p, convertToBool(s))

    return None


g_ExportedScripts = StartClient

