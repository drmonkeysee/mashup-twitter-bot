var twitterText = require('twitter-text');

var MAX_COUNT = 200;

function createTimelineArgs(userData) {
    return {
        screen_name: userData.name,
        exclude_replies: true,
        include_rts: false,
        trim_user: true,
        count: MAX_COUNT,
        max_id: userData.oldestTweet,
        since_id: userData.newestTweet
    };
}

function evaluateResponse(data, userData) {
    // sometimes user_timeline returns no more data when it's done
    if (!data.length) {
        userData.tweets = [];
        return false;
    }

    // and sometimes it just returns the last thing it gave you
    var oldestTweet = data[data.length - 1].id;
    if (oldestTweet == userData.oldestTweet) {
        userData.tweets = [];
        return false;
    }

    userData.oldestTweet = oldestTweet;
    return true;
}

var filterTweets = function (tweet) {
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
};

var makeUser = function (userData, twitterService) {
    userData.tweets = [];

    userData.loadTweets = function (callback) {
        twitterService.get('statuses/user_timeline', createTimelineArgs(userData), function (err, data, response) {
            if (err) {
                callback({ name: userData.name, error: err });
                return;
            }

            var continueProcessing = evaluateResponse(data, userData);

            if (continueProcessing) {
                userData.tweets = data.map(filterTweets, userData);
            }

            callback(null, userData);
        });
    };

    return userData;
};

exports.make = makeUser;
