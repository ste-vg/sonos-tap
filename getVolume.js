const Sonos = require('sonos').Sonos
const sonos = new Sonos(process.env.SONOS_HOST || '192.168.86.25')

sonos.getVolume()
            .then(volume => console.log(volume))
            .catch(err => this.onError(err))