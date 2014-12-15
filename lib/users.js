var fs = require('fs'),
    twitterText = require('twitter-text');

function makeUser(user, twitterService) {
    var MAX_COUNT = 200;
    user.tweets = [];

    function createTimelineArgs() {
        return {
            screen_name: user.name,
            exclude_replies: true,
            include_rts: false,
            trim_user: true,
            count: MAX_COUNT,
            max_id: user.oldestTweet,
            since_id: user.newestTweet
        };
    }

    function filterTweets(tweet) {
        var tweetText = tweet.text;
        var urls = twitterText.extractUrls(tweetText);
        var urlCount = urls.length;
        for (var i = 0; i < urlCount; ++i) {
            tweetText = tweetText.replace(urls[i], '');
        }
        if (typeof this.strip === 'string') {
            tweetText = tweetText.replace(new RegExp(this.strip, 'g'), '');
        }
        tweetText = tweetText.replace(/\s+/g, ' ');
        return tweetText;
    }

    function evaluateResponse(data) {
        // sometimes user_timeline returns no more data when it's done
        if (!data.length) {
            user.tweets = [];
            return false;
        }

        // and sometimes it just returns the last thing it gave you
        var oldestTweet = data[data.length - 1].id;
        if (oldestTweet == user.oldestTweet) {
            user.tweets = [];
            return false;
        }

        user.oldestTweet = oldestTweet;
        return true;
    }

    user.loadTweets = function (callback) {
        twitterService.get('statuses/user_timeline', createTimelineArgs(), function (err, data, response) {
            if (err) {
                callback({ name: user.name, error: err });
                return;
            }

            var continueProcessing = evaluateResponse(data, user);

            if (continueProcessing) {
                user.tweets = data.map(filterTweets, user);
            }

            callback(null, user);
        });
    };
    return user;
}

var createService = function (file, store, twitterService) {
    var users = [];

    function processUsers(callback) {
        var userCount = users.length;
        var finishedUsers = 0;

        for (var i = 0; i < userCount; ++i) {
            users[i].loadTweets(function processTweets(err, user) {
                if (err) {
                    callback(err);
                    return;
                }

                if (user.tweets.length > 0) {
                    try {
                        store.saveSync(user.tweets);
                        console.log('Saved %d tweets for %s.', user.tweets.length, user.name);
                    } catch (ex) {
                        console.log('Error saving tweets for %s: %j', user.name, ex);
                        callback(ex);
                        return;
                    }
                    user.loadTweets(processTweets);
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
                            ? makeUser({ name: dataItem }, twitterService)
                            : makeUser(dataItem, twitterService);
                });

                if (store.needsInit()) {
                    processUsers(callback);
                } else {
                    store.update();
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
