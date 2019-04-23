const fs = require('fs')
const path = require('path')

function getTime() {
    return new Promise(function (resolve, reject) {
        try {
            let time = fs.readFileSync(path.resolve(__dirname, "../time.txt"), "utf8").toString()
            resolve(time)
        } catch (error) {
            console.log(`cannot find timeserver time. Use server time instead`);
            let time = new Date().myFormat()
            resolve(time)
        }
    })
}
Date.prototype.myFormat = function () {
    return new Date(this.valueOf() + 8 * 3600000).toISOString().replace(/T|\:/g, '-').replace(/(\.(.*)Z)/g, '').split('-').join('').slice(0, 12);
};

module.exports = {
    getTime,
}