import sys
import urllib
import asyncio
import websockets
##### Note: 
##### It seems to be that all functions in a macro need to reside in a single file.
##### We will break them down into modules as the size of the macros grow.


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

