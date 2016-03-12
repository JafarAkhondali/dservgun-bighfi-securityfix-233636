Profile for csv files
=====================

         180161 function calls in 0.137 seconds

Ordered by: cumulative time

ncalls tottime percall cumtime percall filename:lineno(function) 1 0.000
0.000 0.137 0.137 Test.py:98(main\_csv) 1 0.000 0.000 0.137 0.137
CSVWriter.py:28(insert) 9 0.095 0.011 0.136 0.015
CSVWriter.py:17(insertChunkToFile) 180000 0.039 0.000 0.039 0.000
{method 'write' of 'file' objects} 9 0.002 0.000 0.002 0.000 {method
'rand' of 'mtrand.RandomState' objects} 9 0.000 0.000 0.000 0.000
{method 'close' of 'file' objects} 9 0.000 0.000 0.000 0.000 {open} 10
0.000 0.000 0.000 0.000 posixpath.py:61(join) 10 0.000 0.000 0.000 0.000
**init**.py:1629(debug) 10 0.000 0.000 0.000 0.000
**init**.py:1143(debug) 1 0.000 0.000 0.000 0.000 common.py:3(headers) 1
0.000 0.000 0.000 0.000 {posix.mkdir} 10 0.000 0.000 0.000 0.000
**init**.py:1358(isEnabledFor) 19 0.000 0.000 0.000 0.000 {method
'startswith' of 'str' objects} 1 0.000 0.000 0.000 0.000
**init**.py:1505(basicConfig) 19 0.000 0.000 0.000 0.000 {method
'endswith' of 'str' objects} 10 0.000 0.000 0.000 0.000
**init**.py:1344(getEffectiveLevel) 1 0.000 0.000 0.000 0.000
**init**.py:211(\_acquireLock) 1 0.000 0.000 0.000 0.000
threading.py:147(acquire) 11 0.000 0.000 0.000 0.000 {len} 1 0.000 0.000
0.000 0.000 threading.py:187(release) 1 0.000 0.000 0.000 0.000
**init**.py:220(\_releaseLock) 2 0.000 0.000 0.000 0.000
{thread.get\_ident} 2 0.000 0.000 0.000 0.000 threading.py:64(\_note) 9
0.000 0.000 0.000 0.000 {method 'append' of 'list' objects} 1 0.000
0.000 0.000 0.000 {method 'release' of 'thread.lock' objects} 1 0.000
0.000 0.000 0.000 {method 'acquire' of 'thread.lock' objects} 1 0.000
0.000 0.000 0.000 {range} 1 0.000 0.000 0.000 0.000 {method 'disable' of
'\_lsprof.Profiler' objects}

Profile for hdf5 files
======================

         1588 function calls (1575 primitive calls) in 0.015 seconds

Ordered by: cumulative time List reduced from 159 to 50 due to
restriction &lt;50&gt;

ncalls tottime percall cumtime percall filename:lineno(function) 1 0.000
0.000 0.015 0.015 Test.py:103(main\_hdf5) 1 0.001 0.001 0.015 0.015
HDFWriter.py:54(insert) 9 0.000 0.000 0.007 0.001
HDFWriter.py:30(createGroup) 9 0.000 0.000 0.006 0.001
attrs.py:79(**setitem**) 9 0.001 0.000 0.006 0.001 attrs.py:94(create) 9
0.000 0.000 0.006 0.001 HDFWriter.py:43(createChunkedDataSet) 1 0.000
0.000 0.005 0.005 uuid.py:45(<module>) 1 0.000 0.000 0.004 0.004
util.py:241(find\_library) 1 0.000 0.000 0.004 0.004
util.py:214(\_findSoname\_ldconfig) 9 0.000 0.000 0.003 0.000
group.py:50(create\_dataset) 1 0.003 0.003 0.003 0.003 {method 'read' of
'file' objects} 9 0.003 0.000 0.003 0.000 {method 'rand' of
'mtrand.RandomState' objects} 9 0.002 0.000 0.002 0.000
dataset.py:44(make\_new\_dset) 1 0.000 0.000 0.001 0.001
re.py:143(search) 9 0.000 0.000 0.000 0.000 group.py:39(create\_group) 1
0.000 0.000 0.000 0.000 re.py:230(\_compile) 1 0.000 0.000 0.000 0.000
HDFWriter.py:16(createFile) 1 0.000 0.000 0.000 0.000
files.py:221(**init**) 1 0.000 0.000 0.000 0.000
sre\_compile.py:567(compile) 9 0.000 0.000 0.000 0.000
uuid.py:579(uuid4) 36 0.000 0.000 0.000 0.000
fromnumeric.py:1726(product) 45 0.000 0.000 0.000 0.000 {method 'reduce'
of 'numpy.ufunc' objects} 1 0.000 0.000 0.000 0.000
files.py:69(make\_fid) 9 0.000 0.000 0.000 0.000
dataset.py:260(**init**) 1 0.000 0.000 0.000 0.000 {posix.popen} 1 0.000
0.000 0.000 0.000 {method 'search' of '\_sre.SRE\_Pattern' objects} 9
0.000 0.000 0.000 0.000 group.py:240(**setitem**) 1 0.000 0.000 0.000
0.000 sre\_parse.py:706(parse) 54 0.000 0.000 0.000 0.000
base.py:104(\_e) 13 0.000 0.000 0.000 0.000 uuid.py:101(**init**) 9
0.000 0.000 0.000 0.000 filters.py:77(generate\_dcpl) 2/1 0.000 0.000
0.000 0.000 sre\_parse.py:317(\_parse\_sub) 1 0.000 0.000 0.000 0.000
files.py:308(**repr**) 2/1 0.000 0.000 0.000 0.000
sre\_parse.py:395(\_parse) 27 0.000 0.000 0.000 0.000
{h5py.h5t.py\_create} 1 0.000 0.000 0.000 0.000
sre\_compile.py:552(\_code) 18 0.000 0.000 0.000 0.000
base.py:114(get\_lcpl) 2 0.000 0.000 0.000 0.000
**init**.py:71(search\_function) 1 0.000 0.000 0.000 0.000 six.py:620(u)
1 0.000 0.000 0.000 0.000 **init**.py:349(**init**) 5/1 0.000 0.000
0.000 0.000 sre\_compile.py:64(\_compile) 18 0.000 0.000 0.000 0.000
base.py:45(guess\_dtype) 27 0.000 0.000 0.000 0.000
numeric.py:394(asarray) 20 0.000 0.000 0.000 0.000
**init**.py:1629(debug) 2 0.000 0.000 0.000 0.000 {**import**} 36 0.000
0.000 0.000 0.000 {numpy.core.multiarray.array} 1 0.000 0.000 0.000
0.000 {\_ctypes.dlopen} 9 0.000 0.000 0.000 0.000
**init**.py:52(create\_string\_buffer) 211 0.000 0.000 0.000 0.000
{isinstance} 9 0.000 0.000 0.000 0.000 filters.py:211(get\_filters)
