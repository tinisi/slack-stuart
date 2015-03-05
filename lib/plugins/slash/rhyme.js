
/********************************************
 *
 * rhyme - blah blah blah blah time
 *
 * Author : Jason Grosz
 *
 ********************************************/

var rhyme = require('rhyme-plus');
var Q = require('q');
var logme = require('logme');

// rhyme sayer...
module.exports.run = function(request, cmd_args, stuart, plugin) {

    var deferred = Q.defer();
    var message = '';

    // look to plugin config for a syllable placeholder
    var syllablePlaceholder = plugin.config.syllablePlaceholder || 'blah'

    if( cmd_args.length === 0 ) {
        message = 'Come on now, we need some words to rhyme, give Stuart a short phrase please.'
        // resolve the promise with a non-fatal error message
        deferred.resolve(message);
    } else {
        // looks like we have some text to work with
        rhyme(function (r) {

            // make a defensive copy of the cmd_args
            // looks like this is actually an array of words typed AFTER the command
            var messageWords = cmd_args.slice();

            // this will be more amusing if we make a two line response with the original message
            var originalMessage = messageWords.join(' ');

            // pop the last word to get a rhyming match (we'll have some fun with the rest)
            var lastWord = messageWords.pop();

            // figure out how many syllables are left
            var remainingMessageSyllables = 0;
            // count is used in the loop below, count of syllables per word
            var count = 0;
            // loop over the words, and keep adding the count of syllables to the total
            for ( var j=0; j < messageWords.length; j++) {
                // get the number of syllables in each word
                count = r.syllables(messageWords[j]);
                if ( !!count ) {
                    remainingMessageSyllables += count;                        
                }
            }

            // get an array of rhymes for the last word
            var rhymes = r.rhyme(lastWord);
            var numRhymes = rhymes.length;

            // gotta account for "orange"
            if ( !!numRhymes ) {
                // add a "blah" for each syllable (can be customized in plugin config)
                for ( var i=0; i < remainingMessageSyllables; i++) {
                    message = syllablePlaceholder + ' ' + message;
                }
                // let's grab a random rhyming word from the array
                var randomSelection = Math.floor((Math.random() * (numRhymes - 1)));
                // and finally put a random rhyme after the blahs,
                // and low case it since for some reason the rhyme lib is LOUD...
                message = message + rhymes[randomSelection].toLowerCase();
                // resolve our promise with the message string
                // since we have a rhyme, prepend with the orginal message
                deferred.resolve(originalMessage + '\n' + message);
            } else {
                // if there is no rhyme for the last word, we'll punt
                message = 'No soup for you!';
                // resolve our promise with the message string
                deferred.resolve(message);
            }
        });

        // when the promise is resolved, send a reply message
        deferred.promise.then(function (message) {
            // positional args for slack_post() are:
            // msg, channel, from, attachment
            // responding on whatever channel the command was issued
            stuart.slack_post(message, '#'+request.channel_name, request.user_name);
            logme.debug('sending: ' + message);
        });
        
    }
};

module.exports.help = function(request, stuart) {
	stuart.slack_post("Rhyming is us...on the bus...with no fuss!\n Usage : \n\n'/stuart ryhme <a short phrase to rhyme>'", '@'+request.user_name, request.user_name);
};
