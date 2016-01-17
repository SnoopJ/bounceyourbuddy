var margin = 10;
//var width = window.innerWidth-margin*2;
//var height = window.innerHeight-margin*2;
var height = 360 - margin*2;
var width = 550 - margin*2;

var CLICKPOWERRATE = 1/10;
var BOUNCEDELAY = 100;
var MAXBOUNCES = 8;
var BALLSPAWNDELAY = 100;
var BALLKICKDELAY = 250;
var BALLKICKDURATION = 40;
var MAXVEL = 1000;

var game = new Phaser.Game(width, height, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });
game.focusLoss = function() {};

function render() {
    balls.map( function(b,i) { 
        if ( b.collidesWorld() && game.time.now - game.lastBounce > BOUNCEDELAY && Math.abs(b.deltaY) > 1 ) { 
            game.lastBounce = game.time.now
            bounceSnd.play() 
        }
    })
    //game.debug.cameraInfo(game.camera, 32, 32);
}
function preload() {

    // courtesy of Amon, CC-BY-SA 3.0 ( www.amon.co )
    // http://opengameart.org/content/football-pitch
    //game.load.image('pitch', 'assets/misc/pitch.png');
    game.load.image('pitch', 'assets/misc/clouds.jpg');
    //game.load.spritesheet('chain', 'assets/sprites/chain.png', 16, 26);
    //game.load.spritesheet('ball', 'assets/sprites/ball.png', 32, 32);

    // courtesy of alpha_rats, CC-BY 3.0
    // http://opengameart.org/content/bricks-tiled-texture-64x64
    game.load.image('ball', 'assets/sprites/SoccerBall.png');
    // courtesy of gothicfan95, CC0
    // http://opengameart.org/content/soccer-ball
    game.load.image('wall', 'assets/sprites/wall.png');

    game.lastballtime = 0;
    game.camera.bounds = null; // let that camera wander

    // courtesy of paulw2k CC-BY 3.0
    // https://freesound.org/people/paulw2k/sounds/196461/
    game.load.audio('goal', 'assets/audio/football.mp3');

    // courtesy of andre.rocha.nascimento CC-BY 3.0
    // https://freesound.org/people/andre.rocha.nascimento/sounds/51461/
    game.load.audio('bounce', 'assets/audio/bounce.wav');
}

var bounces=[];
var clients;
function update() {

    game.clickpower = Math.min(100,game.clickpower + CLICKPOWERRATE);
    var centerx = 0;
    var centery = 0;
    for ( var i=0; i < balls.length; i++ ){
        centerx += balls[i].x
        centery += balls[i].y
    }
    centerx *= 1/(balls.length);
    centery *= 1/(balls.length);
    //game.camera.x += 0.09*(centerx-game.camera.position.x);
    //game.camera.y += 0.09*(centery-game.camera.position.y);

    //if (game.fps instanceof Phaser.Text ) {
    //    game.fps.text = "FPS: " + game.time.fps;
    //} else {
    //    game.fps = game.add.text(0,0,"FPS:");
    //}

    if (game.dbg instanceof Phaser.Text ) {
        game.dbg.text = "$(YOU): " + game.money[0] + 
            " \n$(OPPONENT): " + game.money[1] +
            " \nScore: " + game.pts;
    } else {
        game.dbg = game.add.text(0,0,"");
    }

    //if (game.ptrs instanceof Phaser.Text ) {
    //    game.ptrs.text = "Pointers active: " + game.input.countActivePointers();
    //} else {
    //    game.ptrs = game.add.text(0,25,"Pointers active:");
    //}


    game.powergauge.width = game.clickpower / 2;
    game.powergauge.tint = game.clickpower > 20 ? 0x00ff00 : 0xff0000;
    //if (game.power instanceof Phaser.Rectangle ) {
    //    game.power.text = "Click Power: " + Math.floor(game.clickpower);
    //} else {
    //    game.power = game.add.text(0,75,"Click Power:");
    //}

    p = game.input.activePointer;
    if (p.isDown && p.y < game.height-32) {

        //console.log(sig)
        var x = p.position.x;
        var y = p.position.y;
        //if ( game.input.countActivePointers() > 1 && game.time.now-game.lastballtime > BALLSPAWNDELAY) {
        //    x = game.width/2;
        //    y = game.height;
        //    game.lastballtime = game.time.now;
        //    var vx = 300*(Math.random()-0.5)*2;
        //    var vy = 300*(Math.random()-0.5)*2;
        //    b = makeBall(x,y,vx,vy);
        //}

        if ( game.input.keyboard.isDown( Phaser.KeyCode.ALT ) ) {
        } else if ( game.input.keyboard.isDown( Phaser.KeyCode.SHIFT )  ) {
            if ( game.time.now-game.lastballtime > BALLSPAWNDELAY ) {
                game.lastballtime = game.time.now;
                var vx = 300*(Math.random()-0.5)*2;
                var vy = 300*(Math.random()-0.5)*2;
                b = makeBall(x,y,vx,vy);
            }
        } else {
            balls.map( function(b,i) { 
                if ( b.collidesWorld() ) { 
                    bounceSnd.play() 
                }
                if ( game.clickpower > 5 && game.time.now - b.body.lastKick > BALLKICKDELAY  ) {
                    game.clickpower -= 10;
                    dv = new Phaser.Point();
                    dv.x = p.position.x - b.position.x;
                    dv.y = p.position.y - b.position.y;
                    dvn = dv.normalize();
                    Ldv = dv.getMagnitude();
                    dv = dvn.multiply(200,140);
                    //dvx = Math.sqrt(Ldv)*50*dvn.x;
                    //dvy = Math.sqrt(Ldv)*50*dvn.y;
                    // multitouch -> repelling the balls
                    //if ( game.input.countActivePointers() > 1 ) {
                    //    dv.multiply(-1,-1);
                    //}
                    //b.body.velocity = b.body.velocity.add(dvx,dvy); 
                    b.body.kick = dv; 
                    socket.emit('kick', { 'ballid': b.ballid, 'kick': dv });
                    b.body.lastKick = game.time.now;
                }
            })
        }
    }

    for ( var i=0; i < balls.length; i++ ) {
        b = balls[i];
        if ( game.time.now-b.body.lastKick < BALLKICKDURATION ) {
            b.body.velocity.x = b.body.kick.x + b.body.velocity.x;
            b.body.velocity.y = b.body.kick.y + b.body.velocity.y;
            b.body.velocity.x = Math.min( Math.max( b.body.velocity.x, -MAXVEL ) ,MAXVEL);
            b.body.velocity.y = Math.min( Math.max( b.body.velocity.y, -MAXVEL ) ,MAXVEL);
        } 
    }
}

