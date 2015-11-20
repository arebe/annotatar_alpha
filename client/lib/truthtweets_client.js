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

  var vid = {w: 0, h: 0}

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

    console.log("video w: ", video.width, " video h: ", video.height);
    console.log("window w: ", $(window).width())
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
        video.addEventListener("loadedmetadata", function(e){
          vid.w = this.videoWidth;
          vid.h = this.videoHeight;
        })
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
      var x=0, y=0, w, h;
      
      // var scale = {x: 1, y: 1};
      // // scale > 1 if viewport dim is larger
      // console.log("window.width: "+ $(window).width(), " window.height: ", $(window).height());
      // console.log("video.width: ", vid.w, " video.height: ", vid.h);
      // scale.x = $(window).width() / vid.w; 
      // scale.y = $(window).height() / vid.h;
      // console.log("video scale: ", scale);
      // if (scale.x < 1 || scale.y < 1) {
      //   // if canvas is larger (on either dim), no scaling needed
      //   w = vid.w; 
      //   h = vid.h;
      // } else if (scale.x < scale.y) {  
      //   // if landscape, use x scale
      //   w = vid.w * scale.x;
      //   h = vid.h * scale.x;
      // } else {
      //   // if portrait, use y scale
      //   w = vid.w * scale.y;
      //   h = vid.h * scale.y;
      // }

      // detect if video dims are larger than viewport dims
      var scale = {x: 1, y: 1};
      scale.x = vid.w / $(window).width(); 
      scale.y = vid.h / $(window).height();
      console.log("window.width: "+ $(window).width(), " window.height: ", $(window).height());
      console.log("video.width: ", vid.w, " video.height: ", vid.h);
      console.log("scale.x: ", scale.x, " scale.y: ", scale.y);
      if ($(window).width() < $(window).height()) {
        // portrait
        y = 0;
        if(scale.y < 1){
          x = (vid.w - $(window).width())/2;
          w = vid.w * scale.y;
          h = vid.h * scale.y;          
        }
        else{
          x = 0;
          w = vid.w ;
          h = vid.h ;           
        }

      }
      else {
        // landscape
        x = 0;
        if(scale.x < 1){
          y = (vid.h - $(window).height())/2;
          w = vid.w * scale.x;
          h = vid.h * scale.x;          
        }
        else{
          y = 0;
          w = vid.w ;
          h = vid.h ;           
        }
      }
      console.log("source w: ", w, " source h: ", h);
      var img = context.drawImage(video, x, y, w, h, 0, 0, $(window).width(), $(window).height());
      renderTweets();
      //("geolocation" in navigator) ? renderTweets() : renderNoTweets("Please enable geolocation for full AR experience!");
    }, 100);

//***+++ from https://gist.github.com/zachstronaut/1184900   +++***//
window.addEventListener(
  'load',
  function () {
    var canvas = document.getElementsByTagName('canvas')[0];

    fullscreenify(canvas);
  },
  false
  );

function fullscreenify(canvas) {
  var style = canvas.getAttribute('style') || '';

  window.addEventListener('resize', function () {resize(canvas);}, false);

  resize(canvas);

  function resize(canvas) {
    var scale = {x: 1, y: 1};
      // scale > 1 if viewport dim is larger
      scale.x = (window.innerWidth - 10) / canvas.width; 
      scale.y = (window.innerHeight - 10) / canvas.height;
      //console.log("window.innerHeight: ", window.innerHeight - 10, " canvas.height: ", canvas.height);
      //console.log("scale: ", scale);
      if (scale.x < 1 || scale.y < 1) {
        scale = '1, 1'; // if canvas is larger (on either dim), no scaling needed
      } else if (scale.x < scale.y) {  
        scale = scale.x + ', ' + scale.x;  // if landscape, use x scale
      } else {
        scale = scale.y + ', ' + scale.y;  // if portrait, use y scale
      }

      canvas.setAttribute('style', style + ' ' + '-ms-transform-origin: center top; -webkit-transform-origin: center top; -moz-transform-origin: center top; -o-transform-origin: center top; transform-origin: center top; -ms-transform: scale(' + scale + '); -webkit-transform: scale3d(' + scale + ', 1); -moz-transform: scale(' + scale + '); -o-transform: scale(' + scale + '); transform: scale(' + scale + ');');
    }
  }
  //***+++  ----------------------------------------------  +++***//

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
        var ageMax = (1200000),
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
  // var now = Date.now();
  // offset.time = now - offset.lastTime;
  // offset.lastTime = now;
  // var interval = e.interval;
  var accX = Math.round(e.accelerationIncludingGravity.x*10)/10;
  var accY = Math.round(e.accelerationIncludingGravity.y*10)/10;
  // offset.velX = offset.velX + (accX * (offset.time/1000));
  // offset.velY = offset.velY + (accY * (offset.time/1000));
  // var xincr = 0;
  // if (accX > 0){
  //   accX > 1 ? xincr = 5 : xincr = 1;
  // }
  // else if(accX < 0){
  //   accX < -1 ? xincr = -5 : xincr = -1;
  // }
  // offset.x += xincr;
  
  // offset.y -= offset.velY;
  // console.log("accX: "+accX+" accY: "+accY+" offset.x: "+offset.x+" offset.y: "+offset.y+" offset.time: "+offset.time/1000+" interval: "+interval);

  // offset.velX = 0;
  // offset.velY = 0;

}
} // end if meteor.isClient






