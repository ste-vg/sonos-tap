const Event = require('./Event').Event;
const Listener = require('./Listener').Listener;

const listener = new Listener();

let currentEvent = null;

listener.onEvent(event => 
{
    currentEvent = new Event(event);
});