var balls = [];
var longwall;
function create() {

    game.money = [0,0];
    game.nextPointPrice = 200;
    game.clickpower = 100;
    game.pts = [0,0];
    game.lastBounce = 0;
    game.bounces = 0;
    goalSnd = game.sound.add('goal');
    bounceSnd = game.sound.add('bounce');
    //game.sound.setDecodedCallback([ goal ], start, this);

    game.world.setBounds(0,0,game.width,game.height-32);

    var background = game.add.sprite(0, 0, 'pitch' );
    background.width = game.width;
    background.height = game.height-32;

    //game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.update = function() { 
        game.physics.p2.update() 
    };
    //game.physics.arcade.gravity.set(0,1200);

    game.time.advancedTiming = true

    //  Length, xAnchor, yAnchor
    //createRope(40, 400, 64);

    goalR = makeGoal(game.width-50/2,game.height-game.height/3/2-32,50,game.height/3,0,'#ff0000');
    goalL = makeGoal(50/2,game.height-game.height/3/2-32,50,game.height/3,1,'#0000ff');

    //var numballs = 1;
    //for ( var i=0; i < numballs; i++ ) {
    //    b = makeBall(game.width/2,game.height/2,0*1000*(Math.random()-0.5)*2,0*1000*(Math.random()-0.5)*2);
    //}
    
    game.grid = Array.apply(null,Array( Math.floor(game.width/32) ))
    game.grid = game.grid.map( function(x,i) { return Array( Math.floor(game.height/32) ) } )

    //var numwalls = 10;
    //for ( var i=0; i < numwalls; i++ ) {
    //    w = toggleWall(Math.random()*game.width, Math.random()*game.height);
    //}


    game.canvas.style.setProperty("position","relative");
    game.canvas.style.setProperty("left",""+margin+"px");
    game.canvas.style.setProperty("top",""+margin+"px");

    game.powergauge = (function() {
        var bmd = game.add.bitmapData(200, 25);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, 200, 25);
        bmd.ctx.fillStyle = '#ffffff';
        bmd.ctx.fill();
        gauge = game.add.sprite(5,75,bmd);
        return gauge;
    })();

    makeSprite(0,game.height-32,game.width,32,'#008800');

    //game.add.button( game.width/2 - 50, game.height-32, 'wall', function() { console.log("button press") } )

    socket.on('money', function(clients) {
        client = clientId ? clients.left : clients.right;
        opponent = !clientId ? clients.left : clients.right;
        game.money[0] = client.money;
        game.money[1] = opponent.money;
        console.log("you have " + client.money + " funds!");
    });
    socket.on('reset', function() {
        balls.map( function(b,i) {
            destroyBall(b);
        });
    });
    socket.on('spawnBall', function(msg) {
        makeBall(msg.x,msg.y,msg.vx,msg.vy,msg.id)
    });
    
    socket.emit('ready');

}

