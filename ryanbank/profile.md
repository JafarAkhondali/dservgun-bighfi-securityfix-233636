h2. Profile for csv files
         180161 function calls in 0.135 seconds

   Ordered by: cumulative time

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    0.000    0.000    0.135    0.135 Test.py:94(main_csv)
        1    0.000    0.000    0.135    0.135 /home/stack/bighfi_spark/ryanbank/CSVWriter.py:28(insert)
        9    0.093    0.010    0.134    0.015 /home/stack/bighfi_spark/ryanbank/CSVWriter.py:17(insertChunkToFile)
   180000    0.039    0.000    0.039    0.000 {method 'write' of 'file' objects}
        9    0.002    0.000    0.002    0.000 {method 'rand' of 'mtrand.RandomState' objects}
        9    0.000    0.000    0.000    0.000 {open}
        9    0.000    0.000    0.000    0.000 {method 'close' of 'file' objects}
       10    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/logging/__init__.py:1629(debug)
       10    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/posixpath.py:61(join)
       10    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/logging/__init__.py:1143(debug)
        1    0.000    0.000    0.000    0.000 {posix.mkdir}
       10    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/logging/__init__.py:1358(isEnabledFor)
        1    0.000    0.000    0.000    0.000 /home/stack/bighfi_spark/ryanbank/common.py:3(headers)
       19    0.000    0.000    0.000    0.000 {method 'startswith' of 'str' objects}
        1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/logging/__init__.py:1505(basicConfig)
       10    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/logging/__init__.py:1344(getEffectiveLevel)
        1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/logging/__init__.py:211(_acquireLock)
       11    0.000    0.000    0.000    0.000 {len}
        1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/threading.py:147(acquire)
       19    0.000    0.000    0.000    0.000 {method 'endswith' of 'str' objects}
        1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/logging/__init__.py:220(_releaseLock)
        1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/threading.py:187(release)
        1    0.000    0.000    0.000    0.000 {method 'acquire' of 'thread.lock' objects}
        1    0.000    0.000    0.000    0.000 {range}
        1    0.000    0.000    0.000    0.000 {method 'release' of 'thread.lock' objects}
        2    0.000    0.000    0.000    0.000 {thread.get_ident}
        9    0.000    0.000    0.000    0.000 {method 'append' of 'list' objects}
        2    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/threading.py:64(_note)
        1    0.000    0.000    0.000    0.000 {method 'disable' of '_lsprof.Profiler' objects}



h2. Profile for hdf5 files
         1588 function calls (1575 primitive calls) in 0.018 seconds

   Ordered by: cumulative time
   List reduced from 159 to 50 due to restriction <50>

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
        1    0.000    0.000    0.018    0.018 Test.py:99(main_hdf5)
        1    0.002    0.002    0.017    0.017 /home/stack/bighfi_spark/ryanbank/HDFWriter.py:54(insert)
        9    0.000    0.000    0.008    0.001 /home/stack/bighfi_spark/ryanbank/HDFWriter.py:30(createGroup)
        9    0.000    0.000    0.007    0.001 /home/stack/bighfi_spark/ryanbank/HDFWriter.py:43(createChunkedDataSet)
        9    0.000    0.000    0.007    0.001 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/attrs.py:79(__setitem__)
        9    0.001    0.000    0.007    0.001 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/attrs.py:94(create)
        1    0.000    0.000    0.005    0.005 /home/stack/anaconda/lib/python2.7/uuid.py:45(<module>)
        1    0.000    0.000    0.004    0.004 /home/stack/anaconda/lib/python2.7/ctypes/util.py:241(find_library)
        1    0.000    0.000    0.004    0.004 /home/stack/anaconda/lib/python2.7/ctypes/util.py:214(_findSoname_ldconfig)
        9    0.000    0.000    0.004    0.000 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/group.py:50(create_dataset)
        1    0.003    0.003    0.003    0.003 {method 'read' of 'file' objects}
        9    0.002    0.000    0.003    0.000 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/dataset.py:44(make_new_dset)
        9    0.003    0.000    0.003    0.000 {method 'rand' of 'mtrand.RandomState' objects}
        1    0.000    0.000    0.001    0.001 /home/stack/anaconda/lib/python2.7/re.py:143(search)
        9    0.000    0.000    0.001    0.000 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/group.py:39(create_group)
        1    0.000    0.000    0.001    0.001 /home/stack/bighfi_spark/ryanbank/HDFWriter.py:16(createFile)
        1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/files.py:221(__init__)
        9    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/uuid.py:579(uuid4)
       36    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/site-packages/numpy/core/fromnumeric.py:1726(product)
       45    0.000    0.000    0.000    0.000 {method 'reduce' of 'numpy.ufunc' objects}
        9    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/dataset.py:260(__init__)
        1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/files.py:69(make_fid)
        1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/re.py:230(_compile)
        1    0.000    0.000    0.000    0.000 {posix.popen}
        9    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/group.py:240(__setitem__)
        1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/sre_compile.py:567(compile)
       54    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/base.py:104(_e)
        9    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/filters.py:77(generate_dcpl)
       13    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/uuid.py:101(__init__)
        1    0.000    0.000    0.000    0.000 {method 'search' of '_sre.SRE_Pattern' objects}
       27    0.000    0.000    0.000    0.000 {h5py.h5t.py_create}
        1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/files.py:308(__repr__)
       18    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/base.py:114(get_lcpl)
        1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/sre_parse.py:706(parse)
      2/1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/sre_parse.py:317(_parse_sub)
      2/1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/sre_parse.py:395(_parse)
        2    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/encodings/__init__.py:71(search_function)
        1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/site-packages/six.py:620(u)
       18    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/base.py:45(guess_dtype)
       20    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/logging/__init__.py:1629(debug)
        1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/sre_compile.py:552(_code)
       27    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/site-packages/numpy/core/numeric.py:394(asarray)
       36    0.000    0.000    0.000    0.000 {numpy.core.multiarray.array}
        1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/ctypes/__init__.py:349(__init__)
        2    0.000    0.000    0.000    0.000 {__import__}
      211    0.000    0.000    0.000    0.000 {isinstance}
      5/1    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/sre_compile.py:64(_compile)
        9    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/ctypes/__init__.py:52(create_string_buffer)
        9    0.000    0.000    0.000    0.000 /home/stack/anaconda/lib/python2.7/site-packages/h5py/_hl/filters.py:211(get_filters)
        9    0.000    0.000    0.000    0.000 {method 'any' of 'numpy.ndarray' objects}



