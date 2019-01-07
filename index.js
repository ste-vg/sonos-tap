const MusicEvent = require('./Event').MusicEvent;
const ActionEvent = require('./Event').ActionEvent;
const Listener = require('./Listener').Listener;
const settings = require('./settings.json');

const listener = new Listener();

var currentMusicEvent = null;
var currentActionEvent = null;

state = {
    volume: settings.default_volume
}

listener.onMusicEvent(event => currentMusicEvent = event ? new MusicEvent(event, state) : null);
listener.onActionEvent(event => currentActionEvent = event ? new ActionEvent(event, state) : null);