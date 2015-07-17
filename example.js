var incan_client = require('./index.js').client;

var YOUR_UID = 0;
var YOUR_API_KEY = "";
var client = new incan_client(YOUR_UID, YOUR_API_KEY);

client.addImageUrl('http://incandescent.xyz/wp-content/themes/twentyfifteen/logo.png');

client.assemble();

client.sendRequest(function(projectId) { 
	console.log(projectId);

	client.getResults(projectId, function(data) {
		console.log(data);
	})
});
