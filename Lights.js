

const hue = require("node-hue-api");
const HueApi = hue.HueApi;

const host = "192.168.0.2";
const username = "ollcM6-Lq4gu26VsXdEZUd-ts5PldIOsVxhdht6K";

var EventModule = function() {};
module.exports = EventModule;

class Lights 
{
    constructor(readyCallback)
    {
        this.states = {};
        this.bulbs = [1,6,3,5,4];
        this.count = {};

        this.api = new HueApi(host, username);
        this.lightState = hue.lightState;

        this.getStates(readyCallback);
    }

    getStates(cb)
    {
        this.api.lights()
            .then(result => {
                result.lights.map(bulb => this.states[bulb.id] = bulb.state);
                cb();
            })
            .done();
    }

    flashStart(bulb, speed)
    {
        const state = this.lightState.create().transitionInstant().on().brightness(100);
        
        this.api.setLightState(bulb, state) 
        this.api.setLightState(bulb, state) 

        setTimeout(() => this.flashEnd(bulb, speed), speed);
    }
    
    flashEnd(bulb, speed)
    {
        const oldState = this.states[bulb];
        const onState = this.lightState.create().transitionInstant().on().brightness((oldState.bri / 255) * 100)
        const offState = this.lightState.create().transitionInstant().off().brightness((oldState.bri / 255) * 100)
        const newState = oldState.on ? onState : offState;
        
        this.api.setLightState(bulb, newState); 
        this.api.setLightState(bulb, newState); 

        this.count[bulb]--;

        if(this.count[bulb] > 0) setTimeout(() => this.flashStart(bulb, speed), speed);
    }

    startSequence(count, bulb, speed)
    {
        this.count[bulb] = count;
        this.flashStart(bulb, speed);
    }

    onStart() { this.startSequence(1, 5, 200) }
    onEnd() { this.startSequence(2, 4, 100) }
    onError() { this.startSequence(3, 4, 500);  }

    onStartUp() 
    {
        this.count.startup = this.bulbs.length;
        this.startUpOn()
    }

    startUpOn()
    {
        this.count.startup--;
        const bulb = this.bulbs[this.count.startup]; 
        const state = this.lightState.create().transitionInstant().on().brightness(100);
        this.api.setLightState(bulb, state);
        this.api.setLightState(bulb, state);
        if(this.count.startup > 0)
        {
            setTimeout(() => this.startUpOn(), 100);
        }
        else
        {
            this.count.startup = this.bulbs.length;
            setTimeout(() => this.startUpOff(), 100);
        }
    }

    startUpOff()
    {
        this.count.startup--;

        const bulb = this.bulbs[this.count.startup]; 
        const oldState = this.states[bulb];
        const onState = oldState.on ? 'on' : 'off'
        const state = this.lightState.create().transitionInstant()[onState]().brightness((oldState.bri / 255) * 100);

        this.api.setLightState(bulb, state) 
        this.api.setLightState(bulb, state) 
    
        if(this.count.startup > 0) setTimeout(() => this.startUpOff(), 200);
    }
}


module.exports.Lights = Lights;