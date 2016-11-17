import zipfile
import shutil
import os
import sys

print("Delete and create directory with_macro")
shutil.rmtree("with_macro",True)
os.mkdir("with_macro")

filename = "with_macro/"+sys.argv[1]
print("Open file " + sys.argv[1])
shutil.copyfile(sys.argv[1],filename)

doc = zipfile.ZipFile(filename,'a')
doc.write("ods_python_script.py", "Scripts/python/ods_python_script.py")
# Copy the certificate bundle.
#doc.write("ca_bundle.pem.bak", "certificates/ca_bundle.pem")
manifest = []
for line in doc.open('META-INF/manifest.xml'):
  if '</manifest:manifest>' in line.decode('utf-8'):
    for path in ['Scripts/','Scripts/python/','Scripts/python/ods_python_script.py']:
      manifest.append(' <manifest:file-entry manifest:media-type="application/binary" manifest:full-path="%s"/>' % path)
  manifest.append(line.decode('utf-8'))


# for line in doc.open('META-INF/manifest.xml'):
#   if '</manifest:manifest>' in line.decode('utf-8'):
#     for path in ['certificates']:
#       manifest.append(' <manifest:file-entry manifest:media-type="text" manifest:full-path="%s"/>' % path)
#   manifest.append(line.decode('utf-8'))


doc.writestr('META-INF/manifest.xml', ''.join(manifest))
doc.close()
print("File created: "+filename)