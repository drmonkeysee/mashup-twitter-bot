var markov = require('markov');

var createBot = function (twitterService) {
    var generator = markov(1);

    function refreshGenerator(s) {
        console.log('updating generator...');
        generator.seed(s.getStoreStream(), function () {
            console.log('generator updated.');
        });
    }

    return {
        attach: function (store) {
            store.on('update', refreshGenerator);
        },
        tweet: function () {
            var tweet = generator.respond(generator.pick()).join(' ');
            console.log('new tweet: %s', tweet);
        }
    };
};

exports.create = createBot;
