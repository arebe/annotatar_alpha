Tweets = new Mongo.Collection("tweets");

Hashtags = new Mongo.Collection("hashtags");

lastColor = {
	r: Math.floor(Math.random() * (255 - 10 + 1)) + 10, 
	g: Math.floor(Math.random() * (255 - 10 + 1)) + 10, 
	b: Math.floor(Math.random() * (255 - 10 + 1)) + 10,
}

var xOff = 0;
var yOff = 0;