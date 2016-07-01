import json

data = {
	'name' : 'ACME',
	'shares' : 100,
	'price' : 542.23
}

with open('myfile.json', 'w') as f:
	json_str = json.dumps(data, f)
	f.write(json_str)

f.close()
