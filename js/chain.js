var margin = 10;
var game = new Phaser.Game(window.innerWidth-margin*2, window.innerHeight-margin*2, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });
game.focusLoss = function() {};

function preload() {

    game.load.image('clouds', 'assets/misc/clouds.jpg');
    //game.load.spritesheet('chain', 'assets/sprites/chain.png', 16, 26);
    game.load.spritesheet('ball', 'assets/sprites/ball.png', 32, 32);
    game.load.spritesheet('wall', 'assets/sprites/wall.png', 32, 32);

}

var myrect;
function update() {
    $("#fps").text("FPS: " + game.time.fps);

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

    game.add.tileSprite(0, 0, game.width, game.height, 'clouds');

    game.physics.startSystem(Phaser.Physics.ARCADE);
    //game.physics.arcade.gravity.set(0,1200);

    game.time.advancedTiming = true

    //  Length, xAnchor, yAnchor
    //createRope(40, 400, 64);

    var numballs = 5;
    for ( var i=0; i <= numballs; i++ ) {
        b = makeABall(game.width*Math.random(),game.height*Math.random(),1000*(Math.random()-0.5)*2,1000*(Math.random()-0.5)*2);
    }
    
    game.grid = Array.apply(null,Array( Math.floor(game.width/32) ))
    game.grid = game.grid.map( function(x,i) { return Array( Math.floor(game.height/32) ) } )

    game.input.onDown.add( function(sig) { 
        //console.log(sig)
        var x = sig.position.x;
        var y = sig.position.y;
        if ( sig.leftButton.shiftKey ) {
            var vx = 1000*(Math.random()-0.5)*2;
            var vy = 1000*(Math.random()-0.5)*2;
            b = makeABall(x,y,vx,vy);
            b.b
        } else {
            // if a wall doesn't already exist, make one
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
    });

}


function makeABall(x,y,vx,vy) {
    var ball = game.add.sprite(x, y, 'ball', 0);
    ball.bringToTop();

    ball.tint = Math.floor( 0xFFFFFF * Math.random() ) + 0x777777;
    
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.body.collideWorldBounds = true;
    ball.body.bounce.setTo(1.0,1.0);
    ball.body.velocity.setTo(vx,vy);
    balls.push( ball );
    return ball;
}

