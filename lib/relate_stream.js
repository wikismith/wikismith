var Stream = require('stream');

module.exports = unique;
function unique(fn) {
    var fn = fn;

    var s = new Stream();
    s.readable = true;
    s.writable = true;
    var pipes = 0;

    s.write = function (data) {
        fn(data, s);
    };

    var ended = 0;
    s.end = function (data) {
        if (arguments.length) s.write(data);
        ended++;
        if (ended === pipes || pipes === 0) {
            s.writable = false;
            s.emit('end');
        }
    };

    s.destroy = function (data) {
        s.writable = false;
    };

    s.on('pipe', function () {
        pipes++;
    });

    s.on('unpipe', function () {
        pipes--;
    });

    return s;
}