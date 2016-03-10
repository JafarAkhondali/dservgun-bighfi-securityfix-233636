import numpy as np #Imports numpy imports
import sys # To process command line arguments.
import logging
import os
import traceback
import argparse
from timeit import timeit
import shutil
import common




def writeToFile(fHandle, aChunkSize): 
	logging.debug("Creating a csv file");
	arr = np.random.rand(aChunkSize, 1);
	for num in arr:
		fHandle.write("%f\n" % num)	


# Create a directory with the file name.
# Create a header file for each header
# Populate with the chunksize
def insert(aDirectoryName, chunkSize, headerSize):
	# Creates a directory under the current directory.
	os.mkdir(os.path.join(".", aDirectoryName))	
	hs = common.headers(headerSize) 
	for (x, y) in hs:
		fileName = os.path.join(".", aDirectoryName, x)
		filehandle = open(fileName, "wb", buffering = 160000)
		writeToFile(filehandle, chunkSize);
		filehandle.close()
