var HueApi = require("node-hue-api").HueApi;

var host = "192.168.0.2",
    userDescription = "Sonos tap app";

var displayUserResult = function(result) {
    console.log("Created user: " + JSON.stringify(result));
};

var displayError = function(err) {
    console.log(err);
};

var hue = new HueApi();

// --------------------------
// Using a promise
hue.registerUser(host, userDescription)
    .then(displayUserResult)
    .fail(displayError)
    .done();
