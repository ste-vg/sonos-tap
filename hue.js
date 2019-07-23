
const hue = require("node-hue-api");
const HueApi = hue.HueApi;

const host = "192.168.0.2";
const username = "ollcM6-Lq4gu26VsXdEZUd-ts5PldIOsVxhdht6K";
const api = new HueApi(host, username);
const lightState = hue.lightState;


const state = lightState.create().alertShort();

api.setLightState(4, state) 
    .then(() => console.log)
    .fail(() => console.error)
    .done()
 
const order = [1, 6, 3, 5, 4]