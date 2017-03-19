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
import uno, unohelper

from urllib.parse import urlencode

logging.basicConfig(filename="./testapp.log", level = 
        logging.DEBUG, filemode = "w", format="format=%(asctime)s %(name)-12s %(levelname)-8s %(threadName)s %(message)s")

logger = logging.getLogger(__name__)    
logger.debug("Loaded script file "  + os.getcwd())

def setupContext():
        import socket 
        import uno 
        # get the uno component context from the PyUNO runtime
        localContext = uno.getComponentContext()

        # create the UnoUrlResolver
        resolver = localContext.ServiceManager.createInstanceWithContext(
                                "com.sun.star.bridge.UnoUrlResolver", localContext )

        # connect to the running office
        ctx = resolver.resolve( "uno:socket,host=localhost,port=2002;urp;StarOffice.ComponentContext" )
        smgr = ctx.ServiceManager

        # get the central desktop object
        desktop = smgr.createInstanceWithContext( "com.sun.star.frame.Desktop",ctx)

        # access the current writer document
        model = desktop.getCurrentComponent()
        return model

def getWorksheetUno(aName):
        model = setupContext();
        sheet = model.Sheets.getByName(aName);
        return sheet;


def getWorksheet(aName) :
        desktop = XSCRIPTCONTEXT.getDesktop()
        model = desktop.getCurrentComponent()
        sheet = model.Sheets.getByName(aName)
        return sheet
def createChartUno(sheet, name):
        rect = uno.createUnoStruct('com.sun.star.awt.Rectangle')
        rect.Y = 1000
        rect.X = 1000
        rect.Width = 10000
        rect.Height = 10000

        oCellRangeAddress = (sheet.getCellRangeByName("A1:B13").getRangeAddress())
        print(str(oCellRangeAddress))
        chartsCollection = sheet.getCharts()
        columnHeader = False
        rowHeader = False
        chart = chartsCollection.addNewByName(name, rect, oCellRangeAddress, columnHeader, rowHeader)
        return chart

def createChartTest():
        sheet = getWorksheetUno("Sheet1")
        chart = createChartUno(sheet, "TEST_CHART")
        return chart
def createChart(self):
        aSymbol = "IBM"
        logger.debug("Market data dict " + aSymbol)
        sheet = getWorksheet("Sheet1")
        oCharts = sheet.getCharts()
        mChart = oCharts.getByIndex(0)
        logger.debug("Mchart " + str(mChart));

        # oXChartType = oCharts.getByIndex(0).getEmbeddedObject().getFirstDiagram().getCoordinateSystems()[0].getChartTypes()[0]
        
        # oSeries = oXChartType.getDataSeries()
        # oNewSeries = ()
        # oNewSeries = (oSeries[4], oSeries[3], oSeries[2], oSeries[1], oSeries[0] )
        # oXChartType.setDataSeries(oNewSeries)
