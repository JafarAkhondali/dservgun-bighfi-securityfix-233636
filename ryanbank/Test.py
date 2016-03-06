import numpy as np #Imports numpy imports
import h5py	# Imports hdf5 python library.
import sys # To process command line arguments.
import logging
import os
import traceback
from timeit import timeit

def headers(headerSize): 
	result = []
	for i in range(1, headerSize):
		iS = str(i)
		result.append(("col" + iS , "Header" + iS))
	logging.debug(result);
	return result

"""
Create a h5 file. Modes are passed to the h5 library.
"""
def createFile(aFileName, mode):
	f = h5py.File(aFileName, mode)
	return f

def closeFile(aFileHandle):
	logging.debug("Closing file " + str(aFileHandle))
	aFileHandle.close()

def getGroup(aFile, aGroupName, aGroupTag):
	return aFile[aGroupName];
"""
Create a group for an hdf5 file. 
"""
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

	
# Combine keys to tag a pnl vector
def combineKeys(key1, key2, pnl1):
	pass

def appendPnl(key, pnl):
	pass

# Given 2 pnl vectors, accumulate them.
def mplus(pnl1, pnl2):
	result = []
	for a, b in zip(pnl1, pnl2) :
		result.append(a + b)
	return result;

def summaryPnl(pnlList):
	currentList = None;
	for aList in pnlList:
		prevList = currentList
		currentList = aList
		if ((prevList == None) or (currentList == None)):
			pass
		else:
			currentList = mplus(prevList, currentList)
	return currentList

def insert(aFile, defaultMode, args) :
	f = createFile(aFile, defaultMode)
	try: 
		flushCounter = 50;
		currentCounter = 0;
		hs = headers(int(args[3]))
		for (x, y) in hs :
			if(currentCounter % flushCounter == 0) :
				logging.debug("Flushing " + str(f));
				f.flush()
			currentCounter = currentCounter + 1
			group = createGroup(f, x, y);
			createChunkedDataSet(group, int(args[2]))
		
	except:
		logging.error(traceback.format_exc())
		logging.error("Error creating dataset. Deleting file");
		os.remove(os.path.join(".", args[1]))

def read(aFileName, readMode, args):
	hs = headers(int(args[3]))
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

def main():
	logging.basicConfig(level=logging.INFO)
	defaultMode = "a"
	args = sys.argv
	insert(args[1], defaultMode, args)
	read(args[1], "r", args)
if __name__ == '__main__':
	logging.info("Time taken " + str(timeit(main, number = 1)))


