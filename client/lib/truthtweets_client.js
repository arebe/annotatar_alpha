if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("tweets");

  var offset = {
    lastTime: 0,
    time: 0,
    velX: 0.0,
    velY: 0.0,
    x: 0.0,
    y: 0.0,
  };

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
        console.err("video capture error: ", err);
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
        var age = parseInt(Date.now() - data.tweetCreatedAt);
        // 14400000 ms == 4 hrs
        // 3600000 ms == 1 hr
        // 1200000 ms = 20min
        // 60000 ms = 1min
        var ageMax = (48*3600000),
        fsizeMax = 50,
        fsizeMin = 0;
        if (age > ageMax){ age = ageMax };
        var fsize = Math.floor((((fsizeMin-fsizeMax)*age)/ageMax)+fsizeMax);
        alphaMax = 1.0;
        alphaMin = 0;
        var alpha = (((alphaMin-alphaMax)*age)/ageMax)+alphaMax;
        context.font = fsize+'px "Amatic SC"';
        context.fillStyle = 'rgba('+data.color.r+','+data.color.g+','+ data.color.b+','+ alpha+')';
        context.fillText(data.text, data.xPos+offset.x, data.yPos+offset.y);
      });

    }

    var renderNoTweets = function(message){
      for(var i = 0; i < 30; i++){
        context.fillStyle("#f11");
        context.fillText(message, 10, (10*i));
      }
    }

  $("#downloadBtn").click(function(event) {
    var filename = 'annotatar_data.csv';
    Meteor.call('download', function(err, fileContent) {
      if(fileContent){
        var blob = new Blob([fileContent], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename);
      }
    })
  });

  $("#captureBtn").click(function(e){
    var url = canvas.toDataURL('png');
    $("#captureLink").attr('href', url).click();
     
  });


  });  // end onstartup

window.ondevicemotion = function(e){
  var now = Date.now();
  offset.time = now - offset.lastTime;
  offset.lastTime = now;
  var accX = Math.round(e.accelerationIncludingGravity.x*10)/10;
  var accY = Math.round(e.accelerationIncludingGravity.y*10)/10;
  offset.velX = offset.velX + accX * (offset.time/1000);
  offset.velY = offset.velY + accY * (offset.time/1000);
  offset.x += offset.velX;
  offset.y += offset.velY;
  console.log("accX: "+accX+" accY: "+accY+" offset.x: "+offset.x+" offset.y: "+offset.y+" offset.time: "+offset.time/1000);

  offset.velX, offset.velY = 0;

    // update tweet position with delta movement -- 
    // or do we just want to move the tweet relative to the viewport 
    //(no server call necesary)
  }
} // end if meteor.isClient






