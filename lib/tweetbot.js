var markov = require('markov');

var createBot = function (store, userService, twitterService) {
    var generator = markov(1);

    function refreshGenerator(s) {
        console.log('updating generator...');
        generator.seed(s.getStoreStream(), function () {
            console.log('generator updated.');
        });
    }

    return {
        start: function (callback) {
            store.on('update', refreshGenerator);
            userService.initialize(callback);
        },
        tweet: function () {
            var tweet = generator.respond(generator.pick()).join(' ');
            console.log('new tweet: %s', tweet);
        }
    };
};

exports.create = createBot;
