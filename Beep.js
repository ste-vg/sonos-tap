const five = require("johnny-five");
const Tessel = require("tessel-io");

var BeepModule = function() {};
module.exports = BeepModule;

class Beep
{
    constructor()
    {
        this.ready = false;

        this.board = new five.Board({
            io: new Tessel()
        });

        this.board.on("ready", () => 
        {
            this.ready = true;
            this.piezo = new five.Piezo(0);
          
            this.board.repl.inject({
              piezo: this.piezo
            });

            this.readyBeep();
        })
    }

    readyBeep()
    {
        if(this.ready)
        {
            this.piezo.play({
                song: "C - B - A",
                tempo: 200
            });
        }
    }

    successBeep()
    { 
        if(this.ready)
        {
            this.piezo.play({
                song: "A - A",
                tempo: 200
            });
        }
    }
    
    errorBeep()
    { 
        if(this.ready)
        {
            this.piezo.play({
                song: "A - E E",
                tempo: 200
            });
        }
    }
}

module.exports.Beep = Beep;