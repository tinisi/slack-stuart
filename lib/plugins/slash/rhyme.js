
/********************************************
 *
 * rhyme - blah blah blah blah time
 *
 * Author : Jason Grosz
 *
 ********************************************/

var rhyme = require('rhyme-plus');
var Q = require('q');

// rhyme sayer...
module.exports.run = function(request, cmd_args, stuart, plugin) {
    if( cmd_args.length === 0 ) {
        stuart.slack_post('Come on now, we need some words to rhyme, give us a short sentence please.', '@'+request.user_name, request.user_name);
    } else {

        var deferred = Q.defer();
        var message = '';
        
        rhyme(function (r) {
            // make a defensive copy of the cmd_args
            var messageWords = cmd_args.slice();

            // pop the last word to get a rhyming match (we'll have some fun with the rest)
            var lastWord = messageWords.pop();
            var count = 0;
            // figure out how many syllables after removing the last word
            var remainingMessageSyllables = 0;
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
                // add a blah for each syllable
                for ( var i=0; i < remainingMessageSyllables; i++) {
                    message = 'blah ' + message;
                }
                // let's grab a random rhyming word from the array
                var randomSelection = Math.floor((Math.random() * (numRhymes - 1)));
                // and finally put a random rhyme after the blahs,
                // and low case it since for some reason the rhyme lib is LOUD...
                message = message + rhymes[randomSelection].toLowerCase();
                deferred.resolve(message);
            } else {
                message = 'No soup for you!';
                deferred.resolve(message);
            }
        });

        // when the promise is resolved, send a reply message
        deferred.promise.then(function (message) {
            stuart.slack_post(message, '@'+request.user_name, request.user_name);
            console.log('sending: ' + message);
        });
        
    }
};

module.exports.help = function(request, stuart) {
	stuart.slack_post("Rhyming is us...on the bus...with no muss! Usage : \n\n'/stuart ryhme <a phrase to rhyme>'", '@'+request.user_name, request.user_name);
};