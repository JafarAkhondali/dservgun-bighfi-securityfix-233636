module Paths_mpi_test_client (
    version,
    getBinDir, getLibDir, getDataDir, getLibexecDir,
    getDataFileName, getSysconfDir
  ) where

import qualified Control.Exception as Exception
import Data.Version (Version(..))
import System.Environment (getEnv)
import Prelude

catchIO :: IO a -> (Exception.IOException -> IO a) -> IO a
catchIO = Exception.catch

version :: Version
version = Version [0,1,0,0] []
bindir, libdir, datadir, libexecdir, sysconfdir :: FilePath

bindir     = "/home/stack/.cabal/bin"
libdir     = "/home/stack/.cabal/lib/x86_64-linux-ghc-7.8.4/mpi-test-client-0.1.0.0"
datadir    = "/home/stack/.cabal/share/x86_64-linux-ghc-7.8.4/mpi-test-client-0.1.0.0"
libexecdir = "/home/stack/.cabal/libexec"
sysconfdir = "/home/stack/.cabal/etc"

getBinDir, getLibDir, getDataDir, getLibexecDir, getSysconfDir :: IO FilePath
getBinDir = catchIO (getEnv "mpi_test_client_bindir") (\_ -> return bindir)
getLibDir = catchIO (getEnv "mpi_test_client_libdir") (\_ -> return libdir)
getDataDir = catchIO (getEnv "mpi_test_client_datadir") (\_ -> return datadir)
getLibexecDir = catchIO (getEnv "mpi_test_client_libexecdir") (\_ -> return libexecdir)
getSysconfDir = catchIO (getEnv "mpi_test_client_sysconfdir") (\_ -> return sysconfdir)

getDataFileName :: FilePath -> IO FilePath
getDataFileName name = do
  dir <- getDataDir
  return (dir ++ "/" ++ name)
