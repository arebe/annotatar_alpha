if (Meteor.isServer) {
  Meteor.startup(function () {
    // for sat: #occupyboston
    var hashtag = "occupy";

    Twit = new TwitMaker({
      consumer_key:         Meteor.settings.twitter.consumer_key
      , consumer_secret:      Meteor.settings.twitter.consumer_secret
      , access_token:         Meteor.settings.twitter.access_token
      , access_token_secret:  Meteor.settings.twitter.access_token_secret
    });

    //*** REST

    var handleTweets = Meteor.bindEnvironment(function(err, data, response) {
      console.log(data);
      console.log("***********************", err, "***********************");
      for(var i = 0; i < data.statuses.length; i++){
        Meteor.call("addTweet", data.statuses[i].text, hashtag, data.statuses[i].created_at);
      }
      
    });


    //**************************************************//
    // ******  uncomment to turn the rest on: ****** //
    Twit.get('search/tweets',
     {
       q: hashtag,
       count: 20
     }, handleTweets);

   //*** Stream

    var handleStream = Meteor.bindEnvironment(function(tweet, err){
      console.log("***********************", err, "***********************");
      console.log("+++++++++++++++++++++++",tweet,"+++++++++++++++++++++++");
      // tweet.text.stripURL().stripUsername().stripHashtag();
      Meteor.call("addTweet", tweet.text, hashtag);
    });


    var stream = Twit.stream('statuses/filter', { track: "#"+hashtag });

    //**************************************************//
    // ******  uncomment to turn the stream on: ****** //
   // stream.on('tweet', handleStream);

  }); // end onstartup

  Meteor.publish("tweets", function () {
    return Tweets.find();
  });

  Meteor.publish("hashtags", function () {
    return Hashtags.find();
  });

  Houston.methods("Tweets", {
    "Download": function(e){
      var nameFile = 'fileDownloaded.csv';
      Meteor.call('download', function(err, fileContent) {
        if(fileContent){
          var blob = new Blob([fileContent], {type: "text/plain;charset=utf-8"});
          saveAs(blob, nameFile);
        }
      })
      return "Downloaded Tweets";
    },
  });


} // end if meteor.isServer