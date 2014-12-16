var markov = require('markov');

var createBot = function (twitterService) {
    var generator = markov(1);
    var generating = false;
    
    function refreshGenerator(s) {
        console.log('updating generator...');
        generating = true;
        generator.seed(s.getStoreStream(), function (err) {
            generating = false;
            if (err) {
                console.log(err);
                return;
            }
            console.log('generator updated.');
        });
    }

    return {
        attach: function (store) {
            store.on('update', refreshGenerator);
        },
        tweet: function () {
            if (generating) {
                console.log('waiting on markov generation...');
            } else {
                var tweet = generator.respond('', 15).join(' ');
                console.log('new tweet: %s', tweet);
            }
        }
    };
};

exports.create = createBot;
