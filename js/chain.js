var margin = 10;
//var width = window.innerWidth-margin*2;
//var height = window.innerHeight-margin*2;
var BALLSPAWNDELAY = 100;
//var width = 1000-margin*2;
//var height = 800-margin*2;
var width = 360 - margin*2;
var height = 550 - margin*2;
var maxvel = 1000;
var game = new Phaser.Game(width, height, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });
game.focusLoss = function() {};

function preload() {

    // courtesy of Amon, CC-BY-SA 3.0 ( www.amon.co )
    // http://opengameart.org/content/football-pitch
    game.load.image('pitch', 'assets/misc/pitch.png');
    //game.load.spritesheet('chain', 'assets/sprites/chain.png', 16, 26);
    //game.load.spritesheet('ball', 'assets/sprites/ball.png', 32, 32);

    // courtesy of alpha_rats, CC-BY 3.0
    // http://opengameart.org/content/bricks-tiled-texture-64x64
    game.load.image('ball', 'assets/sprites/SoccerBall.png');
    // courtesy of gothicfan95, CC0
    // http://opengameart.org/content/soccer-ball
    game.load.image('wall', 'assets/sprites/wall.png');

    game.lastballtime = 0;
}

var myrect;
function update() {
    if (game.fps instanceof Phaser.Text){
        game.fps.text = "FPS: " + game.time.fps;
    } else {
        game.fps = game.add.text(0,0,"FPS:");
    }

    if (game.ptrs instanceof Phaser.Text){
        game.ptrs.text = "Pointers active: " + game.input.countActivePointers();
    } else {
        game.ptrs = game.add.text(0,25,"Pointers active:");
    }

    if (game.input.activePointer.isDown && game.input.activePointer.y < game.height-32) {

        sig = game.input.activePointer;
        console.log(sig)
        var x = sig.position.x;
        var y = sig.position.y;
        if ( game.input.keyboard.isDown( Phaser.KeyCode.ALT ) ) {
        } else if ( game.input.keyboard.isDown( Phaser.KeyCode.SHIFT ) && game.time.now-game.lastballtime > BALLSPAWNDELAY ) {
            game.lastballtime = game.time.now;
            var vx = 1000*(Math.random()-0.5)*2;
            var vy = 1000*(Math.random()-0.5)*2;
            b = makeABall(x,y,vx,vy);
        } else {
            balls.map( function(b,i) { 
                dv = Phaser.Point.subtract(sig.position,b.body.position);
                dvn = dv.normalize();
                Ldv = dv.getMagnitude();
                dvx = Math.sqrt(Ldv)*50*dvn.x;
                dvy = Math.sqrt(Ldv)*50*dvn.y;
                // multitouch -> repelling the balls
                if ( game.input.countActivePointers() > 1 ) {
                    dvx *= -1;
                    dvy *= -1;
                }
                b.body.velocity = b.body.velocity.add(dvx,dvy); 
                b.body.velocity.clamp(-maxvel,maxvel);
                
            })
        }
    }

    objs = game.world.children;
    // start at 1 to skip the background
    for ( var i=1; i < objs.length; i++ ) {
        for ( var j=0; j < objs.length; j++ ) {
            game.physics.arcade.collide(objs[i],objs[j])
        }
    }
}

var balls = [];
var walls = [];
var longwall;
function create() {

    game.world.setBounds(0,0,game.width,game.height-32);
    var background = game.add.sprite(0, 0, 'pitch' );
    background.width = game.width;
    background.height = game.height-32;

    game.physics.startSystem(Phaser.Physics.ARCADE);
    //game.physics.arcade.gravity.set(0,1200);

    game.time.advancedTiming = true

    //  Length, xAnchor, yAnchor
    //createRope(40, 400, 64);

    var numballs = 5;
    for ( var i=0; i < numballs; i++ ) {
        b = makeABall(game.width*Math.random(),game.height*Math.random(),1000*(Math.random()-0.5)*2,1000*(Math.random()-0.5)*2);
    }
    
    game.grid = Array.apply(null,Array( Math.floor(game.width/32) ))
    game.grid = game.grid.map( function(x,i) { return Array( Math.floor(game.height/32) ) } )

    //var numwalls = 10;
    //for ( var i=0; i < numwalls; i++ ) {
    //    w = toggleWall(Math.random()*game.width, Math.random()*game.height);
    //}


    game.canvas.style.setProperty("position","relative");
    game.canvas.style.setProperty("left",""+margin+"px");
    game.canvas.style.setProperty("top",""+margin+"px");

    game.input.onDown.add( function(s) {
        var x = s.position.x;
        var y = s.position.y;
        if( game.input.keyboard.isDown( Phaser.KeyCode.ALT && y > game.height-32 ) ) {
            toggleWall(x,y);
        }
    })
}

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
        }
}

function makeABall(x,y,vx,vy) {
    var ball = game.add.sprite(x, y, 'ball', 0);
    ball.bringToTop();

    ball.tint = Math.floor( 0xFFFFFF * Math.random() ) + 0x777777;
    
    ball.width = 32
    ball.height = 32
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.body.collideWorldBounds = true;
    ball.body.gravity.set(0,1000);
    ball.body.bounce.setTo(0.9,0.9);
    ball.body.velocity.setTo(vx,vy);
    balls.push( ball );
    return ball;
}

