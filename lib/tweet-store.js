var fs = require('fs'),
    path = require('path'),
    events = require('events'),
    util = require('util');

function Store(file) {
    var tempFile = file + '.tmp';
    events.EventEmitter.call(this);
}

util.inherits(Store, events.EventEmitter);

var createStore = function (file) {
    var tempFile = file + '.tmp';
    
    return {
        saveSync: function (tweets) {
            fs.appendFileSync(tempFile, tweets.join('\n') + '\n');
        },
        commit: function (callback) {
            fs.rename(tempFile, file, callback);
        },
        getStoreStream: function () {
            return fs.createReadStream(file, { encoding: 'utf8' });
        }
    };
};

exports.create = createStore;
