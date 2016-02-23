#!/usr/bin/env bash

############################################
# A simple script to setup a local cluster
############################################
## Basic error handling
set -o errexit
set -o pipefail
set -o nounset
set -o xtrace
## Set some magic variables
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
USER=/home/stack
SPARK_VERSION=1.4.1
SPARK_HOME=${USER}/apache-spark/spark-${SPARK_VERSION}


# Common environment variables

####Master
${SPARK_HOME}/bin/spark-class org.apache.spark.deploy.master.Master \
-h 127.0.0.1 -p 7077 --webui-port 8181 & 

${SPARK_HOME}/bin/spark-class org.apache.spark.deploy.worker.Worker \
-c 1
-m 1g \
spark://127.0.0.1:7077 &

${SPARK_HOME}/bin/spark-class org.apache.spark.deploy.worker.Worker \
-c 1
-m 1g \
spark://127.0.0.1:7077 &
