// Library level state, top half
var Level4 = function(game) {};
Level4.prototype = {

	init: function(bgmOn, numPlatforms, reloadOnGround) {
		this.numPlatforms = numPlatforms;
		this.reloadOnGround = reloadOnGround;
		self = this;	

		this.levelScale = 1;
		this.level = 4;
		this.bgmOn = bgmOn;
		inElevator = false;
		this.cutscenePlaying = false;
		this.levelScale = 1.0;

		this.bookTop = true;
		this.bookTop2 = true;
		this.platformFallingPlayed = false;

		this.timer = 0;
		this.slideAway = 0;

		this.lockAudioPlayed = false;
		this.pauseMenuOpen = false;
	},
	create: function() {
		/***** BG, BGM, AND SOUND EFFECTS *****/
		// Create backgrounds for top floor of the library level, set bounds to image resolution (3200 x 600)
		this.bg0 = game.add.image(-1600, 0, 'lvl3-bg', 'bg8'); // Background 8 (spring and lever)
		this.bg1 = game.add.image(-800, 0, 'lvl3-bg', 'bg7');  // Background 7 (flying books)
		this.bg2 = game.add.image(0, 0, 'lvl3-bg', 'bg4');     // Background 4 (elevator top floor)
		this.bg3 = game.add.image(800, 0, 'lvl3-bg', 'bg6');   // Background 6 (keys and exit)
		game.world.setBounds(-1600, 0, 3200, this.bg1.height);

		// Create bgm for game, looped and played
		if(this.bgmOn == false) {
			this.bgm = game.add.audio('lvl3', 0.25, true);
			this.bgm.play();
			this.bgmOn = true;
		}

		// Create menu sfx
		this.optionsOpen = game.add.audio('options-open', 0.5, false);
		this.optionsClose = game.add.audio('options-close', 0.5, false);

		// Create sound effect for pickup/drop item
		this.pickup = game.add.audio('pickup', 0.5, false);
		this.drop = game.add.audio('drop', 0.5, false);

		// Create sound effects for when a music block platform is created
		this.platform1audio = game.add.audio('platform1audio', 0.5, false);
		this.platform2audio = game.add.audio('platform2audio', 0.5, false);
		this.platform3audio = game.add.audio('platform3audio', 0.5, false);
		this.platform4audio = game.add.audio('platform4audio', 0.5, false);

		// Creates sound effect for triggering the switch
		this.switchTrigger = game.add.audio('switchTrigger');

		// Create bounce sound for spring
		this.bounce = game.add.audio('trampoline', 0.1, false);

		// Create sound effect for elevator
		this.elevatorNoise = game.add.audio('elevator', 0.5, false);

		// Creates sound effect for music block locking into place
		this.lockAudio = game.add.audio('locking', 1, false);

		// Creates sound effect for falling platform
		this.platformFalling = game.add.audio('platform-break', 0.5, false);

		/***** SWITCH MECHANIC *****/
		this.switches = game.add.group();
		this.switches.enableBody = true;

		// Creates the button for the switch, only if elevator not activated
		if(!elevatorActivated){
			this.switch = new Switch(game, 'assets', 'switch-button', 650, 270); 
			this.switches.add(this.switch);
			this.switch.body.immovable = true;
			this.switch.scale.setTo(0.1, 0.125);
		}
	
		/***** GROUPS AND INVISIBLE BOUNDARIES *****/
		// Create lever group
		levers = game.add.group();
		levers.enableBody = true;

		// Create elevators group
		this.elevators = game.add.group();
		this.elevators.enableBody = true;

		// Create platforms group
		platforms = game.add.group();
		platforms.enableBody = true;

		//Create createdPlatforms group
		this.createdPlatforms = game.add.group();
		this.createdPlatforms.enableBody = true;

		// Create invisible ground platform for player to stand on, extends all four bgs
		this.ground = platforms.create(-1600, 535, 'atlas', 'sky'); 
		this.ground.scale.setTo(25, 1);
		game.physics.arcade.enable(this.ground);
		this.ground.body.immovable = true;
		this.ground.visible = false;

		// Create invisible ceiling platform for player to hit their little heads on, extends all four bgs 
		this.ceiling = platforms.create(-1600, 0, 'atlas', 'sky'); 
		this.ceiling.scale.setTo(25, 0.4);
		game.physics.arcade.enable(this.ceiling);
		this.ceiling.body.immovable = true;
		this.ceiling.visible = false;

		/***** ELEVATOR ROOM (BG2) *****/
		// Creates an elevator that brings player down to bottom floor, starts closed and unpowered 
		// If global var elevatorActivated, then always create the elevator sprite as powered and open instead of unpowered and closed
		if(elevatorActivated){
			this.elevator = this.elevators.create(310, 320, 'lvl3', 'elevator3'); 
			this.elevator.scale.setTo(0.5);
			game.physics.arcade.enable(this.elevator);
			this.elevator.body.immovable = true;
			this.elevator.body.checkCollision.up = false;
		    this.elevator.body.checkCollision.down = false;
		    this.elevator.body.checkCollision.left = false;
		    this.elevator.body.checkCollision.right = false;
		}

		if(!elevatorActivated) {
			this.elevator = this.elevators.create(310, 320, 'lvl3', 'elevator1'); 
			this.elevator.scale.setTo(0.5);
			game.physics.arcade.enable(this.elevator);
			this.elevator.body.immovable = true;
			this.elevator.body.checkCollision.up = false;
		    this.elevator.body.checkCollision.down = false;
		    this.elevator.body.checkCollision.left = false;
		    this.elevator.body.checkCollision.right = false;

			// Creates a visible platform that the switch rests on, only if elevator not activated 
			this.activatedPlatform = platforms.create(570, 270, 'assets', 'shelf-platform');
			this.activatedPlatform.scale.setTo(0.45, 0.45);
			game.physics.arcade.enable(this.activatedPlatform);
			this.activatedPlatform.body.immovable = true;

			// Creates the switch holder that the button rests in, only if elevator not activated
			this.switchHolder = game.add.sprite(650, 270, 'assets', 'switch-holder');
			this.switchHolder.anchor.set(0.5, 1);
			platforms.add(this.switchHolder);
			this.switchHolder.scale.setTo(0.1, 0.125);
			this.switchHolder.body.immovable = true;
		}

		// Creates a visible platform for the elevator to rest on
		this.elevatorPlatform = platforms.create(255, 535, 'assets', 'shelf-platform');
		this.elevatorPlatform.scale.setTo(0.74, 0.50);
		game.physics.arcade.enable(this.elevatorPlatform);
		this.elevatorPlatform.body.immovable = true;

		if(!elevatorActivated){
			// Creates the left bookshelf that goes up when the switch is activated 
			this.shiftingWall1 = platforms.create(0, 50, 'lvl3', 'bookshelf1'); 
			this.shiftingWall1.scale.setTo(1, 1);
			game.physics.arcade.enable(this.shiftingWall1);
			this.shiftingWall1.body.immovable = true;
		}

		if(!wallShifted){
			// Creates the right bookshelf that goes up last gear is obtained 
			this.shiftingWall2 = platforms.create(700, 50, 'lvl3', 'bookshelf2'); 
			this.shiftingWall2.scale.setTo(1, 1);
			game.physics.arcade.enable(this.shiftingWall2);
			this.shiftingWall2.body.immovable = true;	
		}

		/***** FLYING BOOKS ROOM (BG1) *****/
		this.bookshelf = platforms.create(-800, 260, 'lvl3', 'bookshelf3'); 
		this.bookshelf.scale.setTo(1, 0.77);
		game.physics.arcade.enable(this.bookshelf);
		this.bookshelf.body.immovable = true;

		this.book1 = platforms.create(-600, 200, 'lvl3', 'book1'); 
		this.book1.scale.setTo(0.5, 0.5);
		game.physics.arcade.enable(this.book1);
		this.book1.body.immovable = true;
		this.book1.body.checkCollision.down = false;

		this.book2 = platforms.create(-400, 500, 'lvl3', 'book2'); 
		this.book2.scale.setTo(0.5, 0.5);
		game.physics.arcade.enable(this.book2);
		this.book2.body.immovable = true;
		this.book2.body.checkCollision.down = false;

		/***** LEVER AND SPRING ROOM (BG0) *****/		
		this.bookshelf2 = platforms.create(-900, 260, 'lvl3', 'bookshelf3'); 
		this.bookshelf2.scale.setTo(1, 0.77);
		game.physics.arcade.enable(this.bookshelf2);
		this.bookshelf2.body.immovable = true;

		// Creates an invisible leftmost wall 
		this.leftWall = platforms.create(-1600, 0, 'lvl3', 'bookshelf1'); 
		this.leftWall.scale.setTo(0.5, 1.5);
		game.physics.arcade.enable(this.leftWall);
		this.leftWall.body.immovable = true;
		this.leftWall.alpha = 0;

		if(!elevatorActivated){
			// Creates the lever bar handle, left side
			this.leverHandle = levers.create(-1540, 180, 'lvl3', 'lever-handle');
			this.leverHandle.scale.setTo(0.5);
			this.leverHandle.anchor.set(1);
			game.physics.arcade.enable(this.leverHandle);
			this.leverHandle.body.immovable = true;
			this.leverHandle.angle = 20;
			this.leverHandle.body.setSize(150, 300, 0, -50);
		}
		else{
			// Creates the lever bar handle, left side
			this.leverHandle = levers.create(-1540, 180, 'lvl3', 'lever-handle');
			this.leverHandle.scale.setTo(0.5);
			this.leverHandle.anchor.set(1);
			game.physics.arcade.enable(this.leverHandle);
			this.leverHandle.body.immovable = true;
			this.leverHandle.angle = 160;
			this.leverHandle.body.setSize(150, 300, 0, -50);
		}

		// Creates a base for the lever, left side
		this.leverBase = platforms.create(-1550, 150, 'lvl3', 'lever-base');
		this.leverBase.scale.setTo(0.5);
		game.physics.arcade.enable(this.leverBase);
		this.leverBase.body.immovable = true;

		// Creates a visible platform to get to the lever, right side
		this.bookshelfPlatform = platforms.create(-1550, 270, 'assets', 'shelf-platform');
		this.bookshelfPlatform.scale.setTo(0.35, 0.45);
		game.physics.arcade.enable(this.bookshelfPlatform);
		this.bookshelfPlatform.body.immovable = true;

		// Creates a visible platform to get to the lever, left side
		this.leverPlatform = platforms.create(-1050, 270, 'assets', 'shelf-platform');
		this.leverPlatform.scale.setTo(0.35, 0.45);
		game.physics.arcade.enable(this.leverPlatform);
		this.leverPlatform.body.immovable = true;

		// Creates a visible platform that falls when stepped on
		this.fallingPlatform = game.add.sprite(-1300, 270, 'assets', 'shelf-platform');
		this.fallingPlatform.scale.setTo(0.35, 0.45);
		game.physics.arcade.enable(this.fallingPlatform);
		this.fallingPlatform.body.immovable = true;

		// Creates a spring for the player to use to get back up
		this.spring = game.add.sprite(-1000, 500, 'lvl3', 'spring');
		game.physics.arcade.enable(this.spring);
		this.spring.anchor.set(0.50);
		this.spring.scale.set(0.25);
		this.spring.body.collideWorldBounds = false;
		this.spring.body.gravity.y = 300; 
		this.spring.body.drag = 0.5;
		this.holdingSpring = false; 

		/***** MISCELLANEOUS *****/
		if(!this.keySolved){
			this.key1 = game.add.sprite(1050, 230, 'assets', 'music-block');
			this.key1.anchor.set(0.5);
			this.key1.scale.set(0.33 * this.levelScale);
			this.key1.alpha = 0.5;
			this.key1Lock = false;

			this.key2 = game.add.sprite(1050, 340, 'assets', 'music-block');
			this.key2.anchor.set(0.5);
			this.key2.scale.set(0.33 * this.levelScale);
			this.key2.alpha = 0.5;
			this.key2Lock = false;

			this.key3 = game.add.sprite(1050, 450, 'assets', 'music-block');
			this.key3.anchor.set(0.5);
			this.key3.scale.set(0.33 * this.levelScale);
			this.key3.alpha = 0.5;
			this.key3Lock = false;

			this.keyLock = game.add.sprite(1200, 52, 'lvl3', 'bookshelf1');
			this.keyLock.scale.set(1);
			this.keyLock.anchor.setTo(0);
			game.physics.arcade.enable(this.keyLock);
			this.keyLock.body.immovable = true;	
		}


		this.rightWall = platforms.create(1580, 0, 'lvl3', 'bookshelf1');
		this.rightWall.scale.setTo(1, 1.5);
		game.physics.arcade.enable(this.rightWall);
		this.rightWall.body.immovable = true;
		this.rightWall.alpha = 0;

		this.door = game.add.sprite(1415, 265, 'atlas', 'sky');
		this.door.scale.setTo(1.5, 2.5);
		game.physics.arcade.enable(this.door);
		this.door.body.immovable = true;
		this.door.alpha = 0;

		// Create number circle at top left of screen to indicate platforms remaining
		this.numberPosition = 16;
		this.number0 = game.add.image(this.numberPosition, this.numberPosition, 'numbers', 'number0');
		this.number0.scale.set(0.5);
		this.number0.fixedToCamera = true;
		this.number1 = game.add.image(this.numberPosition, this.numberPosition, 'numbers', 'number1');
		this.number1.scale.set(0);
		this.number1.fixedToCamera = true;
		this.number2 = game.add.image(this.numberPosition, this.numberPosition, 'numbers', 'number2');
		this.number2.scale.set(0);
		this.number2.fixedToCamera = true;
		this.number3 = game.add.image(this.numberPosition, this.numberPosition, 'numbers', 'number3');
		this.number3.scale.set(0);
		this.number3.fixedToCamera = true;
		this.number4 = game.add.image(this.numberPosition, this.numberPosition, 'numbers', 'number4');
		this.number4.scale.set(0);
		this.number4.fixedToCamera = true;

		this.players = game.add.group();

		/***** PLAYER SPRITE *****/ 
		if(!elevatorActivated){
			this.player = new Patches(game, 'patchesAtlas2', 'right1', 415, 100, this.levelScale);
			this.player.enableBody = true;
			this.players.add(this.player);
		}
		else{
			this.player = new Patches(game, 'patchesAtlas2', 'right1', 415, 465, this.levelScale);
			this.player.enableBody = true;
			this.players.add(this.player);
		}

		/***** MUSIC BOX *****/
		this.box = game.add.sprite(350, 250, 'assets','box');
		game.physics.arcade.enable(this.box);
		this.box.anchor.set(0.50);
		this.box.scale.set(0.15 * this.levelScale);
		this.box.body.collideWorldBounds = false;
		this.box.body.gravity.y = 300; 
		this.box.body.drag = 0.5;
		this.attached = true; 

		this.spacebar = game.add.sprite(390, 260, 'instructions', 'spacebar1');
		this.spacebar.anchor.setTo(0.5, 0);
		this.spacebar.scale.setTo(0.33);
		this.spacebar.animations.add('spacebarAni', Phaser.Animation.generateFrameNames('spacebar', 1, 3, '', 1), 4, true);
		this.spacebar.animations.play('spacebarAni');
		this.spacebar.alpha = 0;

		this.shift = game.add.sprite(-1520, 100, 'instructions', 'shift1');
		this.shift.scale.setTo(0.33);
		this.shift.animations.add('shiftAni', Phaser.Animation.generateFrameNames('shift', 1, 4, '', 1), 4, true);
		this.shift.animations.play('shiftAni');
		this.shift.alpha = 0;

		this.downArrow = game.add.sprite(1480, 200, 'instructions', 'down1');
		this.downArrow.scale.setTo(0.33);
		this.downArrow.animations.add('arrowAni', Phaser.Animation.generateFrameNames('down', 1, 4, '', 1), 4, true);
		this.downArrow.animations.play('arrowAni');
		this.downArrow.alpha = 0;

		this.pauseMenu = new PauseMenu(game);
	},
	update: function() {

		if(!this.keySolved){
			if(this.key1Lock && this.key2Lock && this.key3Lock) {
				this.keySolved = true;
				if(!this.lockAudioPlayed){
					this.lockAudio.play();
					this.lockAudioPlayed = true;
				}
				if(this.keyLock.y > -1000){
					this.keyLock.body.velocity.y = -150;
				}
			}
		}

		//game.debug.body(this.leverHandle);
		if(!inElevator){

			if(this.player.x < -1460 && this.player.y < 220 && !elevatorActivated)
	    		this.shift.alpha = 1;
		    else
		    	this.shift.alpha = 0;
			if(this.player.overlap(this.elevators) && !inElevator && elevatorActivated)
		    	this.spacebar.alpha = 1;
		    else
		    	this.spacebar.alpha = 0;

			if(this.player.overlap(this.door))
		    	this.downArrow.alpha = 1;
		    else
		    	this.downArrow.alpha = 0;
		}

		// CheckCamBounds will be disabled while the panning process is occuring
		if(!leverActivated){
			this.checkCamBounds();			
		}

		if(game.input.keyboard.addKey(Phaser.KeyCode.Q).justPressed()){
			game.time.events.add(Phaser.Timer.SECOND * 1, this.activateElevator, this);
			game.time.events.add(Phaser.Timer.SECOND * 1, this.dropBox, this);
			this.numPlatforms = 3;

		}

		if(!inElevator){
			if(this.player.overlap(this.door) && game.input.keyboard.addKey(Phaser.KeyCode.DOWN).justPressed() && this.hitPlatform){
				this.cutscenePlaying = true;
				game.camera.fade(0x000000, 3000);
				game.time.events.add(Phaser.Timer.SECOND * 3.0, this.transitionToBench, this);
			}
		}

		/***** COLLISIONS *****/
		this.hitPlatform = game.physics.arcade.collide(this.player, platforms);   					// player vs platforms
		this.hitCreatedPlatform = game.physics.arcade.collide(this.player, this.createdPlatforms); 	// player vs created platforms
		this.hitSwitch = game.physics.arcade.collide(this.player, this.switches); 					// player vs switch
		this.hitBox = game.physics.arcade.collide(this.player, this.box);							// player vs box
		this.hitSpring = game.physics.arcade.collide(this.player, this.spring);						// player vs spring
		this.hitFallingPlatform = game.physics.arcade.collide(this.player, this.fallingPlatform)    // player vs fallingPlatform
		this.boxHitPlatform = game.physics.arcade.collide(this.box, platforms);   					// box vs platforms
		this.boxHitSwitch = game.physics.arcade.collide(this.box, this.switches); 					// box vs switch
		this.springHitPlatform = game.physics.arcade.collide(this.spring, platforms);   			// spring vs platforms
		this.hitKeyLock = game.physics.arcade.collide(this.player, this.keyLock); // player vs keyLock
		this.boxHitKeyLock = game.physics.arcade.collide(this.box, this.keyLock); // box vs keyLock
		game.physics.arcade.overlap(this.player, this.leverHandle, this.pullLever, null, this);
		game.physics.arcade.overlap(this.player, this.elevators, this.activateElevatorDown, null, this);

		/***** SWITCH STUFF *****/
		// Switch logic for player pressing down on switch (code never run if elevator is active)
		if(!elevatorActivated){
			if(this.hitSwitch && this.player.x > this.switch.x - this.switch.width/2 && this.player.x < this.switch.x + this.switch.width/2) {
				this.playerOnSwitch = true;
				this.switchPressed = true;
			}
			if(this.playerOnSwitch && !this.hitSwitch && (this.player.x + this.player.width/2 < this.switch.x - this.switch.width/2 || this.player.x - this.player.width/2 > this.switch.x + this.switch.width/2 || this.player.y + this.player.height/2 < this.switch.y - this.switch.height - 30))  {
				this.playerOnSwitch = false;
			}

			// Switch logic for box pressing down on switch
			if(this.boxHitSwitch && this.box.x + this.box.width/2 > this.switch.x - this.switch.width/2 && this.box.x < this.switch.x + this.switch.width/2) {
				this.boxOnSwitch = true;
				this.switchPressed = true;
			}
			if(this.boxOnSwitch && !this.boxHitSwitch && (this.box.x + this.box.width/2 < this.switch.x - this.switch.width/2 || this.box.x - this.box.width/2 > this.switch.x + this.switch.width/2)) {
				this.boxOnSwitch = false;
			}

			if(this.switchPressed && !this.playerOnSwitch && !this.boxOnSwitch) {
				this.switchPressed = false;
			}

			// When the switch is pressed, it will visibly shrink down (y scale decreases)
			if(this.switchPressed) {
				if(this.switch.scale.y > 0.01) {
					if(this.switch.scale.y >= 0.125) {
						this.switchTrigger.play('', 0, 0.1, false);
					}
					this.switch.scale.setTo(0.1, this.switch.scale.y - 0.01);

					if(this.switch.scale.y >= 0.115){
						this.switchTrigger.play('', 0, 0.5, false);
					}

				}
			}
			else {
				if(this.switch.scale.y < 0.125) {
					this.switch.scale.setTo(0.1, this.switch.scale.y + 0.01);
				}
			}

			if(this.switchPressed) {
				if(this.shiftingWall1.y > -600){
					this.shiftingWall1.y -= 10;
				}
			}
			else if(!this.switchPressed && !elevatorActivated){
				if(this.shiftingWall1.y < 50){
					this.shiftingWall1.y += 10;
				}
			}
		}
		

		/***** BOX STUFF *****/
		if(!inElevator){
			this.box.body.velocity.x = 0; // Box won't glide when pushed by player

			// When holding the box...
			if(this.attached) {
				this.box.body.checkCollision.none = true;
				// Box moves where player is facing
				if(this.player.facing == "RIGHT") {
					this.box.x = this.player.x + this.player.width/2 + this.box.width/2 - (37*this.levelScale);
				}
				else {
					this.box.x = this.player.x - this.player.width/2 - this.box.width/2 + (30*this.levelScale);
				}
				this.box.y = this.player.y + (17*this.levelScale);	 // the box is off the ground and with the player
				this.box.body.gravity.y = 0; // box doesn't fall when you're holding it

				// Spawn platform directly under by pressing SPACEBAR
				if(game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).justPressed() && this.numPlatforms > 0) {
					// Kills all current sounds set to play before playing the music note sounds in order
					game.time.events.removeAll();
					game.time.events.add(Phaser.Timer.SECOND * 0.0, this.platformSound1, this);
					game.time.events.add(Phaser.Timer.SECOND * 0.5, this.platformSound2, this);
					game.time.events.add(Phaser.Timer.SECOND * 1.0, this.platformSound3, this);
					game.time.events.add(Phaser.Timer.SECOND * 1.5, this.platformSound4, this);

					this.createdPlatform = new Platform(game, 'assets', 'music-block', this.player.x, this.player.y + this.player.height/2 + 30 * this.levelScale, this.levelScale);
					this.createdPlatforms.add(this.createdPlatform); 
					game.physics.arcade.enable(this.createdPlatform);
					this.createdPlatform.body.checkCollision.down = false;
					this.createdPlatform.body.checkCollision.left = false;
					this.createdPlatform.body.checkCollision.right = false;
					this.createdPlatform.body.immovable = true;
					this.numPlatforms--;
				}

				// Drop the box by pressing SHIFT
				if(game.input.keyboard.addKey(Phaser.KeyCode.SHIFT).justPressed()) {
					this.drop.play();
					this.attached = false;
					this.box.body.checkCollision.none = false;
				}
			}

			// When not holding the box...
			else {
				this.box.body.gravity.y = 300;	// Box has gravity, will fall

				// When picked up from left of box...
				if(game.input.keyboard.addKey(this.player.facing == 'RIGHT' && Phaser.KeyCode.SHIFT).justPressed() && this.hitPlatform && Math.abs((this.player.x + this.player.width/2) - (this.box.x - this.box.width/2)) <= 5) {
					this.pickup.play();
					this.attached = true;
				}
				// When picked up from right of box... 
				if(game.input.keyboard.addKey(this.player.facing == 'LEFT' && Phaser.KeyCode.SHIFT).justPressed() && this.hitPlatform && Math.abs((this.player.x - this.player.width/2) - (this.box.x + this.box.width/2)) <= 5) {
					this.pickup.play();
					this.attached = true;
				}
			}
		}

		/***** FLYING BOOK STUFF *****/
		// If books are are the top of their range of movement, move them down
		if(this.bookTop1){
			// Move books down (increase y)
			this.book1.y += 2;

			// If book y position is at the bottom of its range of movement, set top boolean to false
			if(this.book1.y >= 500){
				this.bookTop1 = false;
			}
		}

		// Else that means they are at the bottom, move them up
		else{
			this.book1.y -= 2;
			if(this.book1.y <= 200){
				this.bookTop1 = true;
			}
		}

		if(this.bookTop2){
			this.book2.y += 2;
			if(this.book2.y >= 500){
				this.bookTop2 = false;
			}
		}

		else{
			this.book2.y -= 2;
			if(this.book2.y <= 200){
				this.bookTop2 = true;
			}
		}

		// reset state when player falls
		if(this.box.y + this.box.height/2 >= this.world.height - 1) {
			this.box.x = 650;
			this.box.y = 400;
		}

		/***** SPRING STUFF *****/
		this.spring.body.velocity.x = 0; // spring won't glide when pushed by player

		// When holding the spring...
		if(this.holdingSpring) {
			this.spring.body.checkCollision.none = true;
			this.spring.y = this.player.y;	 // the spring is off the ground and with the player
			this.spring.body.gravity.y = 0; // spring doesn't fall when you're holding it

			// When facing right, the spring moves immediately to the player's right
			if(this.player.facing == "RIGHT") { 
				this.spring.x = this.player.x + this.player.width/2 + this.spring.width/2 + 1;
			}

			// When facing left, the spring moves immediately to the player's left
			else{ 
				this.spring.x = this.player.x - this.player.width/2 - this.spring.width/2 - 1;	
			}

			// Drop the spring by pressing SHIFT
			if(game.input.keyboard.addKey(Phaser.KeyCode.SHIFT).justPressed()) {
				this.drop.play();
				this.holdingSpring = false;
				this.spring.body.checkCollision.none = false;
			}
		}

		// When not holding the spring...
		else {
			this.spring.body.gravity.y = 300;	// spring has gravity, will fall

			// When picked up from left of spring...
			if(game.input.keyboard.addKey(this.player.facing == 'RIGHT' && Phaser.KeyCode.SHIFT).justPressed() && this.hitPlatform && Math.abs((this.player.x + this.player.width/2) - (this.spring.x - this.spring.width/2)) <= 5) {
				this.holdingSpring = true;
				this.pickup.play();
			}
			// When picked up from right of spring... 
			if(game.input.keyboard.addKey(this.player.facing == 'LEFT' && Phaser.KeyCode.SHIFT).justPressed() && this.hitPlatform && Math.abs((this.player.x - this.player.width/2) - (this.spring.x + this.spring.width/2)) <= 5) {
				this.holdingSpring = true;
				this.pickup.play();
			}
		}

		// For detecting if player is on the spring or not
		if((this.player.x + this.player.width/2 >= (this.spring.x - this.spring.width/2 - 2) && this.player.x - this.player.width/2 <= (this.spring.x + this.spring.width/2 + 2)) &&
			(((this.player.y + this.player.height/2) >= (this.spring.y - this.spring.height)) && this.player.y + this.player.height/2 <= this.spring.y - this.spring.height + 1)) {
					this.bounce.play();
					this.player.body.velocity.y = -1200;
			}

		/***** FALLING PLATFORM STUFF *****/
		if(this.hitFallingPlatform && !this.platformFallingPlayed){
			this.fallingPlatform.body.velocity.y = 1000;
			this.platformFalling.play();
			this.platformFallingPlayed = true;
		}		

		/***** LEVER STUFF *****/
		// When activated, the bar will rotate down the lever holder
		if(this.leverHandle.angle < 160 && leverActivated){
			this.leverHandle.angle++;
		}

		// Pans camera to the elevator, shows it activating, pans back
		if(leverActivated){
			if(game.camera.x < 0 && !elevatorActivated){
				game.camera.x += 16;
				if(game.camera.x == 0) {
					game.time.events.add(Phaser.Timer.SECOND * 1, this.activateElevator, this);
					game.time.events.add(Phaser.Timer.SECOND * 1, this.dropBox, this);			
				}
			}
			else if(elevatorActivated){
				if(game.camera.x > -1600){
					game.camera.x -= 16;
				}
				else {
					leverActivated = false;
					this.cutscenePlaying = false;
				}
			}
		}

		if(!elevatorActivated){
			this.switchHolder.body.velocity.x = this.slideAway;
			this.switch.body.velocity.x = this.slideAway;
			this.activatedPlatform.body.velocity.x = this.slideAway;
		}
		

		// If the player is in the elevator (called from collisions above), then player moves to bottom floor
		if(inElevator){
			this.timer++;
			if(this.timer >= 120){
				this.bgm.destroy();
				game.state.start('Level5', true, false, false, this.numPlatforms, this.reloadOnGround);
			}
		}

		/***** NUMPLATFORM STUFF *****/
		// this.numPlatforms doesn't refresh until the player hits the ground
		if(!inElevator){	
			if(this.reloadOnGround > 0 && this.player.body.touching.down && (this.hitPlatform)) {
				this.numPlatforms++;
				this.reloadOnGround--;	
			}
		}

		// Top-left number updates with this.numPlatforms
		if(this.numPlatforms == 0) {
			this.number0.scale.set(0.5);
			this.number1.scale.set(0);
			this.number2.scale.set(0);
			this.number3.scale.set(0);
			this.number4.scale.set(0);
		}
		else if(this.numPlatforms == 1) {
			this.number0.scale.set(0);
			this.number1.scale.set(0.5);
			this.number2.scale.set(0);
			this.number3.scale.set(0);
			this.number4.scale.set(0);
		}
		else if(this.numPlatforms == 2) {
			this.number0.scale.set(0);
			this.number1.scale.set(0);
			this.number2.scale.set(0.5);
			this.number3.scale.set(0);
			this.number4.scale.set(0);
		}
		else if(this.numPlatforms == 3) {
			this.number0.scale.set(0);
			this.number1.scale.set(0);
			this.number2.scale.set(0);
			this.number3.scale.set(0.5);
			this.number4.scale.set(0);
		}
		else {
			this.numPlatforms = 4;
			this.number0.scale.set(0);
			this.number1.scale.set(0);
			this.number2.scale.set(0);
			this.number3.scale.set(0);
			this.number4.scale.set(0.5);
		}
				
	},

	render: function() {
		//game.debug.cameraInfo(game.camera, 32, 32);
		//game.debug.rectangle({x:game.camera.bounds.x, y:game.camera.bounds.y, width:game.camera.bounds.width, height:game.camera.bounds.height});
	},

	checkCamBounds: function() {
		// some funky, funky logic to check camera bounds for player movement
		if(this.player.x  > game.width + game.camera.x && !this.player.body.blocked.right && this.player.facing === "RIGHT") {
			// move camera, then player
			game.camera.x += game.width;
			this.player.x = game.camera.x + Math.abs(this.player.width/2);	
		} 
		else if(this.player.x  < game.camera.x && !this.player.body.blocked.left && this.player.facing === "LEFT") {
		 	// move camera, then player
		 	game.camera.x -= game.width;
		 	this.player.x = game.camera.x + game.width - Math.abs(this.player.width/2);	
		} 
	},
	// Functions for playing the platform audio sounds
	platformSound1: function(){
		this.platform1audio.play();
	},

	platformSound2: function(){
		this.platform2audio.play();
	},

	platformSound3: function(){
		this.platform3audio.play();
	},

	platformSound4: function(){
		this.platform4audio.play();
	},

	// Function that checks to see if the player presses shift next to an unpulled lever
	pullLever: function(){
		if(game.input.keyboard.addKey(Phaser.KeyCode.SHIFT).justPressed() && !leverActivated){
			leverActivated = true;
			this.cutscenePlaying = true;
			this.switchTrigger.play('', 0, 0.5, false);
		}
	},

	// Function for activating the elevator to go down
	activateElevatorDown: function(Patches, elevator){
		if(!inElevator){
			// When spacebar pressed and player is standing
			if(game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).justPressed() && this.player.body.touching.down && elevatorActivated && this.attached){
				// Puts player in middle of elevator
				this.player.x = 405;
			    this.player.y = 470;	
				inElevator = true;

				// KILL THE PLAYER, BOX AND THE CURRENT ELEVATOR SPRITE
				this.player.destroy();
				this.box.destroy();
				this.elevators.removeAll(true);
				this.spacebar.destroy();
				this.cutscenePlaying = true;


				// Creates a new elevator sprite with its doors closed, but active
				this.closedElevator = this.elevators.create(310, 320, 'lvl3', 'elevator2'); 
				this.closedElevator.scale.setTo(0.5);

				this.closedElevator.body.velocity.y = 75;

				// Play sound effect
				this.elevatorNoise.play();

				// Fade out effect
				if(inElevator){
					game.camera.fade(0x000000, 4000);
				}
			}
		}
	},

	// Function for turning on the elevator initially
	activateElevator: function(){
		// Kills the current elevator sprite (unpowered)
		this.elevators.removeAll(true);

		// Creates a new elevator sprite with its doors open and active
		this.activatedElevator = this.elevators.create(310, 320, 'lvl3', 'elevator3'); 
		this.activatedElevator.scale.setTo(0.5);
		game.physics.arcade.enable(this.activatedElevator);
		this.activatedElevator.body.immovable = true;
		this.activatedElevator.body.checkCollision.up = false;
	    this.activatedElevator.body.checkCollision.down = false;
	    this.activatedElevator.body.checkCollision.left = false;
	    this.activatedElevator.body.checkCollision.right = false;
	    this.switchTrigger.play('', 0, 0.5, false);

	    // After one second, move on
		game.time.events.add(Phaser.Timer.SECOND * 1, this.oneSecond, this);
	},

	dropBox: function(){
		this.slideAway = 100;
		game.time.events.add(Phaser.Timer.SECOND * 2, this.boxMagicTrick, this);
	},

	boxMagicTrick: function(){
		//this.box.destroy();
		this.box = game.add.sprite(650, 500, 'assets','box');
		game.physics.arcade.enable(this.box);
		this.box.anchor.set(0.50);
		this.box.scale.set(0.15 * this.levelScale);
		this.box.body.collideWorldBounds = false;
		this.box.body.gravity.y = 300;
		this.box.body.immovable = false; 
		this.box.body.drag = 0.5;
		this.attached = false; 
	},

	// Function for setting global var "elevatorActivated" to true
	oneSecond: function(){
		elevatorActivated = true;
	},

	// Function called to transition to next level and kill bgm
	transitionToBench: function(){
		this.cutscenePlaying = false;
		game.state.start('Level7', true, false, false, this.numPlatforms, this.reloadOnGround);
		this.bgm.destroy();
	},

	openMenu: function() {
		this.optionsOpen.play();
		this.pauseMenuOpen = true;
	},

	closeMenu: function() {
		this.optionsClose.play();
		this.pauseMenuOpen = false;
	},

	goToMainMenu: function() {
		this.bgm.destroy();
		game.state.start('MainMenu');
	},

	restartLevel: function() {
		if(hasThirdGear){
			game.state.start('Level4', true, false, this.bgmOn, 3, 0);
		}
		else{
			game.state.start('Level4', true, false, this.bgmOn, 2, 0);
		}
	},

	skipLevel: function() {
		this.bgm.destroy();
		if(hasThirdGear){
			game.state.start('Level7', true, false, false, 3, 0);
		}
		else {
			elevatorActivated = true;
			game.state.start('Level5', true, false, false, 2, 0);
		}
	}
}