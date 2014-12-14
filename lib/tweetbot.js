var markov = require('markov');

var generator = markov();

var Bot = function (store) {
    this.tweet = function () {
        var tweetInput = store.getTweets().join('\n');
        console.log('Input length: %d', tweetInput.length);
        generator.seed(store.getStoreStream(), function () {
            var tweet = generator.respond(generator.pick()).join(' ');
            console.log('Tweet: %s', tweet);
        });
    };
};

exports.Bot = Bot;
