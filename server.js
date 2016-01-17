var p2 = require('p2'); 
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');

var http = require('http')
    //fs = require('fs'),
    //// NEVER use a Sync function except at start-up!
    //index = fs.readFileSync(__dirname + '/static/index.html');

var serve = serveStatic('./static');
var app = http.createServer(function(req,res) {
    var done = finalhandler(req, res);
    serve(req, res, done);
});

var port = process.env.PORT || 80;

app.listen(port);

// Socket.io server listens to our app
var io = require('socket.io').listen(app);

p2.restitution = 1.0;

var world;
var sendPhysicsUpdate;
var spawnBall;
var balls;
var goalL;
var goalR;
var physicsLoop;

world = new p2.World({
   gravity: [0,-800/20] 
});

var resetWorld = function () {
    io.emit( 'reset' );
    clearInterval(physicsLoop);
    //world.clear();
    world.bodies.map( function(b,i) {
        world.removeBody(b);
    });
    console.log("set up another world");
    setUpWorld();
    console.log("run new world");
    setTimeout( function() {
        b = spawnBall( (530-300)/20,100/20, -5, 0, curid );
        //console.log(b.ballid);
        io.emit('spawnBall', { x: (530-300), y: 100, vx: -5/20, vy: 0, id:curid });
        curid++;
        var timeStep = 1/40;
        physicsLoop = setInterval( function() { 
            world.step(timeStep); 
            sendPhysicsUpdate(); 
            //console.log(ball.position);
        }, 1000*timeStep );
    }, 3000);
}

var setUpWorld = function () {

    var worldMaterial = new p2.Material();
    world.defaultMaterial = worldMaterial;

    var ballMaterial = new p2.Material();
    var ballWorldContact = new p2.ContactMaterial(worldMaterial, ballMaterial, { restitution: 1.0 });

    world.addContactMaterial( ballWorldContact );

    balls = [];
    spawnBall = function(x,y,vx,vy,id) {
        var ball = new p2.Body({
            mass: 1,
            angle: 0,
            position:[x,y],
            velocity: [vx, vy],
            angularVelocity: 0,
            //position:[(530-300)/20,300/20]
        });
        ball.addShape( new p2.Box({ width: 16/20, height: 16/20, material: ballMaterial }) );
        ball.ballid = id;
        world.addBody(ball);
        balls.push(ball);
        return ball;
    }

    var goalLShape = new p2.Box( { width: 50/20, height: 100/20, material: worldMaterial } );
    goalL = new p2.Body({
        mass:0,
        sensor: true,
        goalId: 0,
        position:[(530-50)/20,0]
    });
    goalL.addShape(goalLShape);
    world.addBody(goalL);

    var goalRShape = new p2.Box( { width: 50/20, height: 100/20, material: worldMaterial } );
    goalR = new p2.Body({
        mass:0,
        sensor: true,
        goalId: 1,
        position:[0,0]
    });
    goalR.addShape(goalRShape);
    world.addBody(goalR);

    world.on( "beginContact", function(evt) { 
        if ( evt.bodyA === goalL || evt.bodyA === goalR ) {
            console.log("GOOOOOAAAAAAAAAAAAALLLL"); 
            scoredon = "nobody?!";
            if ( evt.bodyA === goalR ) { 
                scoredon = "left"; 
                clients.right.money += Math.floor(10*(world.time-lastGoal)/(numPoints+1));
            } else if ( evt.bodyA === goalL ) { 
                scoredon = "right" 
                clients.left.money += Math.floor(10*(world.time-lastGoal)/(numPoints+1));
            }
            io.emit('money', clients);
            numPoints++;
            lastGoal = world.time;
            console.log( "Against " + scoredon ); 
            console.log(clients);
            io.emit('goal', { scoredon: scoredon, ballid: evt.bodyB.ballid } );
            resetWorld();
            //balls.splice( balls.indexOf(evt.bodyB), 1 );
            //world.removeBody(evt.bodyB);
            //delete(evt.bodyB);
        } if ( evt.bodyB === goalL || evt.bodyB === goalR ) {
            console.log("GOOOOOAAAAAAAAAAAAALLLL"); 
            scoredon = "nobody?!";
            if ( evt.bodyB === goalR ) { scoredon = "left" }
            if ( evt.bodyB === goalL ) { scoredon = "right" }
            console.log( "Against " + scoredon ); 
            io.emit('goal', { scoredon: scoredon, ballid: evt.bodyA.ballid } );
            resetWorld();
            //balls.splice( balls.indexOf(evt.bodyA), 1 );
            //world.removeBody(evt.bodyA);
            //delete(evt.bodyA);
        }
        //console.log(evt.bodyA);
        //console.log(evt.bodyB);
    })

    var groundShape = new p2.Plane( { material: worldMaterial } );
    var ground = new p2.Body({
        mass:0,
        position:[0,32/20]
    });
    ground.addShape(groundShape);
    world.addBody(ground);

    var ceilingShape = new p2.Box( { width:530/20, height:4, material: worldMaterial } );
    var ceiling = new p2.Body({
        mass:0,
        type: p2.Body.STATIC,
        position:[0,300/20]
    });
    //ceilingShape.collisionResponse = false;
    ceiling.addShape(ceilingShape);
    world.addBody(ceiling);

    var wallShape = new p2.Box( { width:5, height:300/2, material: worldMaterial } );
    var wall = new p2.Body({
        mass: 0,
        type: p2.Body.STATIC,
        position:[-4,0],
    });
    wall.addShape(wallShape);
    world.addBody(wall);

    var wallShape2 = new p2.Box( { width:5, height:300/2, material: worldMaterial } );
    var wall2 = new p2.Body({
        mass: 0,
        type: p2.Body.STATIC,
        position:[530/20+4,0],
    });
    wall2.addShape(wallShape2);
    world.addBody(wall2);


    sendPhysicsUpdate = function () {
        balls.map( function(ball,i) {
            io.emit('update', { id: ball.ballid,
                update: {
                    x: ball.position[0], 
                    y: ball.position[1],
                    vx: ball.velocity[0],
                    vy: ball.velocity[1]
                }
            });
        });
    }
}


