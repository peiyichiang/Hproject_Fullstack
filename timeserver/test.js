const timer = require('./lib/api.js')

timer.getTime().then(function(time) {
    console.log(`現在時間: ${time}`)
})