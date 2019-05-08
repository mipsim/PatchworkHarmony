'use strict'

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser');
var platforms;

var MainMenu = function(game) {};
MainMenu.prototype = {
	init: function() {
		// initialize score to 0
		this.score = 0;
	},
	preload: function() {
		console.log('MainMenu: preload');

		this.load.path = 'assets/';
		game.load.image('bg', 'img/bg.jpg');
		this.load.atlas('atlas', 'img/spritesheet.png', 'img/sprites.json');


	},
	create: function() {
		console.log('MainMenu: create');
	},
	update: function() {
		// go to next state
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			game.state.start('Play');
		}
	}
}

var Play = function(game) {};
Play.prototype = {
	init: function() {
		// reset score on each playthrough
	},
	preload: function() {
		console.log('Play: preload');
	},
	create: function() {
		console.log('Play: create');
		this.numPlatforms = 0;

		this.bg = game.add.image(0, 0, 'bg');
		game.world.setBounds(0, 0, this.bg.width, this.bg.height);
		// create player
		this.player = game.add.sprite(40, 400, 'atlas', 'furretWalk0001');
		this.player.anchor.set(0.5);
		this.player.facing = "RIGHT";

		// enable physics for the player
		game.physics.arcade.enable(this.player);

		// adjust physics properties for the player
		this.player.body.gravity.y = 300;
		this.player.body.collideWorldBounds = true;

		this.player.animations.add('right', Phaser.Animation.generateFrameNames('furretWalk', 1, 4, '', 4), 10, true);
		this.player.animations.add('left', Phaser.Animation.generateFrameNames('furretWalk', 5, 8, '', 4), 10, true);
		this.player.animations.add('idleRight', ['furretWalk0001'], 30, false);
		this.player.animations.add('idleLeft', ['furretWalk0005'], 30, false);
	
		// create box
		this.box = game.add.sprite(300, 300, 'atlas', 'sky');
		this.box.anchor.set(0.5);
		this.box.scale.set(0.5);
		game.physics.arcade.enable(this.box);
		this.box.body.gravity.y = 300;
		this.box.body.collideWorldBounds = true;
		this.box.body.drag = 0.5;
		this.attached = false;
		// this.box.body.immovable = true;

		platforms = game.add.group();
		// game.physics.arcade.enable(platforms);
		platforms.enableBody = true;
		// platforms.body.immovable = true;

		this.ground = platforms.create(-64, 500, 'atlas', 'sky');
		this.ground.scale.setTo(10, 1);
		game.physics.arcade.enable(this.ground);
		this.ground.body.immovable = true;

		this.switch = new Switch(game, 'atlas', 'apple', 2	200, 400);
	},
	update: function() {
		console.log(this.player.facing);
		this.checkCamBounds();
		// enable player collision
		this.hitPlatform = game.physics.arcade.collide(this.player, platforms);
		this.hitPlatformBox = game.physics.arcade.collide(this.box, platforms);
		this.solidBox = game.physics.arcade.collide(this.player, this.box);

		this.box.body.velocity.x = 0;

		// enable Phaser's Keyboard Manager
		this.cursors = game.input.keyboard.createCursorKeys();
 		
 		// if nothing pressed, velocity = 0
		this.player.body.velocity.x = 0;
 		//move left and right, slowed as belly gets low
		if(this.cursors.left.isDown) {
			// move left
			this.player.body.velocity.x = -250;
			this.player.animations.play('left');
			this.player.facing = "LEFT";
		}
		else if(this.cursors.right.isDown) {
			// move right
			this.player.body.velocity.x = 250;
			this.player.animations.play('right');
			this.player.facing = "RIGHT";
		}
		else { // stand "still"
			this.player.body.velocity.x = 0;
			this.player.animations.stop();
			if(this.player.facing == 'RIGHT') {
				this.player.animations.play('idleRight');
			}
			else {
				this.player.animations.play('idleLeft');
			}
		}

		// when holding the box
		if(this.attached) {
			if(this.player.facing == "RIGHT") { // when facing right, the box is immediately to the player's right
				this.box.x = this.player.x + this.player.width/2 + this.box.width/2 + 1;
			}
			else{ // when facing left, the box is immediately to the player's left
				this.box.x = this.player.x - this.player.width/2 - this.box.width/2 + 1;	
			}
			this.box.y = this.player.y;	// the box is off the ground
			this.box.body.gravity.y = 0; // box doesn't fall when you're holding it

			// spawn platform
			if(game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).justPressed()) { 
				this.createdPlatform = new Platform(game, 'atlas', 'sky', this.player.x, this.player.y + this.player.height/2 + 20);
				platforms.add(this.createdPlatform); 
				game.physics.arcade.enable(this.createdPlatform);
				this.createdPlatform.body.immovable = true;
			}

			// drop the box
			if(game.input.keyboard.addKey(Phaser.KeyCode.SHIFT).justPressed()) {
				this.attached = false;
			}
		}
		// when not holding the box
		else {
			this.box.body.gravity.y = 300;	// box falls
			// pick up box from left
			if(game.input.keyboard.addKey(this.player.facing == 'RIGHT' && Phaser.KeyCode.SHIFT).justPressed() && this.hitPlatform && Math.abs((this.player.x + this.player.width/2) - (this.box.x - this.box.width/2)) <= 2) {
				this.attached = true;
			}
			// pick up box from right
			if(game.input.keyboard.addKey(this.player.facing == 'LEFT' && Phaser.KeyCode.SHIFT).justPressed() && this.hitPlatform && Math.abs((this.player.x - this.player.width/2) - (this.box.x + this.box.width/2)) <= 2) {
				this.attached = true;
			}
		}
		// jump if the player is grounded
		if(this.cursors.up.isDown && this.player.body.touching.down && this.hitPlatform) {
			this.player.body.velocity.y = -300;
			// this.player.animations.play('jump');
		}
	},
	render: function() {
		game.debug.cameraInfo(game.camera, 32, 32);
		//game.debug.rectangle({x:game.camera.bounds.x, y:game.camera.bounds.y, width:game.camera.bounds.width, height:game.camera.bounds.height});
	},
	checkCamBounds: function() {
		// some funky, funky logic to check camera bounds for player movement
		if(this.player.x + Math.abs(this.player.width/2) > game.width + game.camera.x && !this.player.body.blocked.right /*&& this.player.facing === "RIGHT"*/) {
			// move camera, then player
			game.camera.x += game.width;
			this.player.x = game.camera.x + Math.abs(this.player.width/2);	
		} else if(this.player.x - Math.abs(this.player.width/2) < game.camera.x && !this.player.body.blocked.left /*&& this.player.facing === "LEFT"*/) {
			// move camera, then player
			game.camera.x -= game.width;
			this.player.x = game.camera.x + game.width - Math.abs(this.player.width/2);	
		} 
		// else if(this.player.y + Math.abs(this.player.height/2) > game.height + game.camera.y && !this.player.body.blocked.down /*&& this.player.facing === "DOWN"*/) {
		// 	// move camera, then player
		// 	game.camera.y += game.height;
		// 	this.player.y = game.camera.y + Math.abs(this.player.height/2);	
		// } else if(this.player.y - Math.abs(this.player.height/2) < game.camera.y && !this.player.body.blocked.up /*&& this.player.facing === "UP"*/) {
		// 	// move camera, then player
		// 	game.camera.y -= game.height;
		// 	this.player.y = game.camera.y + game.height - Math.abs(this.player.height/2);	
		// }
	}
}

var GameOver = function(game) {};
GameOver.prototype = {
	init: function(score) {
		// score carries over from play state
		this.score = score;
	},
	preload: function() {
		console.log('GameOver: preload');
	},
	create: function() {
		console.log('GameOver: create');

		// display game over messages
		this.gameOverMessage = game.add.text(game.world.centerX, game.world.centerY - 48, "GAME OVER", style1);
		this.gameOverMessage.anchor.set(0.5);
		this.resetMessage = game.add.text(game.world.centerX, game.world.centerY + 36, "Press SPACEBAR to restart", style2);
		this.resetMessage.anchor.set(0.5);
	},
	update: function() {
		// go back to play state
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			game.state.start('Play');
		}
	}
}

game.state.add('MainMenu', MainMenu);
game.state.add('Play', Play);
game.state.add('GameOver', GameOver);
game.state.start('MainMenu');
