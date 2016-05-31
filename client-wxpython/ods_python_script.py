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
## https returns and invalid url. 
def clientConnection () : 
    #return "https://beta.ccardemo.tech/chat"
    return "ws://localhost:3000/chat"

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

