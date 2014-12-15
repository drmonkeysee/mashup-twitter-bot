var fs = require('fs'),
    path = require('path'),
    events = require('events'),
    util = require('util');

function Store(file) {
    var self = this;
    var tempFile = file + '.tmp';
    events.EventEmitter.call(this);

    var update = function () {
        self.emit('update', self);
    };

    this.needsInit = function () {
        return !fs.existsSync(file) || fs.existsSync(tempFile);
    };

    this.saveSync = function (tweets) {
        fs.appendFileSync(tempFile, tweets.join('\n') + '\n');
    };

    this.commit = function (callback) {
        fs.rename(tempFile, file, function (err) {
            if (err) {
                callback(err);
            } else {
                update();
                callback();
            }
        });
    };

    this.update = update;

    this.getStoreStream = function () {
        return fs.createReadStream(file, { encoding: 'utf8' });
    };
}

util.inherits(Store, events.EventEmitter);

var createStore = function (file) {
    return new Store(file);
};

exports.create = createStore;
