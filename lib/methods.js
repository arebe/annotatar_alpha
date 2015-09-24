Meteor.methods({
  addTweet: function(text, hashtag){
    Tweets.insert({
      text: text,
      hashtag: hashtag,
      createdAt: new Date(),
      xPos: Math.random()*(800-10)+5,
      yPos: Math.random()*(800-10)+5,
      zPos: Math.random()*(800-10)+5,
      alpha: 1.0,
    });
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