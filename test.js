var tickers = [{
    match: "*:*2:*",
    func: function (a, b, cb) {

        console.log(this.start + a + b);

        setTimeout(cb, 1000);
    },
    context: {
        start: 'This'
    },
    arguments: [' ticker function', ' is amazing...'],
    repeat: 3,
    wait: true
}]

var opts = {
    duration: 1000
}


//start ticker
var ts = require('.')(tickers, opts);

ts.on('tick', function () {
    // console.log('Tick-Tock');
})

ts.on('tick-matched', function (data) {
    console.log('Tick Matched');
    console.log(data);
})

ts.on('tick-cleared', function () {
    console.log('Delay Cleared');
})