const settings = require('./settings.json');
const Sonos = require('sonos').Sonos
const kitchenSonos = new Sonos(process.env.SONOS_HOST || settings.sonos.kitchen.ip)
const livingRoomSonos = new Sonos(process.env.SONOS_HOST || settings.sonos.livingRoom.ip)

var EventModule = function() {};
module.exports = EventModule;

class MusicEvent
{
    constructor(musicEvent, state)
    {
        this.state = state;
        this.settings = musicEvent;
        console.log('new music event:', this.settings);

        this.stopAll();
    }

    stopAll()
    {
        console.log('stopping all')
        livingRoomSonos.stop()
            .then(() => {
                kitchenSonos.stop()
                    .then(() => this.setGroup())
                    .catch(err => this.onError(err)) 
            })
            .catch(err => this.onError(err)) 
    }

    setGroup()
    {
        console.log('setting group');

        const deviceToJoin = settings.sonos.kitchen.name
        livingRoomSonos.joinGroup(deviceToJoin)
            .then(success => {
                console.log('Joining %s is a %s', deviceToJoin, (success ? 'Success' : 'Failure'));
                this.clearCurrentQueue();
            })
            .catch(err => this.onError(err), this.clearCurrentQueue()) 
    }

    clearCurrentQueue()
    {
        console.log('clearing queue')
        livingRoomSonos.flush()
            .then(() => this.setPlayMode(this.settings.play_mode))
            .catch(err => this.onError(err)) 
    }


    setPlayMode(playMode)
    {
        console.log('setting play mode to', playMode);
        livingRoomSonos.setPlayMode(playMode)
            .then(() => this.setVolume())
            .catch(err => this.onError(err))
    }

    setVolume()
    {
        let loudness = this.state.volume;
        console.log('setting volume to', settings.volumes[loudness])
        livingRoomSonos.setVolume(settings.volumes[loudness].living_room)
            .then(() => 
            {
                kitchenSonos.setVolume(settings.volumes[loudness].kitchen)
                    .then(success => this.play())
                    .catch(err => this.onError(err))
            })
            .catch(err => this.onError(err))
    }

    play()
    {
        console.log('playing', this.settings.name)
        livingRoomSonos.play(this.settings.uri)
            .then(success => {console.log('Success')})
            .catch(err => this.onError(err))
    }

    onError(err)
    {
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
        this.parseEvent();
    }

    parseEvent()
    {
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
        }
    }

    killApp()
    {
        process.exit(22);
    }

    setVolume(volume)
    {
        this.state.volume = volume;
        console.log('setting volume to', settings.volumes[volume])

        livingRoomSonos.setVolume(settings.volumes[volume].living_room)
            .then(() => 
            {
                kitchenSonos.setVolume(settings.volumes[volume].kitchen)
                    .then(success => null)
                    .catch(err => this.onError(err))
            })
            .catch(err => this.onError(err))
    }

    onError(err)
    {
        console.log('Error occurred %j', err)
    }
}

module.exports.MusicEvent = MusicEvent;
module.exports.ActionEvent = ActionEvent;