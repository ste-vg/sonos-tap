var HueApi = require("node-hue-api").HueApi;

var displayStatus = function(status) {
    console.log(JSON.stringify(status.state, null, 2));
};

var host = "192.168.0.2",
    username = "ollcM6-Lq4gu26VsXdEZUd-ts5PldIOsVxhdht6K",
    api = new HueApi(host, username);

// Obtain the Status of Light '5'

// --------------------------
// Using a promise
api.lightStatus(5)
    .then(displayStatus)
    .done();
