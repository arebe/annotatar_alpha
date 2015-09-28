// get random number, inclusive
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function constrain(n, min, max){
        return Math.max(Math.min(n, max), min);
}

// Twitter Parsers
// adapted from http://www.itworld.com/article/2704521/development/how-to-parse-urls--hash-tags--and-more-from-a-tweet.html
// String.prototype.stripURL = function() {
//     return this.replace(/[A-Za-z]+://[A-Za-z0-9-_]+.[A-Za-z0-9-_:%&~?/.=]+/g, "");
// };

// String.prototype.stripUsername = function() {
//     return this.replace(/[@]+[A-Za-z0-9-_]+/g, "");
// };

// String.prototype.stripHashtag = function() {
//     return this.replace(/[#]+[A-Za-z0-9-_]+/g, "");
// };