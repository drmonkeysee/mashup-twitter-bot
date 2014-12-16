var fs = require('fs'),
    events = require('events'),
    util = require('util');

function Store(file) {
    var self = this;
    var tempFile = file + '.tmp';
    events.EventEmitter.call(this);

    this.needsInit = function () {
        return !fs.existsSync(file) || fs.existsSync(tempFile);
    };

    this.saveSync = function (tweets) {
        fs.appendFileSync(tempFile, tweets.join('\n') + '\n');
    };

    this.commit = function (callback) {
        function cb(err) {
            if (err) {
                callback(err);
            } else {
                self.emit('update', self);
                callback();
            }
        }

        if (fs.existsSync(tempFile)) {
            fs.rename(tempFile, file, cb);
        } else {
            cb();
        }
    };

    this.getStoreStream = function () {
        return fs.createReadStream(file, { encoding: 'utf8' });
    };
}

util.inherits(Store, events.EventEmitter);

var createStore = function (file) {
    return new Store(file);
};

exports.create = createStore;
