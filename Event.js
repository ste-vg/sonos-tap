const settings = require('./settings.json');
const Sonos = require('sonos').Sonos;
const hue = require("node-hue-api");
const HueApi = hue.HueApi;
const Lights = require('./Lights').Lights;

Sonos.prototype.getSpotifyConnectInfo = async function () {
    const uri = `http://${this.host}:${this.port}/spotifyzc?action=getInfo`
    return request(uri).then(response => response.data)
  }
  
const sonoses = settings.sonos.map(s => new Sonos(s.ip));



function setAvailabilty(sonos)
{
    console.log('checking ', sonos.host)
    sonos.available = false;
    sonos.getVolume()
        .then(volume => {
            sonos.available = true;
            console.log(sonos.host, 'is available, volume is', volume);
        })
        .catch(error => {
            console.log(sonos.host, 'UNAVAILABLE');
        })
}

function checkAllSonos()
{
    sonoses.map(sonos => setAvailabilty(sonos));
}

function getAvailableSonos()
{
    return [ ...sonoses.filter(sonos => sonos.available) ];
}

setInterval(() => {
    checkAllSonos();
}, 120000);

checkAllSonos();

var EventModule = function() {};
module.exports = EventModule;



class MusicEvent
{
    constructor(musicEvent, state)
    {
        this.state = state;

        this.settings = musicEvent;
        this.order = [];
        this.leader = null;

        this.lights = new Lights(() => this.onLightsReady() )
    }

    onLightsReady()
    {
        this.init()
    }

    init()
    {
        console.log('init');

        this.order = [
            'startLight',
            'stopAll',
            'setGroup',
            'clearCurrentQueue',
            'populateQueue',
            'selectQueue',
            'setPlayMode',
            'selectFirstSong',
            'setVolume',
            'play',
            'completeLight'
        ]
        
        this.next();
    }

    

    next()
    {
        if(this.order.length)
        {
            let func = this.order.shift()
            this[func]();
        }
        else
        {
            console.log('COMPLETE');
        }
    }

    startLight()
    {
        this.lights.onStart();
        this.next();
    }

    stopAll()
    {
        console.log('stopping all')

        Promise.all(getAvailableSonos().map(s => s.stop()))
            .then(() => this.next())
            .catch(err => {
                console.log(err)
                this.next();
            }) 
    }

    clearGroups()
    {
        console.log('clearing all groups')

        Promise.all(getAvailableSonos().map(s => s.leaveGroup()))
            .then(result => this.next())
            .catch(err => this.onError(err)) 
    }

    // getAllGroups()
    // {
    //     Promise.all(getAvailableSonos().map(s => s.getAllGroups()))
    //         .then(result => this.next())
    //         .catch(err => console.log(err)) 
    // }

    // getZoneInfo()
    // {
        
    //     Promise.all(getAvailableSonos().map(s => s.getZoneInfo()))
    //         .then(result => this.next())
    //         .catch(err => console.log(err)) 
    // }

    setGroup()
    {
        console.log('setting group');

        let s = getAvailableSonos();
        if(s.length > 1)
        {
            this.leader = s.shift();

            this.leader.getName()
                .then(name => {
                    console.log(`grouping all sonos to ${name}...`);
                    Promise.all(s.map(s => {
                        console.log(`grouping ${s.host} to ${this.leader.host}`)
                        return s.joinGroup(name).catch(err => console.log(err));
                    }))
                        .then(success => this.next())
                        .catch(err => this.onError(err)) 
                })
                .catch(err => this.onError(err)) 
        }
        else
        {
            if(s.length)
            {
                this.leader = s[0];
                this.next()
            }
            else console.log('no sonos available');
        }
    }

    clearCurrentQueue()
    {
        console.log('clearing queue')

        this.leader.flush()
            .then(result => this.next())
            .catch(err => this.onError(err)) 
    }
    
    selectQueue()
    {
        console.log('selecting queue')

        this.leader.selectQueue()
            .then(result => this.next())
            .catch(err => this.onError(err)) 
    }
 
    populateQueue()
    {
        console.log('populating queue')

        this.leader.queue(this.settings.uri)
            .then(result => this.next())
            .catch(err => this.onError(err)) 
    }


    setPlayMode()
    {
        console.log('setting play mode to', this.settings.play_mode);
        this.leader.setPlayMode(this.settings.play_mode)
            .then(() => this.next())
            .catch(err => this.onError(err))
    }

    setVolume()
    {
        let loudness = this.state.volume;
        console.log('setting volume to', settings.volumes[loudness])
        Promise.all(getAvailableSonos().map(s => s.setVolume(settings.volumes[loudness][s.host])))
            .then(success => this.next())
            .catch(err => this.onError(err))
    }

    selectFirstSong()
    {
        console.log(`selected track 1`);

        this.leader.selectTrack(this.settings.play_mode === 'SHUFFLE' ? 2 : 1)
            .then(success => this.next())
            .catch(err => this.onError(err))
    }

    play()
    {
        console.log(`--- Playing '${this.settings.name}' on ${this.leader.host}`)
        setTimeout(() => 
        {
            this.leader.play()
                .then(success => this.next())
                .catch(err => this.onError(err))
        }, 100);
    }

    completeLight()
    {
        this.lights.onEnd();
        this.next();
    }

    onError(err)
    {
        this.lights.onError();
        console.log('Error occurred %j', err)
    }
}

class ActionEvent
{
    constructor(eventSettings, state)
    {
        this.state = state;
        this.settings = eventSettings;
        console.log('new action event:', this.settings);
        this.lights = new Lights(() => this.parseEvent() )
        //this.parseEvent();
    }

    parseEvent()
    {
        this.lights.onStart();
        
        switch(this.settings.action)
        {
            case 'KILL_APP':
                this.killApp();
                break;
            case 'VOLUME_LOW':
                this.setVolume('low');
                break;
            case 'VOLUME_MEDIUM':
                this.setVolume('medium');
                break;
            case 'VOLUME_HIGH':
                this.setVolume('high');
                break;
            case 'TOGGLE_PLAYBACK':
                this.togglePlayback();
                break;
        }
    }

    killApp()
    {
        process.exit(22);
    }

    // setVolume(volume)
    // {
    //     this.state.volume = volume;
    //     console.log('setting volume to', settings.volumes[volume])

    //     livingRoomSonos.setVolume(settings.volumes[volume].living_room)
    //         .then(() => 
    //         {
    //             kitchenSonos.setVolume(settings.volumes[volume].kitchen)
    //                 .then(success => null)
    //                 .catch(err => this.onError(err))
    //         })
    //         .catch(err => this.onError(err))
    // }

    setVolume(volume)
    {
        this.state.volume = volume;
        console.log('setting volume to', settings.volumes[this.state.volume])
        Promise.all(getAvailableSonos().map(s => s.setVolume(settings.volumes[this.state.volume][s.host])))
            .then(success => null)
            .catch(err => this.onError(err))
    }

    togglePlayback()
    {
        const all = getAvailableSonos();
        if(all.length)
        {
            all[0].togglePlayback();
        }
        
    }

    onError(err)
    {
        console.log('Error occurred %j', err)
    }
}

module.exports.MusicEvent = MusicEvent;
module.exports.ActionEvent = ActionEvent;