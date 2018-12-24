const Sonos = require('sonos').Sonos
const kitchenSonos = new Sonos(process.env.SONOS_HOST || '192.168.86.25')
const livingRoomSonos = new Sonos(process.env.SONOS_HOST || '192.168.86.24')
const settings = require('./settings.json');

var EventModule = function() {};
module.exports = EventModule;

class Event
{
    constructor(eventSettings)
    {
        this.settings = eventSettings;
        console.log('new event:', this.settings);

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

        const deviceToJoin = 'Living Room'
        kitchenSonos.joinGroup(deviceToJoin)
            .then(success => {
                console.log('Joining %s is a %s', deviceToJoin, (success ? 'Success' : 'Failure'));
                this.clearCurrentQueue();
            })
            .catch(err => this.onError(err)) 
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
        console.log('setting volume to', settings.default_volume)
        livingRoomSonos.setVolume(settings.default_volume_living_room)
            .then(() => 
            {
                kitchenSonos.setVolume(settings.default_volume_kitchen)
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

module.exports.Event = Event;