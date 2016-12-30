#!/bin/bash
export COPY="cp -v -p" 
export DIRECTORY="./with_macro/."
export TARGET="../client-hx"
export SOURCE="ClientTemplate.ods"

# Create a copy of the template file
# Run this ${PYTHON3} include_macro.py ./${SOURCE}
# The new ods file gets created under with_macro. 
# Edit the file under .ods to associate macros with the application. 
# Run install dot sh.
${COPY} ${DIRECTORY}/${SOURCE} ${TARGET}
echo `date`

