var express = require('express')
  , http = require('http');

var app = express();
var server = http.createServer(app);

var io = require('socket.io').listen(server);

var twitter = require('ntwitter');

var port    = process.env.PORT || 5000;

var twitter_user_key     = process.env.TWITTER_USER_KEY || 'zC4UDsxhFEXLgWRMMPAcpg';
var twitter_user_secret  = process.env.TWITTER_USER_SECRET || 'V80pq4sBfdpVZCh6HrGyY4lbChJj1ScEY7o8XnrtbbY';
var twitter_key          = process.env.TWITTER_KEY || '7135862-4tozpQhvEdPIdUopvhoV9bP10QJpJTGUJPLd674auw';
var twitter_secret       = process.env.TWITTER_SECRET || 'uaCmognBJE0UySfXDydQ3c4YOyoiqV0YCqBl2BYC30';

/***********************************
 * socket.io configuration         *
 ***********************************/

io.configure(function () { 
  io.set('transports', ['xhr-polling']); 
  io.set('polling duration', 10); 
  io.set('log level', 1);
});

io.sockets.on('connection', function (socket) {
  console.log('client connected to socket.io');
});

/***********************************
 * twitter streaming               *
 ***********************************/

var twit = new twitter({
  consumer_key: twitter_user_key,
  consumer_secret: twitter_user_secret,
  access_token_key: twitter_key,
  access_token_secret: twitter_secret
});


/***********************************
 * express configuration           *
 ***********************************/

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.engine('html', require('ejs').renderFile);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser()); 
  app.use(express.session({ secret: 'nforce testing baby' }));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

/***********************************
 * express routes                  *
 ***********************************/

app.get('/', function(req, res) {
   res.render("index.html");
});

app.get('/twitter/:hashtag', function(request, response) {
	console.log(request.params.hashtag);
	twit.stream('statuses/filter', { track: request.params.hashtag }, function(stream) {
	  stream.on('data', function (data) {
	  	if(data.coordinates != undefined) {
	    	io.sockets.emit('twitter', JSON.stringify(data));
	   }
	  });
	});
	response.end();   
});

/***********************************
 * app initialization              *
 ***********************************/

server.listen(port);
