
import numpy as np #Imports numpy imports
import h5py	# Imports hdf5 python library.
import sys # To process command line arguments.
import logging
import os
import traceback
import argparse
from timeit import timeit
import shutil
import common
#Write data into hdf5.

'''
Create a h5 file. Modes are passed to the h5 library.
'''
def createFile(aFileName, mode):
	f = h5py.File(aFileName, mode)
	return f

def closeFile(aFileHandle):
	logging.debug("Closing file " + str(aFileHandle))
	aFileHandle.close()

def getGroup(aFile, aGroupName, aGroupTag):
	return aFile[aGroupName];
'''
Create a group for an hdf5 file. 
'''
def createGroup(aFile, aGroupName, aGroupTag):
	logging.debug("Creating group " + aGroupName + " " + aGroupTag);
	subGroup = aFile.create_group(aGroupName)
	subGroup.attrs[aGroupName] = aGroupTag;
	return subGroup;

# A test utility that generates a dataset of a given size and
# associates the specified node.
def createDataSet(aNode, aSize):
	logging.debug("Creating dataset " + str(aSize))
	arr = np.random.rand(aSize, 1);
	aNode["pnl"] = arr

def createChunkedDataSet(aNode, aSize):
	logging.debug("Creating dataset " + str(aSize))
	arr = np.random.rand(aSize, 1);
	dsName = "chunked";
	chunkSize = min(aSize, 1000)
	aDataSet = aNode.create_dataset(dsName, (aSize, 1), data = arr, dtype='f', chunks=(chunkSize, 1))



# Create a row in the file with a chunk size for the pnl vector
# and headers
def insert(aFile, defaultMode, chunkSize, headerSize) :
	f = createFile(aFile, defaultMode)
	try: 
		flushCounter = 50;
		currentCounter = 0;
		hs = common.headers(headerSize)
		for (x, y) in hs :
			if(currentCounter % flushCounter == 0) :
				logging.debug("Flushing " + str(f));
				f.flush()
			currentCounter = currentCounter + 1
			group = createGroup(f, x, y);
			createChunkedDataSet(group, chunkSize)
		
	except:
		logging.error(traceback.format_exc())
		logging.error("Error creating dataset. Deleting file");
		os.remove(os.path.join(".", aFile))

def read(aFileName, readMode, chunkSize, headerSize):
	hs = headers(headerSize)
	f = createFile(aFileName, readMode);
	for (x, y) in hs: 
		g = getGroup(f, x, y);
		chk = g['chunked']
		(rows, cols) = chk.shape
		for a in range(0, rows):
			for b in range(0, cols):
				logging.debug("Assigning values for " + str(chk[a][b]));
				chk[a][b] = 42.123
		logging.debug ("chk shape " + str(chk.shape))
		logging.debug("Reading chunk" + str(chk))
	f.flush()
	closeFile(f)
