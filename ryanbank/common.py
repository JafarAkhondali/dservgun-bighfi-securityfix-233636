import logging

def headers(headerSize): 
	result = []
	for i in range(1, headerSize):
		iS = str(i)
		result.append(("col" + iS , "Header" + iS))
	logging.debug(result);
	return result
