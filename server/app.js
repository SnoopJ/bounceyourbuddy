var express = require('express');
var p2 = require('p2');
var app = express();

app.use(express.static('../static'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})

//app.get('/', function(req, res) { });

/*http.createServer(function(req, res) { 
    res.writeHead( 200, { "Access-Control-Allow-Origin": "*",
                          "Content-Type": "text/html"} );  
    var x = Math.random();
    var y = 6; 
    switch(req.url) {
        case "/x":
            res.write( x.toString() );    
            break;
        case "/y":
            res.write( y.toString() );    
            break;
        default:
            res.write("Nothing requested.");
    }
    res.end();  
}).listen(1337, '127.0.0.1');

http.createServer( function(req,res) {
    res.writeHead( 200, { "Access-Control-Allow-Origin": "*",
                          "Content-Type": "text/html"} );  
    serve(req,res,function(){});
}).listen(80, '127.0.0.1');*/
