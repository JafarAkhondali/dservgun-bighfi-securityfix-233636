import numpy as np #Imports numpy imports
import h5py	# Imports hdf5 python library.
import sys # To process command line arguments.
import logging
import os
import traceback
import argparse
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

def insertIntoCSVFile(fHandle, aChunkSize): 
	logging.debug("Creating a csv file");
	arr = np.random.rand(aChunkSize, 1);
	for num in arr:
		fHandle.write("%f\n" % num)	


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




# Create a directory with the file name.
# Create a header file for each header
# Populate with the chunksize
def insertCSV(aDirectoryName, chunkSize, headerSize):
	# Creates a directory under the current directory.
	os.mkdir(os.path.join(".", aDirectoryName))	
	hs = headers(headerSize) 
	for (x, y) in hs:
		fileName = os.path.join(".", aDirectoryName, x)
		filehandle = open(fileName, "a")
		insertIntoCSVFile(filehandle, chunkSize);
		filehandle.close()

# Create a row in the file with a chunk size for the pnl vector
# and headers
def insert(aFile, defaultMode, chunkSize, headerSize) :
	f = createFile(aFile, defaultMode)
	try: 
		flushCounter = 50;
		currentCounter = 0;
		hs = headers(headerSize)
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

'''
To use the hdf5 option, being boolean, the canonical way of calling the script is as follows
---- To use hdf5 file: 
python Test.py --file test.hdf5 --hdf5 --chunkSize 1024 --headers 10
---- To switch hdf5 off
python Test.py --file test.hdf5 --chunkSize 1024 --headers 10
'''
def parseArguments() :
	parser = argparse.ArgumentParser(description = "A simple utility to compare file systems: hdf5 and a flat file.");
	parser.add_argument("--file", help="Data file")
	parser.add_argument("--hdf5", help="Save in hdf5 or as a csv file", action='store_true', default=False)
	parser.add_argument("--chunkSize", type=int, help="pnl vector size")
	parser.add_argument("--headers", type=int, help="risk factors")
	return parser.parse_args()
def main():
	logging.basicConfig(level=logging.INFO)
	defaultMode = "a"
	namespace = parseArguments();
	print (str(namespace))	
	if (namespace.hdf5 == True): 
		insert(namespace.file, defaultMode, namespace.chunkSize, namespace.headers)
	else:
		insertCSV(namespace.file, namespace.chunkSize, namespace.headers)
	#read(namespace.file, "r", namespace.chunkSize, namespace.headers)
if __name__ == '__main__':
	logging.info("Time taken " + str(timeit(main, number = 1)))