function destroyBall(b) {
    balls.splice( balls.indexOf(b), 1 );
    b.body.onEndContact.removeAll();
    b.destroy(true);
}

var socket = io();
socket.on('goal', function(data) {
    console.log("GOAL GOAL GOAL GOAAAAAAAAL");
    console.log(data);
    console.log("Scored against goal " + data.scoredon);
    if (data.scoredon == "left") {
        game.pts[1]++;
        if ( game.pts[1] >= 5 ) {
            console.log("right wins!");
        }
    } else if (data.scoredon == "right") {
        game.pts[0]++;
        if ( game.pts[0] >= 5 ) {
            console.log("left wins!");
        }
    } else {
        console.log( "uh...I dunno who scored that one." )
    }
});

var clientId;

socket.on('left', function(side) {
    clientId = 0;
});

socket.on('right', function(side) {
    clientId = 1;
});

socket.on('update',function(res) { 
    //console.log(res) 
    updatePhysics(res);
});

function toggleWall(x,y) {
        obj = game.grid[ Math.floor(x/32) ][ Math.floor(y/32) ]
        if ( obj instanceof Phaser.TileSprite ) { 
            obj.destroy()
            game.grid[ Math.floor(x/32) ][ Math.floor(y/32) ] = undefined;
        } else {
            var wall = game.add.tileSprite(Math.floor(x/32)*32, Math.floor(y/32)*32, 32, 32, 'wall');
            game.physics.enable( wall, Phaser.Physics.ARCADE )
            wall.body.immovable = true;
            game.grid[ Math.floor(x/32) ][ Math.floor(y/32) ] = wall;
            walls.push(wall)
        }
}


function makeBall(x,y,vx,vy,id) {
//    socket.emit('spawnBall',{
//        id: ballid,
//        x:x/20,
//        y:y/20, 
//        //x:(530-300)/20,
//        //y:300/20, 
//        vx:vx/20, 
//        vy:vy/20
//    });

    var ball = game.add.sprite(x, y, 'ball', 0);
    ball.bringToTop();

    ball.tint = Math.floor( 0xFFFFFF * Math.random() ) + 0x777777;
    
    ball.width = 16
    ball.height = 16
    ball.ballid = id;

    // P2 PHYSICS
    game.physics.p2.enable(ball, false);
    //game.physics.p2.gravity.y = 800;
    game.physics.p2.restitution = 1;
    
    ball.body.mass = 1;
    //ball.body.collideWorldBounds = false; // disable world collision
    ball.body.velocity.x = vx;
    ball.body.velocity.y = vy;
    ball.body.onEndContact.add( function() { 
        if ( game.time.now - game.lastBounce > BOUNCEDELAY && Math.abs(this.body.velocity.y) > 1 ) {
            game.lastBounce = game.time.now;
            bounceSnd.play(); 
        }
    },ball)

    ball.body.lastKick = 0;

    ball.collidesWorld = function() {
        return false;
        //return ( this.body.blocked.up || this.body.blocked.down || this.body.blocked.left || this.body.blocked.right )
    }

    balls.push( ball );
    return ball;
}

function makeSprite(x,y,width,height,color) {
    var bmd = game.add.bitmapData(width, height);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, width, height);
    bmd.ctx.fillStyle = color;
    bmd.ctx.fill();
    sprite = game.add.sprite(x,y, bmd);
    return sprite;
}

function makeGoal(x,y,width,height,idx,color) {
    var goal;
     
    goal = makeSprite(x,y,width,height,color);
    goal.anchor.setTo(0.5, 0.5);
    //game.physics.enable( goal, Phaser.Physics.ARCADE )
    game.physics.p2.enable( goal, false )
    //goal.body.immovable = true;
    goal.body.static = true;
    goal.body.data.shapes[0].sensor = true
    goal.body.onBeginContact.add( function(s) { 
        ball = s.sprite;
        //balls.splice( balls.indexOf(s.sprite), 1 )
        ball.body.onEndContact.removeAll();
        //ball.destroy();
        if ( !goalSnd.isPlaying ) {
            goalSnd.play();
        }
        //game.pts[idx]++;    
        //console.log( balls.indexOf(s.sprite) ) 
    })
    return goal;
}

function updatePhysics(update) {
        balls.map( function(b,i) {
            if ( b.ballid != update.id ) {
                return false;
            }
//            console.log(update);
            b.body.x = update.update.x*20; 
            b.body.y = game.height-32-update.update.y*20; 
            //b.body.data.position[1] = (game.height - 32)/-20 - update.y/20;
            //console.log(b.body.data.position[1]);
            b.body.velocity.x = update.update.vx*20;
            b.body.velocity.y = -update.update.vy*20;
        })
}
