var Level4 = function(game) {};
Level4.prototype = {
	init: function() {
		numPlatforms = 2;
		reloadOnGround = 0;
		self = this;	
		level = 4;
		inElevator = false;
		leverActivated = false;
		activateCheckCamBounds = true;
		this.levelScale = 1.0;
		this.bookTop = true;
		this.bookTop2 = true;
		this.holdingSpring = false;
		this.falling = false;		
		this.timer = 0;
	},
	create: function() {
		/***** BG, BGM, AND NUMBER CIRCLE *****/
		// Create backgrounds for top floor of the library level, set bounds to image resolution (3200 x 600)
		this.bg0 = game.add.image(-1600, 0, 'lvl3-bg', 'bg8'); // Background 8 (spring and lever)
		this.bg1 = game.add.image(-800, 0, 'lvl3-bg', 'bg7');  // Background 7 (flying books)
		this.bg2 = game.add.image(0, 0, 'lvl3-bg', 'bg4');     // Background 4 (elevator top floor)
		this.bg3 = game.add.image(800, 0, 'lvl3-bg', 'bg6');   // Background 6 (keys and exit)
		game.world.setBounds(-1600, 0, 3200, this.bg1.height);

		// Create bgm for game, looped and played
		this.bgm = game.add.audio('bgm', 0.1, true);

		// Create sound effects for when a music block platform is created
		this.platform1audio = game.add.audio('platform1audio');
		this.platform2audio = game.add.audio('platform2audio');
		this.platform3audio = game.add.audio('platform3audio');
		this.platform4audio = game.add.audio('platform4audio');

		// Creates sound effect for triggering the switch
		this.switchTrigger = game.add.audio('switchTrigger');

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
	
		/***** PLATFORM GROUPS AND INVISIBLE BOUNDARIES *****/
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
		this.ground = platforms.create(-1600, 550, 'atlas', 'sky'); 
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
			this.elevator = this.elevators.create(350, 380, 'lvl3', 'elevator3'); 
			this.elevator.scale.setTo(0.4, 0.4);
			game.physics.arcade.enable(this.elevator);
			this.elevator.body.immovable = true;
			this.elevator.body.checkCollision.up = false;
		    this.elevator.body.checkCollision.down = false;
		    this.elevator.body.checkCollision.left = false;
		    this.elevator.body.checkCollision.right = false;
		}

		if(!elevatorActivated) {
			this.elevator = this.elevators.create(350, 380, 'lvl3', 'elevator1'); 
			this.elevator.scale.setTo(0.4, 0.4);
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

		// Creates the left bookshelf that goes up when the switch is activated 
		this.shiftingWall1 = platforms.create(0, 50, 'lvl3', 'bookshelf1'); 
		this.shiftingWall1.scale.setTo(1, 1);
		game.physics.arcade.enable(this.shiftingWall1);
		this.shiftingWall1.body.immovable = true;

		// Creates the right bookshelf that goes up last gear is obtained 
		this.shiftingWall2 = platforms.create(700, 50, 'lvl3', 'bookshelf2'); 
		this.shiftingWall2.scale.setTo(1, 1);
		game.physics.arcade.enable(this.shiftingWall2);
		this.shiftingWall2.body.immovable = true;

		

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

		// Creates the lever bar handle, left side
		this.leverHandle = levers.create(-1540, 180, 'lvl3', 'lever-handle');
		this.leverHandle.scale.setTo(0.5);
		this.leverHandle.anchor.set(1);
		game.physics.arcade.enable(this.leverHandle);
		this.leverHandle.body.immovable = true;
		this.leverHandle.angle = 20;
		this.leverHandle.body.setSize(150, 300, 0, -50);

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
		this.key1 = game.add.sprite(1000, 210, 'assets', 'music-block');
		this.key1.anchor.set(0.5);
		this.key1.scale.set(0.5 * this.levelScale);
		this.key1.alpha = 0.5;
		this.key1Lock = false;

		this.key2 = game.add.sprite(1000, 330, 'assets', 'music-block');
		this.key2.anchor.set(0.5);
		this.key2.scale.set(0.5 * this.levelScale);
		this.key2.alpha = 0.5;
		this.key2Lock = false;

		this.key3 = game.add.sprite(1000, 450, 'assets', 'music-block');
		this.key3.anchor.set(0.5);
		this.key3.scale.set(0.5 * this.levelScale);
		this.key3.alpha = 0.5;
		this.key3Lock = false;

		this.keyLock = game.add.sprite(1200, 550, 'lvl2', 'clocktower');
		this.keyLock.scale.set(0.8);
		this.keyLock.anchor.setTo(0.5, 1);


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

		/***** PLAYER SPRITE *****/ 
		this.player = new Patches(game, 'patchesAtlas2', 'right1', 415, 100, this.levelScale);
		this.player.enableBody = true;
		game.add.existing(this.player);

		/***** MUSIC BOX *****/
		this.box = game.add.sprite(350, 250, 'assets','box');
		game.physics.arcade.enable(this.box);
		this.box.anchor.set(0.50);
		this.box.scale.set(0.15 * this.levelScale);
		this.box.body.collideWorldBounds = false;
		this.box.body.gravity.y = 300; 
		this.box.body.drag = 0.5;
		this.attached = true; 

	},
	update: function() {
		/***** DEBUG *****/
		//console.log(this.player.x);
		//console.log(this.player.y);
		//console.log(level);
		//console.log(inElevator);
		//console.log(bookTop);
		//console.log(this.leverHandle.angle);
		//console.log(this.player.x);
		//game.debug.body(this.shiftingWall1);
		//game.debug.body(this.leverHandle);
		//game.debug.body(this.leftWall);

		// CheckCamBounds will be disabled while the panning process is occuring
		if(!leverActivated){
			this.checkCamBounds();			
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
		game.physics.arcade.overlap(this.player, this.leverHandle, pullLever, null, this);
		game.physics.arcade.overlap(this.player, this.elevators, activateElevatorDown, null, this);

		/***** SWITCH STUFF *****/
		// Switch logic for player pressing down on switch 
		if(this.hitSwitch && this.player.x > this.switch.x - this.switch.width/2 && this.player.x < this.switch.x + this.switch.width/2) {
			this.playerOnSwitch = true;
			this.switchPressed = true;
		}
		if(this.playerOnSwitch && !this.hitSwitch && (this.player.x + this.player.width/2 < this.switch.x - this.switch.width/2 || this.player.x - this.player.width/2 > this.switch.x + this.switch.width/2 || this.player.y + this.player.height/2 < this.switch.y - this.switch.height - 30))  {
			this.playerOnSwitch = false;
		}

		// Switch logic for box pressing down on switch
		if(this.boxHitSwitch && this.box.x > this.switch.x - this.switch.width/2 && this.box.x < this.switch.x + this.switch.width/2) {
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
		else{
			if(this.shiftingWall1.y < 50){
				this.shiftingWall1.y += 10;
			}
		}

		/***** BOX STUFF *****/
		this.box.body.velocity.x = 0; // Box won't glide when pushed by player

		// When holding the box...
		if(this.attached) {
			// When facing right, the box moves immediately to the player's right
			this.box.body.checkCollision.none = true;
			if(this.player.facing == "RIGHT") { 
				this.box.x = this.player.x + this.player.width/2 + this.box.width/2 + 1;
			}

			// When facing left, the box moves immediately to the player's left
			else{ 
				this.box.x = this.player.x - this.player.width/2 - this.box.width/2 - 1;	
			}

			this.box.y = this.player.y;	 // the box is off the ground and with the player
			this.box.body.gravity.y = 0; // box doesn't fall when you're holding it

			// Spawn platform directly under by pressing SPACEBAR
			if(game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).justPressed() && numPlatforms > 0) {

				// Kills all current sounds set to play before playing the music note sounds in order
				game.time.events.removeAll();
				game.time.events.add(Phaser.Timer.SECOND * 0.0, platformSound1, this);
				game.time.events.add(Phaser.Timer.SECOND * 0.5, platformSound2, this);
				game.time.events.add(Phaser.Timer.SECOND * 1.0, platformSound3, this);
				game.time.events.add(Phaser.Timer.SECOND * 1.5, platformSound4, this);

				// Creates the music note block
				this.createdPlatform = new Platform(game, 'assets', 'music-block', this.player.x, this.player.y + this.player.height/2 + 30 * this.levelScale, this.levelScale);
				this.createdPlatforms.add(this.createdPlatform); 
				game.physics.arcade.enable(this.createdPlatform);
				this.createdPlatform.scale.set(0.33);
				this.createdPlatform.body.checkCollision.down = false;
				this.createdPlatform.body.checkCollision.left = false;
				this.createdPlatform.body.checkCollision.right = false;
				// this.createdPlatform.body.setSize(this.createdPlatform.body.width*10 - 80, this.createdPlatform.body.height*10 - 200, this.createdPlatform.body.width/2 , this.createdPlatform.body.height/2 + 45);
				this.createdPlatform.body.immovable = true;
				numPlatforms--;
			}

			// Drop the box by pressing SHIFT
			if(game.input.keyboard.addKey(Phaser.KeyCode.SHIFT).justPressed()) {
				this.attached = false;
				this.box.body.checkCollision.none = false;
			}
		}

		// When not holding the box...
		else {
			this.box.body.gravity.y = 300;	// Box has gravity, will fall

			// When picked up from left of box...
			if(game.input.keyboard.addKey(this.player.facing == 'RIGHT' && Phaser.KeyCode.SHIFT).justPressed() && this.hitPlatform && Math.abs((this.player.x + this.player.width/2) - (this.box.x - this.box.width/2)) <= 5) {
				this.attached = true;
			}
			// When picked up from right of box... 
			if(game.input.keyboard.addKey(this.player.facing == 'LEFT' && Phaser.KeyCode.SHIFT).justPressed() && this.hitPlatform && Math.abs((this.player.x - this.player.width/2) - (this.box.x + this.box.width/2)) <= 5) {
				this.attached = true;
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
			}
			// When picked up from right of spring... 
			if(game.input.keyboard.addKey(this.player.facing == 'LEFT' && Phaser.KeyCode.SHIFT).justPressed() && this.hitPlatform && Math.abs((this.player.x - this.player.width/2) - (this.spring.x + this.spring.width/2)) <= 5) {
				this.holdingSpring = true;
			}
		}

		// For detecting if player is on the spring or not
		if((this.player.x + this.player.width/2 >= (this.spring.x - this.spring.width/2 - 2) && this.player.x - this.player.width/2 <= (this.spring.x + this.spring.width/2 + 2)) &&
			(((this.player.y + this.player.height/2) >= (this.spring.y - this.spring.height)) && this.player.y + this.player.height/2 <= this.spring.y - this.spring.height + 1)) {
					this.player.body.velocity.y = -1200;
			}

		/***** FALLING PLATFORM STUFF *****/
		if(this.hitFallingPlatform){
			this.falling = true;
		}	

		// When touched, platform drops off the bottom edge
		if(this.falling){
			this.fallingPlatform.y += 10;
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
					game.time.events.add(Phaser.Timer.SECOND * 1, activateElevator, this);
				}
			}
			else if(elevatorActivated){
				if(game.camera.x > -1600){
					game.camera.x -= 16;
				}
				else {
					leverActivated = false;
				}
			}
		}

		// If the player is in the elevator (called from collisions above), then player moves to bottom floor
		if(inElevator){
			this.timer++;
			if(this.timer >= 120){
				game.state.start('Level5');
			}
		}

		/***** NUMPLATFORM STUFF *****/
		// numPlatforms doesn't refresh until the player hits the ground
		if(!inElevator){	
			if(reloadOnGround > 0 && this.player.body.touching.down && (this.hitPlatform)) {
				numPlatforms++;
				reloadOnGround--;	
			}
		}

		// Top-left number updates with numPlatforms
		if(numPlatforms == 0) {
			this.number0.scale.set(0.5);
			this.number1.scale.set(0);
			this.number2.scale.set(0);
			this.number3.scale.set(0);
			this.number4.scale.set(0);
		}
		else if(numPlatforms == 1) {
			this.number0.scale.set(0);
			this.number1.scale.set(0.5);
			this.number2.scale.set(0);
			this.number3.scale.set(0);
			this.number4.scale.set(0);
		}
		else if(numPlatforms == 2) {
			this.number0.scale.set(0);
			this.number1.scale.set(0);
			this.number2.scale.set(0.5);
			this.number3.scale.set(0);
			this.number4.scale.set(0);
		}
		else if(numPlatforms == 3) {
			this.number0.scale.set(0);
			this.number1.scale.set(0);
			this.number2.scale.set(0);
			this.number3.scale.set(0.5);
			this.number4.scale.set(0);
		}
		else {
			numPlatforms = 4;
			this.number0.scale.set(0);
			this.number1.scale.set(0);
			this.number2.scale.set(0);
			this.number3.scale.set(0);
			this.number4.scale.set(0.5);
		}
				
	},

	render: function() {
		game.debug.cameraInfo(game.camera, 32, 32);
		//game.debug.rectangle({x:game.camera.bounds.x, y:game.camera.bounds.y, width:game.camera.bounds.width, height:game.camera.bounds.height});
	},

	checkCamBounds: function() {
		// some funky, funky logic to check camera bounds for player movement
		if(this.player.x + Math.abs(this.player.width/2) > game.width + game.camera.x && !this.player.body.blocked.right && this.player.facing === "RIGHT") {
			// move camera, then player
			game.camera.x += game.width;
			this.player.x = game.camera.x + Math.abs(this.player.width/2);	
		} 
		else if(this.player.x - Math.abs(this.player.width/2) < game.camera.x && !this.player.body.blocked.left && this.player.facing === "LEFT") {
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

// Function for collecting "gears"
function collectGear(Patches, gear){
	gear.kill();
	numPlatforms++;
	this.gearAudio = game.add.audio('collect-gear', 0.25, false);	
	this.gearAudio.play();
}

// Functions for playing the platform audio sounds
function platformSound1(){
	this.platform1audio.play();
}

function platformSound2(){
	this.platform2audio.play();
}

function platformSound3(){
	this.platform3audio.play();
}

function platformSound4(){
	this.platform4audio.play();
}

// Function that checks to see if the player presses shift next to an unpulled lever
function pullLever(){
	if(game.input.keyboard.addKey(Phaser.KeyCode.SHIFT).justPressed() && !leverActivated){
		leverActivated = true;
		this.switchTrigger.play('', 0, 0.5, false);
	}
}

// Function for activating the elevator to go down
function activateElevatorDown(Patches, elevator){
	if(!inElevator){
		// When spacebar pressed and player is standing
		if(game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).justPressed() && this.player.body.touching.down && elevatorActivated){
			// Puts player in middle of elevator
			this.player.x = 415;
		    this.player.y = 485;	
			inElevator = true;

			// KILL THE PLAYER AND THE CURRENT ELEVATOR SPRITE
			this.player.destroy();
			this.elevators.removeAll(true);

			// Creates a new elevator sprite with its doors closed, but active
			this.closedElevator = this.elevators.create(350, 380, 'lvl3', 'elevator2'); 
			this.closedElevator.scale.setTo(0.4, 0.4);
			
			// Fade out effect
			if(inElevator){
				game.camera.fade(0x000000, 4000);
			}
		}
	}
	
}

// Function for turning on the elevator initially
function activateElevator(){
	// Kills the current elevator sprite (unpowered)
	this.elevators.removeAll(true);

	// Creates a new elevator sprite with its doors open and active
	this.activatedElevator = this.elevators.create(350, 380, 'lvl3', 'elevator3'); 
	this.activatedElevator.scale.setTo(0.4, 0.4);
	game.physics.arcade.enable(this.activatedElevator);
	this.activatedElevator.body.immovable = true;
	this.activatedElevator.body.checkCollision.up = false;
    this.activatedElevator.body.checkCollision.down = false;
    this.activatedElevator.body.checkCollision.left = false;
    this.activatedElevator.body.checkCollision.right = false;
    this.switchTrigger.play('', 0, 0.5, false);

    // After one second, move on
	game.time.events.add(Phaser.Timer.SECOND * 1, oneSecond, this);
}

// Function for setting global var "elevatorActivated" to true
function oneSecond(){
	elevatorActivated = true;
}


// this.player.body.checkCollision.up = false;
	 //    this.player.body.checkCollision.down = false;
	 //    this.player.body.checkCollision.left = false;
	 //    this.player.body.checkCollision.right = false;
	 //    this.player.body.collideWorldBounds = false;
	 //    this.player.body.gravity.y = 0;
		// this.player.body.velocity.y = 75;
		// this.elevator.body.velocity.y = 75;