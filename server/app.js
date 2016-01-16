var http = require('http');

http.createServer(function(request, response) { 
    response.writeHeader(200, {"Content-Type": "text/html"});  
    response.write("Greetings, programs!");  
    response.end();  
}).listen(1337, '127.0.0.1');
