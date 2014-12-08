var fs = require('fs'),
    path = require('path'),
    Twit = require('twit'),
    twitterText = require('twitter-text');

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
        twitter.get('statuses/user_timeline', createTimelineArgs(userData), function (err, data, response) {
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

var twitter;
exports.loadUsers = function (file, credentials, callback) {
    twitter = new Twit(credentials);

    fs.readFile(file, { encoding: 'utf8' }, function (err, data) {
        if (err) {
            callback(err);
        }

        var parsedData = JSON.parse(data);
        var dataLength = parsedData.length;
        var users = parsedData.map(function (dataItem) {
            return typeof dataItem === 'string'
                    ? makeUser({ userName: dataItem })
                    : makeUser(dataItem);
        });
        callback(null, users);
    });
};