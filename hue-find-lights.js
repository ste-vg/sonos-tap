
const hue = require("node-hue-api");
const HueApi = hue.HueApi;

const host = "192.168.0.2";
const username = "ollcM6-Lq4gu26VsXdEZUd-ts5PldIOsVxhdht6K";
const api = new HueApi(host, username);
const lightState = hue.lightState;

var lampBulbs = [];
var count = 4;

const displayResult = (result) => 
{
    lampBulbs = result.lights.filter(lamp => lamp.name.search('Hanging') >= 0).map(lamp => ({id: lamp.id, state: lamp.state, name: lamp.name}));
    console.log('ids', result.lights.filter(lamp => lamp.name.search('Hanging') >= 0).map(lamp => lamp.id));

    startSequence(false);
};

const displayError = (err) => 
{
    console.error(err);
};

var bulbState = (result) => 
{
    console.log(result);
};

const startSequence = (on) => 
{
    count = 4;
    if(on) turnOn()
    else turnOff()
}

const turnOff = () =>
{
    count--;

    const bulb = lampBulbs[count]; 
    const state = lightState.create().transitionInstant().on().brightness(100);

    api.setLightState(Number(bulb.id), state) 
    api.setLightState(Number(bulb.id), state) 
    api.setLightState(Number(bulb.id), state) 

 
    if(count > 0) setTimeout(() => turnOff(), 200);
    else setTimeout(() => startSequence(true), 4000);
}

const turnOn = (bulbs) =>
{
    count--;

    const bulb = lampBulbs[count]; 
    const state = lightState.create().transitionInstant().on().brightness((bulb.state.bri / 255) * 100)
    
    api.setLightState(Number(bulb.id), state) 
    api.setLightState(Number(bulb.id), state) 
    api.setLightState(Number(bulb.id), state) 

    if(count > 0) setTimeout(() => turnOn(), 200);
}


api.lights()
    .then(result => displayResult(result))
    .done();