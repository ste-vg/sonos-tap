const settings = require('./settings.json');
const db = require('./db.json');
const readline = require('readline');

var ListenerModule = function() {};
module.exports = ListenerModule;

class Listener
{
    constructor()
    {
        this.currentCode = "";
        this.codes = db.map(item => item.id);

        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);

        console.log('ready');
        process.stdin.on('keypress', (str, key) => this.onKey(str, key))
    }

    onKey(str, key)
    {   
        if (key && key.ctrl && key.name == 'c') {
            process.stdin.pause();
        }
        else
        {
            this.code += key.name;
            this.checkCode();
        }
    }

    checkCode()
    {
        if(this.code.length >= settings.code_length)
        {
            while(this.code.length > settings.code_length)
            {
                this.code = this.code.substr(1);
            }

            console.log('checking code', this.code)

            let index = this.codes.indexOf(this.code);
            if(index > -1 && this.eventFunc)
            {
                this.eventFunc(db[index]);
            }
        }
    }

    onEvent(func)
    {
        this.eventFunc = func;
    }
}

module.exports.Listener = Listener;