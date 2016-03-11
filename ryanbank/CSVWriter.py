import numpy as np #Imports numpy imports
import sys # To process command line arguments.
import logging
import os
import traceback
import argparse
from timeit import timeit
import shutil
import common
"""
 A CSV file writer.
"""



# Private method. 
def insertChunkToFile(fHandle, aChunkSize): 
	logging.debug("Creating a csv file");
	arr = np.random.rand(aChunkSize, 1);
	for num in arr:
		fHandle.write("%f\n" % num)	


# Insert process :
# 1. Create a directory with the specified name (should use named arguments)
# 2. Create a chunk in a file for each header. WARN: Number of headers equal to (=) number of files generated. 
# Populate with the chunksize
def insert(aDirectoryName, chunkSize, headerSize):
	# Creates a directory under the current directory.
	os.mkdir(os.path.join(".", aDirectoryName))	
	hs = common.headers(headerSize) 
	for (x, y) in hs:
		fileName = os.path.join(".", aDirectoryName, x)
		filehandle = open(fileName, "wb", buffering = 160000)
		insertChunkToFile(filehandle, chunkSize);
		filehandle.close()
