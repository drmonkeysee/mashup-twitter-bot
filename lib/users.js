var fs = require('fs'),
    twitterText = require('twitter-text');

var MAX_COUNT = 200;

function createTimelineArgs(user) {
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

function evaluateResponse(data, user) {
    // user_timeline designates end of feed by either
    // returning nothing or
    // returning the last tweet
    // so handle both cases to determine if we're at end of feed
    if (!data.length) {
        user.tweets = [];
        return false;
    }

    var oldestTweet = data[data.length - 1].id;
    if (oldestTweet == user.oldestTweet) {
        user.tweets = [];
        return false;
    }

    user.oldestTweet = oldestTweet;
    return true;
}

var loader = function (twitterApi) {
    function makeUser(user) {
        user.loadTweets = function (callback) {
            twitterApi.get('statuses/user_timeline', createTimelineArgs(user), function (err, data, response) {
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

    return {
        load: function (file, callback) {
            fs.readFile(file, { encoding: 'utf8' }, function (err, data) {
                if (err) {
                    return callback(err);
                }

                var parsedData;
                try {
                    parsedData = JSON.parse(data);
                } catch (ex) {
                    return callback(ex);
                }

                var users = parsedData.map(function (dataItem) {
                    return typeof dataItem === 'string'
                            ? makeUser({ name: dataItem })
                            : makeUser(dataItem);
                });
                callback(null, users);
            });
        }
    };
};

module.exports = loader;