var curid = 0;
var lastGoal = 0;
var numPoints = 0;
var clients = {left: { id: null, money: 0 }, right: { id: null, money: 0 } };
io.on('connection', function(socket){
    balls = [];
    console.log('a user connected (id: ' + socket.id +' )');
    socket.on('disconnect', function(){
        if ( clients.left.id == socket.id ) {
            clients.left.id = null;
        } else if ( clients.right.id == socket.id ) {
            clients.right.id = null;
        }
        console.log('user disconnected');
    });


    socket.on('ready', function(){
        socket.on('kick', function(msg){
            //if ( socket.id != clients.left.id && socket.id != clients.right.id ) {
            //    // you ain't playin, buddy
            //    return;
            //}
            console.log("We're supposed to kick a ball");
            balls.map( function(ball,i) {
                console.log("Testing ball with id " + ball.ballid + " against " + msg.ballid);
                if ( ball.ballid == msg.ballid ) {
                    console.log("Kicking ball");
                    ball.velocity[0] += msg.kick.x*2/20;
                    ball.velocity[1] -= msg.kick.y*2/20;
                }
            });
        });
        if ( !clients.left.id ) { 
            clients.left = { id: socket.id, money: 0 };
            socket.emit('left');
            console.log("waiting for one more...");
            console.log(clients);
        } else if ( !clients.right.id ) {
            clients.right = { id: socket.id, money: 0 };
            socket.emit('right');
            console.log("lets get it on!");
            console.log(clients);
            var timeStep = 1/40;
            physicsLoop = setInterval( function() { 
                world.step(timeStep); 
                sendPhysicsUpdate(); 
                //console.log(ball.position);
            }, 1000*timeStep );
        } else { // two people already playing
            console.log("Sorry, buddy, we're full...")
            return;
        }
        
        if ( clients.left.id && clients.right.id ) {
            setUpWorld();
            b = spawnBall( (650)/2/20,100/20, -5, 0, curid );
            io.emit('spawnBall', { x: (650)/2, y: 100, vx: 0, vy: 0, id:curid });
            curid++;
            lastGoal = world.time;
        }
    });

});
