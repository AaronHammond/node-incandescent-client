# node-incandescent-client
A client for the Incadescent (http://incandescent.xyz/) reverse image search API

## Installation
npm install node-incandescent-client

## Usage
Please see `example.js` for a complete flow example.

	var incan_client = require("node-incandescent-client").client;

	var client = new incan_client(YOUR_UID, YOUR_API_KEY);

	client.addImageUrl('http://incandescent.xyz/wp-content/themes/twentyfifteen/logo.png');

	client.assemble();

	client.sendRequest(function(projectId) { 
		console.log(projectId);

		client.getResults(projectId, function(data) {
			console.log(data);
		})
	});
	
### new client(uid, apiKey)
Creates a new client for the Incandescent API, using the passed UID and API key to sign requests.

### client.addImageUrl(imageUrl)
Adds an image URL to the current request for lookup. Note that you can add several image URLs for lookup in the same request

### client.assemble(secondsToExpiration)
Assembles the request for lookup. Note that this is called after (one or more) calls to `client.addImageUrl`, and `client.assemble` generates the required authentication front-matter for the request. `secondsToExpiration` is an _optional_ Number parameter between 0 and 1200 which specifies the maximum time between the  `client.assemble` call and the `client.sendRequest` call.

### client.sendRequest(onProjectCreation)
Sends the `client.assemble`'d request to the Incandescent API. Consumes a callback, `onProjectCreation`, which will be called with the projectId returned by Incandsecent for the search request.

### client.getResults(projectId, onResults) 
Using the passed `projectId` (presumably generated using a call to `client.sendRequest`), query the Incandescent result server every few seconds until the search is complete, passing the raw response data (according to the format specified by http://incandescent.xyz/docs/) to the `onResults` callback.
