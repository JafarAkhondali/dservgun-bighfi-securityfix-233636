import sys
import urllib
import asyncio
import websockets
##### Note: 
##### It seems to be that all functions in a macro need to reside in a single file.
##### We will break them down into modules as the size of the macros grow.


##### Todo:
##### Package the server interaction as a library.


#Send and receive commands. XXX: Ordering of functions matter.



def sendLoginRequest(userName, password) : 
    #create a login json request
    pass

def handleLoginResponse(incomingJson) :
    #Handle incoming json response
    pass

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
    # Return the command type for incoming message.
    pass

def parseIncomingMessage(incomingJson) : 
    # Get the command type
    # process the appropriate command type.
    pass 

def handleUndefinedCommandType(incomingMessage) :
    # Do something when command type is not defined.
    pass

def sendManageCompany(aJsonMessage) :
    # Send a manage company json request
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


## https returns and invalid url. 
def clientConnection () : 
    #return "https://beta.ccardemo.tech/chat"
    return "wss://beta.ccardemo.tech/chat"

@asyncio.coroutine
def hello(userName, password):
    websocket = yield from websockets.connect(clientConnection())
    try:
        yield from websocket.send(userName)
        print(userName)

        greeting = yield from websocket.recv()
        print(greeting)

    finally:
        yield from websocket.close()

def login (userName, password) :
    asyncio.get_event_loop().run_until_complete(hello(userName, password))
    return (userName + "_" + "***************")



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
    tRange.String = login("test", "test")
    return None


g_ExportedScripts = PythonVersion

