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


def convertToBool(aString):
    if aString.capitalize() == "True" : 
        return True
    else: 
        return False

def SECURITY_CELL(): 
    return "B15"

def SECURITY_CELL_LOG(): 
    return "B16"



def parseIncomingMessage(incomingJson) : 
    commandType = getCommandType(incomingJson)
    if commandType == 0 :
        handleLoginResponse(incomingJson)
    elif commandType == 1 :
        handleCCARUpload(incomingJson)
    elif commandType == 2: 
        handleManageCompany(incomingJson)
    elif commandType == 3 :
        handleSelectAllCompanies(incomingJson)
    elif commandType == 4 : 
        handleQuerySupportedScripts(incomingJson)
    elif commandType == 5 : 
        handleQueryActiveWorkbenches(incomingJson)
    else:
        pass
def commandDictionary () :
    {
        "Login"                 : 0
    ,   "CCARUpload"            : 1
    , "ManageCompany"           : 2
    , "SelectAllCompanies"      : 3
    , "QuerySupportedScripts"   : 4
    , "QueryActiveWorkbenches"  : 5
    , "ManageWorkbench"         : 6
    , "ExecuteWorkbench"        : 7
    , "SelectActiveProjects"    : 8
    , "ManageProject"           : 9
    , "ParsedCCARText"          : 10
    , "ManageUser"              : 11
    , "CreateUserTerms"         : 12
    , "UpdateUserTerms"         : 13
    , "DeleteUserTerms"         : 14
    , "QueryUserTerms"          : 15
    , "CreateUserPreferences"   : 16
    , "UpdateUserPreferences"   : 17
    , "QueryUserPreferences"    : 18
    , "DeleteUserPreferences"   : 19
    , "SendMessage"             : 20
    , "UserJoined"              : 21
    , "UserBanned"              : 22
    , "UserLoggedIn"            : 23
    , "UserLeft"                : 24
    , "AssignCompany"           : 25
    , "keepAlive"               : 26
    , "PortfolioSymbolTypesQuery" : 27
    , "PortfolioSymbolSidesQuery" : 28
    , "QueryPortfolios"         : 29
    , "ManagePortfolio"         : 30
    , "ManagePortfolioSymbol"   : 31
    , "QueryPortfolioSymbol"    : 32
    , "ManageEntitlements"      : 33
    , "QueryEntitlements"       : 34
    , "QueryCompanyUsers"       : 35
    , "MarketDataUpdate"        : 36
    , "OptionAnalytics"         : 37
    , "QueryMarketData"         : 38
    , "HistoricalStressValueCommand" : 39
    , "Undefined"               : 40

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

def sendLoginRequest(userName, password) : 
    #create a login json request
    login = {
        'commandType' : 'Login',
        'nickName' : userName, 
        'loginStatus' : "Undefined",
        'login' : userName

    }
    return json.dumps(login)

def handleLoginResponse(incomingJson) :
    data = json.loads(incomingJson);


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
    try :
        if data.has_key("commandType"):
            cType =  data["commandType"]
            return commandDictionary()[cType]
        elif data.has_key("Right"):
            cType = (data["Right"])["commandType"]
            return commandDictionary()[cType]
        else:
            return commandDictionary()["Undefined"]
    except :
        updateErrorWorkSheet("InvalidCommandType " + incomingJson)
        cType = commandDictionary()["Undefined"]



def handleUndefinedCommandType(incomingMessage) :
    # Do something when command type is not defined.
    pass

def sendManageCompany(aJsonMessage) :
    # Send a manage company json request
    pass
def handleManageCompany(aJsonResponse): 
    #Handle manage company
    pass
def sendSelectAllCompaniesRequest(aJsonMessage) :
    # A request to return all the companies
    pass 

def handleSelectAllCompaniesResponse(): 
    # Server response to return all the companies
    # Company reference is to help whitelabel the client.
    pass

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
def sendUserLoggedIn (jsonRequest): 
    pass 
def handleUserLoggedIn(jsonRequest):
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


def LOGIN_CELL() :
    return"B5" 
def PASSWORD_CELL() :
    return "B6"

def ERROR_CELL(): 
    return "A29"

def updateErrorWorksheet(aMessage) :
    sheet = getWorksheet(0);
    tRange = sheet.getCellRangeByName(ERROR_CELL())
    tRange.String = aMessage    

def updateCellContent(aCell, aValue) : 
    sheet = getWorksheet(0);
    tRange = sheet.getCellRangeByName(aCell)
    tRange.String = aValue

def getCellContent(aCell): 
    sheet = getWorksheet(0);
    tRange = sheet.getCellRangeByName(aCell)
    return tRange.String
## https returns and invalid url. 
def clientConnection () : 
    #return "https://beta.ccardemo.tech/chat"
    return "wss://localhost:3000/chat"

@asyncio.coroutine
def ccarLoop(userName, password, useSsl):
    websocket = yield from websockets.connect(clientConnection(), ssl=useSsl)
    try:
        payload = sendLoginRequest(userName, password);
        yield from websocket.send(payload)
        reply = yield from websocket.recv()
        print(reply)
    finally:
        updateErrorWorksheet(traceback.format_exc())
        yield from websocket.close()


def LOGGER_CELL():
    return "A23"

def login (userName, password, ssl) :
    try:
        updateCellContent(LOGGER_CELL(), "Username" + "tbd-")
        if userName == None or userName == "" or password == None or password == "":
            updateCellContent(LOGGER_CELL(), "User name and or password not found")
            return;
        updateCellContent(LOGGER_CELL(), "After user name");
        asyncio.get_event_loop().run_until_complete(ccarLoop(userName, password, ssl))
        return (userName + "_" + "***************")
    except:
        error = traceback.format_exc() 
        updateErrorWorksheet(error)
        return "Error while logging in" 
    finally:
        return "Finished processing login"

def PythonVersion(*args):
    """Prints the Python version into the current document"""
#get the doc from the scripting context which is made available to all scripts
    desktop = XSCRIPTCONTEXT.getDesktop()
    model = desktop.getCurrentComponent()
#check whether there's already an opened document. Otherwise, create a new one
    if not hasattr(model, "Sheets"):
        model = desktop.loadComponentFromURL(
            "private:factory/scalc","_blank", 0, () )
#get the XText interface
    sheet = model.Sheets.getByIndex(0)
#create an XTextRange at the end of the document
    tRange = sheet.getCellRangeByName("C4")
#and set the string
    tRange.String = "The Python version is %s.%s.%s" % sys.version_info[:3]
#do the same for the python executable path
    tRange = sheet.getCellRangeByName("C5")
    tRange.String = sys.executable
    tRange = sheet.getCellRangeByName("C10")
    s = getSecuritySettings()
    l = getCellContent(LOGIN_CELL())
    p = getCellContent(PASSWORD_CELL())
    tRange.String = login(l, p, convertToBool(s))

    return None


g_ExportedScripts = PythonVersion

