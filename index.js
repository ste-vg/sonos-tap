const Event = require('./Event').Event;
const Listener = require('./Listener').Listener;

const listener = new Listener();

var currentEvent = null;

listener.onEvent(event => 
{
    if(event)
    {
        currentEvent = new Event(event);
    }
    else
    {

    }
});