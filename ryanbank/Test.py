import numpy as np #Imports numpy imports
import h5py	# Imports hdf5 python library.
import sys # To process command line arguments.
import logging
import os
import traceback
import argparse
from timeit import timeit
import pickle
import shutil
import HDFWriter
import CSVWriter
import cProfile
import pstats
import StringIO

def pickleFileName(mode) :
	return open("TEST_HDF_CSV_WRITE", mode)

def cleanup():
	try :
		logging.debug("Cleaning  up files")
		namespace = pickle.load(pickleFileName("rb"))
		fileName = os.path.join (".", namespace.file)
		csvFileName = os.path.join (".", namespace.file +  ".csv")
		hdf5FileName = os.path.join(".", namespace.file + ".hdf5")
		if os.path.isdir(csvFileName):
			logging.warn("Deleting directory " + csvFileName)
			shutil.rmtree(csvFileName)
		
		os.unlink(hdf5FileName)
		logging.warn("Deleting file " + hdf5FileName)
		logging.info("Cleaning up from previous run " + str(namespace))
	except:
		logging.error(traceback.format_exc())


def print_profile(header, profile):
	''' Prints the profile information. Using \'cumulative\' flag '''
	s = StringIO.StringIO()
	sortby = 'cumulative'
	ps = pstats.Stats(profile, stream=s).sort_stats(sortby)
	ps.print_stats()
	return header + "\n" + s.getvalue()


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
	result = parser.parse_args();
	pickle.dump(result, pickleFileName("wb"));
	return parser.parse_args()
def main_csv(namespace) :
	logging.basicConfig(level=logging.INFO)
	defaultMode = "a"
	CSVWriter.insert(namespace.file + ".csv", namespace.chunkSize, namespace.headers)

def main_hdf5(namespace):
	logging.basicConfig(level=logging.INFO)
	defaultMode = "a"
	HDFWriter.insert(namespace.file + ".hdf5", defaultMode, namespace.chunkSize, namespace.headers)

def main():
	cleanup()
	namespace = parseArguments();
	pr = cProfile.Profile();
	pr.enable()
	main_csv(namespace)
	pr.disable()
	print (print_profile("Profile for csv files", pr))
	pr = cProfile.Profile()
	pr.enable()
	main_hdf5(namespace)
	pr.disable()
	print (print_profile("Profile for hdf5 files" , pr))


if __name__ == '__main__':
	logging.info("Time taken " + str(timeit(main, number = 1)))
	# Also collect and generate the profile information


