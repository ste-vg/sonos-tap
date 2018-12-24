const Event = require('./Event').Event;
const Listener = require('./Listener').Listener;
//const Beep = require('./Beep').Beep;

const listener = new Listener();
//const beep = new Beep();

let currentEvent = null;

listener.onEvent(event => 
{
    if(event)
    {
       // beep.successBeep();
        currentEvent = new Event(event);
    }
    else
    {
      //  beep.errorBeep();
    }
});