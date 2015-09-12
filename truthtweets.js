Tweets = new Mongo.Collection("tweets");

Hashtags = new Mongo.Collection("hashtags");

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("tweets");

  Template.body.helpers({
    tweets: function(){
      return Tweets.find({}, {sort: {createdAt: -1}});
    }
  });

  Meteor.startup(function(){
    var ar = $('#ar'),
    canvas = $('canvas', ar)[0],
    context = canvas.getContext('2d'),
    video = $('video', ar)[0],
    navLat, navLong, accurate,
    hashtag;


    context.canvas.width = $(window).width();
    context.canvas.height = $(window).height();
    context.font = "20px serif";
    context.fillStyle = "#3264FF";

    try {
      if ("geolocation" in navigator){
        navigator.geolocation.getCurrentPosition(function(position){
          accurate = (position.coords.accuracy <= 100) ? true : false;
          navLat = position.coords.latitude;
          navLong = position.coords.longitude;
          $("#dynamsg").append('<p>latitude: '+navLat+' longitude: '+navLong+' accuracy: <span id="acc">'+position.coords.accuracy+'</span></p>');
          console.log("lat: ", navLat, " long: ", navLong, " accuracy: ", position.coords.accuracy);
          accurate ? $("#acc").css("color", "#2d7317") : $("#acc").css("color", "#73172d");
        });
      }
      else{
        navLat = 0;
        navLong = 0;
      }
    } catch(err){
      console.log("geolocation error: ", err);
      $("#dynamsg").append("<p>geolocation error: ", err,"</p>");
    }

    try{
      navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.mozURL || window.webkitURL;

      // note ab resolution: http://stackoverflow.com/questions/27420581/get-maximum-video-resolution-with-getusermedia
      navigator.getUserMedia({'video': {
        optional: [
        {minWidth: 320},
        {minWidth: 640},
        {minWidth: 800},
        {minWidth: 900},
        {minWidth: 1024},
        {minWidth: 1280},
        {minWidth: 1920},
        {minWidth: 2560}
        ]
      }}, 
      function(stream){
        video.src = window.opera ? stream : window.URL.createObjectURL(stream);
        video.play();
      }, 
      function(err){
        console.errr("video capture error: ", err);
      })

    } catch(err){
      console.log("navigator.getUserMedia error: ", err);
    }

    video.style.position = "absolute";
    video.style.visibility = "hidden";

    setInterval(function(){
      var img = context.drawImage(video, 0, 0);
      renderTweets();
      //("geolocation" in navigator) ? renderTweets() : renderNoTweets("Please enable geolocation for full AR experience!");
    }, 100);

    var renderTweets = function(){
      var tweets = Tweets.find({}, {sort: {createdAt: -1}}).fetch();
      if(!tweets.length) {
        console.log("no tweets");
        return;
      }
      tweets.map(function(data){
        var age = parseInt(Date.now() - data.createdAt);
        // 14400000 ms == 4 hrs
        // 3600000 ms == 1 hr
        // 1200000 ms = 20min
        // 60000 ms = 1min
        var ageMax = (8*3600000),
        fsizeMax = 50,
        fsizeMin = 1;
        if (age > ageMax){ age = ageMax };

        var fsize = Math.floor((((fsizeMin-fsizeMax)*age)/ageMax)+fsizeMax);
        context.font = fsize+'px sans-serif';
        context.fillText(data.text, data.xPos, data.yPos);
      });

    }

    var renderNoTweets = function(message){
      for(var i = 0; i < 30; i++){
        context.fillStyle("#f11");
        context.fillText(message, 10, (10*i));
      }
    }
  });

  window.ondevicemotion = function(e){
    var accX = Math.round(e.accelerationIncludingGravity.x*10)/10;
    var accY = Math.round(e.accelerationIncludingGravity.y*10)/10;
    // update tweet position with delta movement
  }
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // for sat: #yaminyc
    var hashtag = "#yaminyc";

    Twit = new TwitMaker({
      consumer_key:         Meteor.settings.twitter.consumer_key
      , consumer_secret:      Meteor.settings.twitter.consumer_secret
      , access_token:         Meteor.settings.twitter.access_token
      , access_token_secret:  Meteor.settings.twitter.access_token_secret
    });

    var handleTweets = Meteor.bindEnvironment(function(err, data, response) {
      console.log(data);
      console.log(err);
      for(var i = 0; i < data.statuses.length; i++){
        Meteor.call("addTweet", data.statuses[i].text);
      }
      
    });

    var handleStream = Meteor.bindEnvironment(function(tweet, err){
      debugger;
      console.log("***********************", err, "***********************");
      console.log("+++++++++++++++++++++++",tweet,"+++++++++++++++++++++++");
      Meteor.call("addTweet", tweet.text, hashtag);
    });


    var stream = Twit.stream('statuses/filter', { track: hashtag });

//**************************************************//
// ******  uncomment to turn the stream on: ****** //
  stream.on('tweet', handleStream);

 });

Meteor.publish("tweets", function () {
  return Tweets.find();
});

Meteor.publish("hashtags", function () {
  return Hashtags.find();
});
}

Meteor.methods({
  addTweet: function(text, hashtag){
    Tweets.insert({
      text: text,
      hashtag: hashtag,
      createdAt: new Date(),
      xPos: Math.random()*(800-10)+5, 
      yPos: Math.random()*(800-10)+5,
      zPos: Math.random()*(800-10)+5,
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

});

