var fs = require('fs'),
    path = require('path');

var tempFile = path.join(__dirname, '../data/store.tmp');
var storeFile = path.join(__dirname, '../data/store');
var saveSync = function (tweets) {
    fs.appendFileSync(tempFile, tweets.join('\n') + '\n');
};

var commit = function (callback) {
    console.log('committing stuff');
    fs.rename(tempFile, storeFile, callback);
};

exports.saveSync = saveSync;
exports.commit = commit;
