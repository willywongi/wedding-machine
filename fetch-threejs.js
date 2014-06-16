var http = require('http'),
	fs = require('fs'),
	url = "http://threejs.org/build/three.min.js",
	localPath = "static/three.min.js";
	
http.get(url, function(res) {
	var responseData = '';
	console.log('Connected to server for ' + url);
	res.on('data', function(chunk) {
		responseData += chunk;
	});
	res.on('end', function() {
		fs.writeFile(localPath, responseData, function(err) {
			if (err) throw err;
			console.log('Three.js fetched from ' + url);
		});
	});
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
