
# Let the function tick!
*This module was written for use in an IOT project.*

Have you ever wanted to call a particular method or run som code periodically, say every minute? 

The simplest solution is to wrap that function within a **setInterval** call and indicate your duration. While this works, you soon realize that you no longer have *fine control* over how the function is called as your code gets into a *zombie-loop*. Assume that setInterval duration is set to one second, what happens if your function takes 30 seconds to finish?

## The Solution

OK, first install ```npm install --save function-tick```

```javascript

var tickers = [
    {
        match: "*:*:*",
        func: function (a, b, cb) {

            console.log(this.start + a + b);

            setTimeout(cb, 5000);
        },
        context: { start: 'This' },
        arguments: [' ticker function', ' is amazing...'],
        repeat: 3,
        wait : true
    }
]

var opts = {
    duration :  1000
}


//start ticker
require('.')(tickers, opts );

```

This outputs : 

```
This ticker function is amazing...
This ticker function is amazing...
This ticker function is amazing...
```

## API

### ```ticker(tickers, [options] )```

**options** : accepts the following properties:
- **duration** : how long should each tick last (in microseconds)? Defaults to 1 second (1000)

**tickers** : an array that defines all your function tickers. Each ticker should be formatted as follows...

```
{
    match: "*:*:*",
    func: function (cb) {},
    context: null,
    arguments: [],
    repeat: 3,
    wait : true
}
```

## Understanding tickers
To best explain function tickers, we will use an example use case.

### Example Case:
**We are using IOT to capture a seed germination timelapse video.** 

Here is how we set up our tickers...

1) ####Because this process takes days, we want to take just a few shots after a minute or so. We need an instruction like ```"every two minutes..."``` take a shot. **Enter ```match.```**

### **match:**
This is a *cron-ish* pattern that is matched against current time **HH:mm:ss**

While this pattern matches current time, then the function **func** will be called.

### *match syntax*
Match has a *cron-ish* syntax formatted in "HH:mm:ss" format.

**"*"** - Means "every". Therefore "*5" means every 5(th). See ```match``` statements below: 

- **"\*5"** - every 5(th)
- **"\*5:10:00"** - every 5th hour at exactly the 30th minute
- **"\*5:\*10:00"** - every 10th minute of every 5th hour
- **"5:\*10:00"** - every 10th minute of 0500 hrs
- **"\*:\*:\*"** - every other second

**"\*"** uses *modulus* to match patterns & time. For example **"\*:\*5:\*"** will match on every *second of every fifth minute* of every *hour* i.e. It will match **10:05:00, 10:05:30, 10:05:31, 10:10:23, 21:15:00, 21:20:34**. 

**"n"** - matches exact numeric value. 

2) ####Once the **match pattern** is accurately matched against current time **HH:mm:ss**, then we need to perform a certain task. We need to call a function. **Enter ```func.```**

### **func:**

This function will be called and executed. This means that, if the tick duration is one second, then a pattern like **"\*:\*5:\*"** will result in 60 calls every 5th minute *(mm % 5 == 0)*.

3) ####The function (```func```) is called repeatedly (at every tick) while the **match pattern** matches **current time**. But we want to take only three shots! **Enter ```repeat.```**

### **repeat:**
This parameter dictates how many times **func** is called while the **match pattern** matches *current time*.

**repeat = 3** means that **func** will be called no more than 3 times. 

4) ####But our function is taking an unpredictable time to complete. We do not want to call the ```func``` again until processing is finished! **Enter ```wait & function callback:```**

When **wait** is set to true, then **func** will be called and all subsequent calls suspended till processing is over. We then use the **callback function** to indicate that processing is over.

Every time **func** is run a the **context** is set and **arguments** passed. The very last argument passed is the **function callback**, which, you should call *asynchronously* whenever processing ends. 

If you do not want this level of control, or if your functions are *synchronous*, please set **wait** to **```false```**.

5) ####But wait, what if we want our ticker to run in durations less than 1 second (the default). **Enter ```tick duration.```**

You can further tweak your ticker by changing the **tick duration.** The default value is *1000ms* (1 second). This value is set via the [options](#API)  argument.

## Events
There are several events to watch. These include:

### ```.on('tick', fn)```
Emitted on each *Tick*.

### ```.on('tick-matched', fn)```
Emitted every time the **match pattern** matches *current time*. You can inspect the *data* argument (object) emitted.

### ```.on('tick-cleared', fn)```
Emitted every time a function that has as many times as the **repeat** attribute indicates and thus stopped from running again is cleared to run again.

### Sample Events Usage...

```javascript 

var ts = require('.')(tickers, opts);

ts.on('tick', function () {
    console.log('Tick-Tock');
})

ts.on('tick-matched', function (data) {
    console.log('Tick Matched');
    //you can inspect data object to see how many more runs remain and so on
    console.log(data);
})

ts.on('tick-cleared', function () {
    console.log('Delay Cleared');
})

```
