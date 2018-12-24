const Sonos = require('sonos').Sonos
const sonos = new Sonos(process.env.SONOS_HOST || '192.168.86.25')

var EventModule = function() {};
module.exports = EventModule;

class Event
{
    constructor(eventSettings)
    {
        this.settings = eventSettings;
        console.log('new event:', this.settings);

        this.clearCurrentQueue();
    }

    clearCurrentQueue()
    {
        console.log('clearing queue')
        sonos.flush()
            .then(success => 
            {
                if(this.settings.play_mode) this.setPlayMode(this.settings.play_mode);
                else this.play();
            })
            .catch(err => this.onError(err)) 
    }

    setPlayMode(playMode)
    {
        console.log('setting play mode to', playMode)
        sonos.setPlayMode(playMode)
            .then(() => this.play())
            .catch(err => this.onError(err))
    }

    play()
    {
        console.log('playing', this.settings.name)
        sonos.play(this.settings.uri)
            .then(success => {console.log('Success')})
            .catch(err => this.onError(err))
    }

    onError(err)
    {
        console.log('Error occurred %j', err)
    }
}

module.exports.Event = Event;