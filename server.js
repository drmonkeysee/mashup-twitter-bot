var path = require('path'),
    Twit = require('twit'),
    users = require('./lib/users'),
    twitterStore = require('./lib/twitter-store'),
    tweetBot = require('./lib/tweetbot'),
    credentials = require('./config/credentials.json');

var store = twitterStore.create(path.join(__dirname, 'data/foo'));
var stream = store.getStoreStream();
return;
console.log('tweet count: %d', store.getTweets().length);
var bot = new tweetBot.Bot(store);

bot.tweet();

return;

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
                store.commit(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        bot.tweet();
                    }
                });
            }

            //applyToGenerator(user.tweets, userCount);
        });
    }
});
