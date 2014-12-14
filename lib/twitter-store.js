var fs = require('fs'),
    path = require('path');

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
