var markov = require('markov');

var generator = markov(1);

var Bot = function (store) {
    this.tweet = function () {
        generator.seed(store.getStream(), function () {
            var tweet = generator.respond('').join(' ');
            console.log('Tweet: %s', tweet);
        });
    };
};

exports.Bot = Bot;
