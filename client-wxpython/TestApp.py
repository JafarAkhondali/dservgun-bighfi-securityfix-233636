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

logging.basicConfig(filename="./testapp.log", level = 
        logging.DEBUG, filemode = "w", format="format=%(asctime)s %(name)-12s %(levelname)-8s %(threadName)s %(message)s")

logger = logging.getLogger(__name__)    
logger.debug("Loaded script file "  + os.getcwd())

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
