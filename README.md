# Bounce Your Buddy
Written for HackRice 2016 (Jan 15-17)

## Description
Bounce Your Buddy is a smartphone-compatible multiplayer game written on top of [Phaser.io](http://phaser.io) and [node.js](http://nodejs.org) with [socket.io](http://socket.io/) for networking.

Just a simple little soccer-like game where users click/tap to pull the ball towards the cursor, expending "click power" (green bar) to do so.  Score on your opponent, get a point and some virtual money that means literally nothing right now.  The longer it's been since the last goal, the more valueless currency you are rewarded with!

## Technical details
The heart of Bounce Your Buddy is decoupling the physics from the client side.  A copy of the [p2.js](https://github.com/schteppe/p2.js) library runs on the server side and manages the physics authoritatively, sending physics update info to the clients over the established sockets and responding to requests to kick the ball.  The client-side physics engines do all the heavy lifting of interpolating between updates, but defer to the server-side engine whenever an update comes along.  Right now, the way this is integrated means the game is very intolerant of latency, but aggressive interpolation might be able to fix this.

![](https://david-dm.org/snoopjedi/bounceyourbuddy.svg)
