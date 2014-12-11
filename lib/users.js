var fs = require('fs'),
    path = require('path'),
    twitterText = require('twitter-text');

var users = function (twitterApi) {
    function createTimelineArgs(user) {
        return {
            screen_name: user.userName,
            exclude_replies: true,
            include_rts: false,
            trim_user: true,
            since_id: user.lastTweetId
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
                    callback({ userName: userData.userName, error: err });
                }
                tweets = data.map(filterTweets, userData);
                if (tweets.length > 0) {
                    userData.lastTweetId = tweets[0].id;
                }
                userData.tweets = tweets;
                callback(null, userData);
            });
        };
        userData.saveTweets = function (callback) {
            var joinedTweets = tweets.join('\n');
            var fileName = path.join(__dirname, '../data', userData.userName);
            fs.writeFile(fileName, joinedTweets, callback);
        };
        return userData;
    }

    return {
        load: function (file, callback) {
            fs.readFile(file, { encoding: 'utf8' }, function (err, data) {
                if (err) {
                    callback(err);
                }

                var parsedData;
                try {
                    parsedData = JSON.parse(data);
                } catch (ex) {
                    callback(ex);
                }
                
                var dataLength = parsedData.length;
                var users = parsedData.map(function (dataItem) {
                    return typeof dataItem === 'string'
                            ? makeUser({ userName: dataItem })
                            : makeUser(dataItem);
                });
                callback(null, users);
            });
        }
    };
};

module.exports = users;
