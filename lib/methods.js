Meteor.methods({
  addTweet: function(text, hashtag){
    var thisColor = {
      r: lastColor.r < 255 ? constrain(lastColor.r+10, 10, 255) : 10,
      g: lastColor.g < 255 ? constrain(lastColor.g+5, 10, 255) : 10,
      b: lastColor.b < 255 ? constrain(lastColor.b+20, 10, 255) : 10,
    }
    Tweets.insert({
      text: text,
      hashtag: hashtag,
      createdAt: new Date(),
      xPos: Math.random()*(25-10)+5,
      yPos: Math.random()*(800-10)+5,
      zPos: Math.random()*(800-10)+5,
      color: thisColor,
    });
    lastColor = thisColor;
  },
  // updateTweet: function(id, x, y){
  //   Tweets.update(this.id, {
  //     $set: {
  //       {xPos: x},
  //       {yPos: y},
  //     }
  //   });
  // },
  addHashtag: function(lat, lon, hashtag){
    Hashtags.insert({
      lat: lat,
      lon: lon,
      hashtag: hashtag,      
    })
  },
  download: function() {
    var collection = Tweets.find().fetch();
    var heading = true; // Optional, defaults to true
    var delimiter = "\t" // Optional, defaults to ",";
    return exportcsv.exportToCSV(collection, heading, delimiter);
  },

});

function constrain(n, min, max){
        return Math.max(Math.min(n, max), min);
}