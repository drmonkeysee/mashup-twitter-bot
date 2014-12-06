var Twit = require('twit'),
    markov = require('markov'),
    twitterText = require('twitter-text'),
    accountCredentials = require('./config/account.json'),
    users = require('./config/users.json');

var tweets = [];
var markovTweeter = markov();
function generateMarkov(tweet) {
    tweets.push(tweet);
    if (tweets.length < users.length) {
        return;
    }

    var tweetsCount = tweets.length;
    for (var i = 0; i < tweetsCount; ++i) {
        var originalTweet = tweets[i];
        var urls = twitterText.extractUrls(originalTweet);
        var urlCount = urls.length;
        for (var j = 0; j < urlCount; ++j) {
            originalTweet = originalTweet.replace(urls[j], '');
        }
        tweets[i] = originalTweet.replace('foo', '').replace('name', '');
    }

    markovTweeter.seed(tweets.join('\n'), function () {
        var newTweet = markovTweeter.respond('ahoy telephone').join(' ');
        console.log('Prefix: %s', newTweet);
    });

    tweets = [];
}

var twitter = new Twit(accountCredentials);

function createTimelineArgs(username) {
    return {
        screen_name: username,
        count: 10,
        exclude_replies: true,
        include_rts: false,
        trim_user: true
    };
}

var userCount = users.length;
for (var i = 0; i < userCount; ++i) {
    twitter.get('statuses/user_timeline', createTimelineArgs(users[i]), function (err, data, response) {
        var index = Math.floor(Math.random() * data.length);
        generateMarkov(data[index].text);
    });
}
