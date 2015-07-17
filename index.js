var rest = require('restler');
var crypto = require('crypto');

var ADD_ENDPOINT = "https://incandescent.xyz/api/add/";
var GET_ENDPOINT = "https://incandescent.xyz/api/get/";

module.exports = {
	client: function(uid, apiKey) {
		this.uid = uid;
		this.apiKey = apiKey;
		this.requestFrontMatter = {};

		this.addImageUrl = function(imageUrl) {
			if(typeof this.requestFrontMatter['images'] === 'undefined') {
				this.requestFrontMatter['images'] = []; 
			}
			
			this.requestFrontMatter['images'].push(imageUrl);
		};

		this.assemble = function(secondsToExpiration) {
			var unixNow = Math.floor(new Date() / 1000);
			
			secondsToExpiration = secondsToExpiration || 1000;

			if(secondsToExpiration > 1200) {
				throw new Error("secondsToExpiration can be at most 1200, " + String(secondsToExpiration) + " > 1200");
			} 

			var expiresSeconds = unixNow + secondsToExpiration;

			var stringToSign = String(this.uid) + "\n" + String(expiresSeconds);

			var signature = encodeURIComponent(crypto.createHmac('sha1', this.apiKey).update(stringToSign).digest('base64'));

			this.requestFrontMatter['uid'] = uid;
			this.requestFrontMatter['expires'] = expiresSeconds;
			this.requestFrontMatter['signature'] = signature;
		};

		this.sendRequest = function(onProjectCreation) {
			rest.postJson(ADD_ENDPOINT, this.requestFrontMatter)
			.on('complete', function(data, response) {
				if (data.status == 201) {
					onProjectCreation(data["project_id"]);
				} else {
					handleErrors(data);
				}
			});
			this.requestFrontMatter['images'] = null;
		};

		this.getResults = function(projectId, onResults) {
			var self = this;

			this.requestFrontMatter['project_id'] = projectId;

			rest.postJson(GET_ENDPOINT, this.requestFrontMatter)
			.on('complete', function(data, response) {
				// if there's no status message, then we have a successful query
				if (typeof data.status === 'undefined') {
					onResults(data);
				} else if (data.status == 710) {
					// images aren't ready yet, try again in 5 seconds
					setTimeout(function() {
						self.getResults(projectId, onResults);
					}, 5000);
				} else if (data.status == 755) {
					// search complete, no results
					onResults({});
				} else {
					handleErrors(data);
				}
			});
		}

		var handleErrors = function(response) {
			if (response.status == 400) {
				throw new Error("Malformed Request - missing some required authentication parameter, raw response: " + JSON.stringify(response)); 
			} else if (response.status == 701) {
				// signature expired
				throw new Error("Signature Expired - sendRequest() called too long after assemble(), raw response: " + JSON.stringify(response));
			} else if (response.status == 702) {
				// signature life is too long
				throw new Error("Signature Life Is Too Long - secondsToExpiration passed to assemble() was greater than 1200, raw reponse: " + JSON.stringify(response));
			} else if (response.status == 703) {
				// invalid signature
				throw new Error("Signature Is Invalid - apiKey is invalid, raw response: " + JSON.stringify(response));
			} else if (response.status == 704) {
				// missing or invalid UID
				throw new Error("Missing Or Invalid UID - uid passed to constructor wasn't recognized as valid, raw response: " + JSON.stringify(response));
			} else {
				throw new Error("Unknown or unrecognized request error, raw response: " + JSON.stringify(response));
			}
		}
	} 



}
