var fs = require('fs'),
    user = require('./user');

var createService = function (file, store, twitterService) {
    var users = [];

    function processUsers(callback) {
        var userCount = users.length;
        var finishedUsers = 0;

        for (var i = 0; i < userCount; ++i) {
            users[i].loadTweets(function processTweets(err, userData) {
                if (err) {
                    callback(err);
                    return;
                }

                if (userData.tweets.length > 0) {
                    try {
                        store.saveSync(userData.tweets);
                        console.log('Saved %d tweets for %s.', userData.tweets.length, userData.name);
                    } catch (ex) {
                        console.log('Error saving tweets for %s: %j', userData.name, ex);
                        callback(ex);
                        return;
                    }
                    userData.loadTweets(processTweets);
                } else if (++finishedUsers == userCount) {
                    store.commit(callback);
                }
            });
        }
    }

    return {
        initialize: function (callback) {
            fs.readFile(file, { encoding: 'utf8' }, function (err, data) {
                if (err) {
                    callback(err);
                    return;
                }

                var parsedData;
                try {
                    parsedData = JSON.parse(data);
                } catch (ex) {
                    return callback(ex);
                }

                users = parsedData.map(function (dataItem) {
                    return typeof dataItem === 'string'
                            ? user.make({ name: dataItem }, twitterService)
                            : user.make(dataItem, twitterService);
                });

                if (store.needsInit()) {
                    processUsers(callback);
                } else {
                    store.onUpdate();
                    callback();
                }
            });
        },
        refresh: function () {
            processUsers(function (err) { if (err) console.log(err); else console.log('updated users'); });
        }
    };
};

exports.create = createService;
