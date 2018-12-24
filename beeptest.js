const Beep = require('./Beep').Beep;
const beep = new Beep();

setTimeout(() => {beep.successBeep()}, 3000);
setTimeout(() => {beep.errorBeep()}, 5000);