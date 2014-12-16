var path = require('path'),
    Twit = require('twit'),
    users = require('./lib/users'),
    tweetStore = require('./lib/tweet-store'),
    tweetBot = require('./lib/tweetbot'),
    credentials = require('./config/credentials.json');

var twitterService = new Twit(credentials);

var store = tweetStore.create(path.join(__dirname, 'data/store'));
var bot = tweetBot.create(twitterService);
bot.attach(store);

var userService = users.create(path.join(__dirname, 'data/users.json'), store, twitterService);
userService.initialize(function (err) {
    console.log('invoke scheduler');
    if (err) {
        console.log('Startup error: %j', err);
    } else {
        setInterval(function () {
            bot.tweet();
        }, 5000);
    }
});
