'use strict;'


const events = require('events'),
    eventEmitter = new events.EventEmitter();

var t = function (ts, opts) {
    this.ts = Array.isArray(ts) ? ts : [];

    this.opts = Object.assign({
        duration: 1000
    }, opts)

    this.opts.duration = Number(this.opts.duration) > 100 ? this.opts.duration : 1000;

    this.makeTS().tick();

    return eventEmitter;
}



t.prototype = {

    runTS: function () {
        let self = this;

        self.ts.forEach(function (ts) {

            let arguments = [].concat(ts.arguments);

            arguments.push(function cb() {
                ts.isBusy = false;
            });

            // console.log(self);

            if (self.compareTS(ts.match)) {

                if ((ts.repeat == 0 || ts.repeats < ts.repeat) && (!ts.wait || !ts.isBusy)) {

                    let o = {
                        match : ts.match,
                        currentTime : self.tt,
                        repeat : ts.repeat,
                        repeated : ts.repeated,
                        isBusy : ts.isBusy
                    }

                    //event emitter
                    eventEmitter.emit('tick-matched', o);

                    ts.isBusy = true;
                    ts.repeats++;
                    ts.func.apply(ts.context, arguments);
                }

            } else if(ts.isBusy) {
                //reset values...
                ts.isBusy = false;
                ts.repeats = 0;

                eventEmitter.emit('tick-cleared', null);
            }

        }, this);

    },
    compareTS: function (t) {
        let self = this;

        var d = new Date(),
            tt = {
                h: d.getHours(),
                m: d.getMinutes(),
                s: d.getSeconds()
            }

        self.tt = tt;

        let calc, tm, is;

        for (var i in t) {
            // console.log(i, t[i]);

            calc = 1;

            if (t[i].toString() === '0' && tt[i].toString() === '0') {
                calc = 0;
            } else if (/\*[0-9]*/.test(t[i])) {
                tm = /[0-9]/.test(t[i]) ? Number(t[i].replace(/\*/, '')) : '*';
                calc = tt[i] % tm;
            } else {
                tt[i] = pad(tt[i]);
                calc = t[i] == tt[i] ? 0 : 1;
            }


            is = ((calc === 0) || t[i] == '*') ? true : false

            // console.log(i, t[i], tm, tt[i],  calc, is);

            if (!is) {
                return false;
            }
        }

        return true;

    },

    tick: function () {
        let self = this;

        var timeout = setTimeout(function () {

            //emit event in case there are listeners
            eventEmitter.emit('tick', null);

            //runTS
            self.runTS();
            //clear timeout
            clearTimeout(timeout);
            //tick again
            self.tick();

        }, self.opts.duration);

        return self;

    },
    makeTS: function () {
        let self = this;

        self.ts.forEach(function (o, i) {

            if (!o.hasOwnProperty('match')) {
                throw new Error('\'match\' option required!')
            }

            if (!o.hasOwnProperty('func') || typeof o.func !== 'function') {
                throw new Error('\'function\' option must be a function!')
            }

            o = Object.assign({
                repeat: 0,
                wait: true,
                context: null,
                arguments: [],
                duration: 1000
            }, o, {
                isBusy: false,
                repeats: 0,
            });


            if (typeof o.context !== 'object') {
                throw new Error('\'context\' option must be an object!')
            }

            if (!Array.isArray(o.arguments)) {
                throw new Error('\'arguments\' option must be an array!')
            }

            if (typeof o.repeat !== 'number') {
                o.repeat = 1;
            }



            if (typeof o.match == 'string') {
                let a = o.match.split(':');
                o.match = {
                    h: a[0] || 0,
                    m: a[1] || 0,
                    s: a[2] || 0,
                }
            } else if (typeof o.match == 'object') {
                o.match = {
                    h: o.match.h ? Number(o.match.h) : 0,
                    m: o.match.m ? Number(o.match.m) : 0,
                    s: o.match.s ? Number(o.match.s) : 0,
                }
            } else {
                throw new Error('\'match\' option must be a string or object.')
            }

            // console.log(i);
            self.ts[i] = o;

        });

        return self;
    }
}


function pad(number) {
    if (number <= 10) {
        number = ("0" + number).slice(-2);
    }
    return number;
}

module.exports = function (ts, opts) {
    return new t(ts, opts);
};