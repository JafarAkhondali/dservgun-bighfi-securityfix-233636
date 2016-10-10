#!/bin/bash
export COPY="cp -v -p" 
export DIRECTORY="."
export SOURCE="ods_python_script.py"
export TARGET="/usr/lib/libreoffice/share/Scripts/python/"
${COPY} ${DIRECTORY}/${SOURCE} ${TARGET}
echo `date`

${COPY} ${DIRECTORY}/ca_bundle.pem ${TARGET}