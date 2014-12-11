var fs = require('fs'),
    path = require('path');

var store = function (file) {
    var tempFile = file + '.tmp';

    return {
        saveSync: function (tweets) {
            fs.appendFileSync(tempFile, tweets.join('\n') + '\n');
        },
        commit: function (callback) {
            fs.rename(tempFile, file, callback);
        }
    };
};

module.exports = store;
