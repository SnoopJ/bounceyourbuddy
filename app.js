var http = require('http'),
    fs = require('fs'),
    // NEVER use a Sync function except at start-up!
    index = fs.readFileSync(__dirname + '/static/index.html');

// Send index.html to all requests
var app = http.createServer(function (req, res) {
  console.log(req.url);
  fs.readFile(__dirname + req.url, function (err,data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
}).listen(80);

// Socket.io server listens to our app
var io = require('socket.io').listen(app);

// Send current time to all connected clients
function sendPhysicsUpdate(socket) {
    socket.emit('update', {
        x: Math.random()*530, 
        y: Math.random()*308
    });
}


// Emit welcome message on connection
//io.on('connection', function(socket) {
//    // Use socket to communicate with this particular client only, sending it it's own id
//    console.log("socket " + socket.id + " connected");
//    socket.emit('welcome', { message: 'Welcome!', id: socket.id });
//
//    socket.on('ping', function() {
//        console.log("got a ping on socket " + socket.id);
//        socket.emit('pong', { response: "AYYY LMAO" } );
//    });
//});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('requestUpdate', function(msg){
        // Send physics update once every 1/4 sec
        setInterval(function() {sendPhysicsUpdate(socket)}, 2000);
        console.log('requestUpdate from ' +socket.id+ ' : '+ msg);
        socket.emit('update', {x: 10, y:10});
    });
});

app.listen(3000);
