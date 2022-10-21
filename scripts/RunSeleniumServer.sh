#!/bin/bash
# Run this script for tests.
export JAVA=java
export SELENIUM_DIR=selenium-server
export SELENIUM_VERSION=2.53.0
export SELENIUM_PROG_NAME=selenium-server-standalone
export PS=`ps -ef`
echo "Run the selenium server ${SELENIUM_DIR}"

${PS} | grep ${SELENIUM_PROG_NAME} | grep -v grep | awk "{print $2}"

${JAVA} -jar "./${SELENIUM_DIR}/selenium-server-standalone-${SELENIUM_VERSION}.jar"
