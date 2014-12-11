var fs = require('fs'),
    path = require('path'),
    twitterText = require('twitter-text');

var users = function (twitterApi) {
    function createTimelineArgs(user) {
        return {
            screen_name: user.name,
            count: 200,
            max_id: user.oldestTweetId,
            exclude_replies: true,
            include_rts: false,
            trim_user: true,
            since_id: user.newestTweetId
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
        return tweetText;
    }

    function makeUser(userData) {
        var tweets = [];
        userData.loadTweets = function (callback) {
            twitterApi.get('statuses/user_timeline', createTimelineArgs(userData), function (err, data, response) {
                if (err) {
                    return callback({ name: userData.name, error: err });
                }
                if (data.length == 0) {
                    console.log('no more tweets');
                    userData.tweets = [];
                    return callback(null, userData);
                }

                var oldestTweetId = data[data.length - 1].id;
                if (oldestTweetId == userData.oldestTweetId) {
                    tweets = [];
                    console.log('no more tweets for %s!', userData.name);
                } else {
                    tweets = data.map(filterTweets, userData);
                    if (tweets.length > 0) {
                        userData.oldestTweetId = data[data.length - 1].id;
                        console.log('Oldest tweet for %s: %d', userData.name, userData.oldestTweetId);
                    }
                }
                userData.tweets = tweets;
                callback(null, userData);
            });
        };
        userData.saveTweets = function (callback) {
            var joinedTweets = tweets.join('\n');
            var fileName = path.join(__dirname, '../data', userData.name);
            fs.writeFile(fileName, joinedTweets, callback);
        };
        return userData;
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

                var dataLength = parsedData.length;
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

module.exports = users;
