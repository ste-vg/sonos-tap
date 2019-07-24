const settings = require('./settings.json');
//const db = require('./db.json');
const readline = require('readline');
const fs = require("fs");

const Lights = require('./Lights').Lights;

var ListenerModule = function() {};
module.exports = ListenerModule;

class Listener
{
    constructor()
    {
        this.currentCode = "";
        this.musicEventFunc = null;
        this.actionsEventFunc = null;
        //this.codes = db.map(item => item.id);

        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);

        this.lights = new Lights(() => this.lights.onStartUp() )
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

            this.checkJSON("db.json", this.musicEventFunc);
            this.checkJSON("actions.json", this.actionEventFunc);
        }
    }

    checkJSON(file, func)
    {
        var items = fs.readFileSync(file);
        items = JSON.parse(items);
        let codes = items.map(item => item.id);

        let index = codes.indexOf(this.code);
        if(index > -1 && func)
        {
            func(items[index]);
        }
    }

    onMusicEvent(func)
    {
        this.musicEventFunc = func;
    }
    
    onActionEvent(func)
    {
        this.actionEventFunc = func;
    }
}

module.exports.Listener = Listener;