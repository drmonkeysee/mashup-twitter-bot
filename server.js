var path = require('path'),
    markov = require('markov'),
    users = require('./lib/users');

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

var userDataFile = path.join(__dirname, 'data/users.json');
users.load(userDataFile, function (err, users) {
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
