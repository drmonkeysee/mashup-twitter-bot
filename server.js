var path = require('path'),
    Twit = require('twit'),
    markov = require('markov'),
    users = require('./lib/users'),
    store = require('./lib/twitter-store'),
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
    var finishedUsers = 0;
    for (var i = 0; i < userCount; ++i) {
        users[i].loadTweets(function processTweets(err, user) {
            if (err) {
                console.log(err);
                return;
            }

            if (user.tweets.length > 0) {
                try {
                    store.saveSync(user.tweets);
                    console.log('Saved %d tweets for %s.', user.tweets.length, user.name);
                } catch (ex) {
                    console.log('Error saving tweets for %s: %j', user.name, ex);
                    return;
                }
                user.loadTweets(processTweets);
            } else if (++finishedUsers == userCount) {
                console.log('committing tweets');
                store.commit(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Finished writing tweets.');
                    }
                });
            }

            //applyToGenerator(user.tweets, userCount);
        });
    }
});
