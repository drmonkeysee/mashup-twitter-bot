var path = require('path'),
    Twit = require('twit'),
    markov = require('markov'),
    users = require('./lib/users'),
    credentials = require('./config/credentials.json');

var markovGenerator = markov(1);
var markovInput = [];
var markovCount = 0;

function applyToGenerator(tweets, userCount) {
    markovInput = markovInput.concat(tweets);
    if (++markovCount == userCount) {
        markovGenerator.seed(markovInput.join('\n'), function () {
            var newTweet = markovGenerator.respond('ahoy telephone', 20).join(' ');
            console.log('Prefix: %s', newTweet);
        });
    }
}

var twitterApi = new Twit(credentials);
var usersLoader = users(twitterApi);

var userDataFile = path.join(__dirname, 'data/users.json');
usersLoader.load(userDataFile, function (err, users) {
    if (err) {
        console.log(err);
    }

    var userCount = users.length;
    for (var i = 0; i < userCount; ++i) {
        users[i].loadTweets(function (err, user) {
            if (err) {
                console.log(err);
            }

            user.saveTweets(function (err) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log('Wrote tweets for %s', user.userName);
            });

            applyToGenerator(user.tweets, userCount);
        });
    }
});
