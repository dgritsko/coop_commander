ChickenStates = {
    STOPPED: 0,
    MOVING_TO_POINT: 1
}

CoopCommander.Game = {};

function preload() {
    game.load.image('grass', 'assets/grass00.png');
    game.load.spritesheet('player', 'assets/player.png', 64, 64);
    game.load.spritesheet('rat00', 'assets/rat00.png', 32, 32);
    game.load.spritesheet('chicken00', 'assets/chicken00.png', 48, 48);
    game.load.spritesheet('fence00', 'assets/fence00.png', 48, 48);
    
    game.scale.scaleMode = Phaser.ScaleManager.NONE; // SHOW_ALL
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    for (var x = 0; x < game.width; x += 100) {
        for (var y = 0; y < game.height; y += 100) {
            game.add.sprite(x, y, 'grass');
        }
    }

    player = game.add.sprite(100, 100, 'player');

    game.physics.arcade.enable(player);

    player.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7, 8], 20, true);
    player.animations.add('left', [9, 10, 11, 12, 13, 14, 15, 16, 17], 20, true);
    player.animations.add('down', [18, 19, 20, 21, 22, 23, 24, 25, 26], 20, true);
    player.animations.add('right', [27, 28, 29, 30, 31, 32, 33, 34, 35], 20, true);

    cursors = game.input.keyboard.createCursorKeys();
    
    rat = game.add.sprite(100, 200, 'rat00');
    
    game.physics.arcade.enable(rat);
    
    rat.animations.add('down', [0, 1, 2], 10, true);
    rat.animations.add('left', [3, 4, 5], 10, true);
    rat.animations.add('right', [6, 7, 8], 10, true);
    rat.animations.add('up', [9, 10, 11], 10, true);
    
    chicken = game.add.sprite(300, 300, 'chicken00');
    
    chicken.anchor.setTo(0.5, 0.5);
    chicken.scale.setTo(2, 2);
    
    game.physics.arcade.enable(chicken);
    
    chicken.animations.add('down', [0, 1, 2], 10, true);
    chicken.animations.add('left', [3, 4, 5], 10, true);
    chicken.animations.add('right', [6, 7, 8], 10, true);
    chicken.animations.add('up', [9, 10, 11], 10, true);
    
    chicken.state = ChickenStates.STOPPED;
    chicken.destination = [0, 0];

    fence = game.add.group();
    drawFence(700, 120, 8, 10, fence);
}

function update() {
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (cursors.up.isDown) {
        player.body.velocity.y -= 100;
        player.animations.play('up');
    } else if (cursors.down.isDown) {
        player.body.velocity.y += 100;
        player.animations.play('down');
    } else if (cursors.left.isDown) {
        player.body.velocity.x = -100;
        player.animations.play('left');
    } else if (cursors.right.isDown) {
        player.body.velocity.x += 100;
        player.animations.play('right');
    } else {
        player.animations.stop();
    }

    rat.animations.play('right');

    if (chicken.state == ChickenStates.STOPPED) {
        chicken.state = ChickenStates.MOVING_TO_POINT;
        game.time.events.add(Phaser.Timer.SECOND * 3, moveChicken, this);
    }

    //console.log(game.physics.arcade.distanceToXY(chicken, chicken.destination[0], chicken.destination[1]));
    //console.log(chicken.state, chicken.destination)
}

function moveChicken() {
    var xDiff = (Math.random() - 0.5) * 200;
    var yDiff = (Math.random() - 0.5) * 200;
    var newX = chicken.x + xDiff;
    var newY = chicken.y + yDiff;
    
    var duration = (game.physics.arcade.distanceToXY(chicken, newX, newY) / 90) * 1000;
    
    function doSomething() {
        chicken.animations.stop();
        chicken.state = ChickenStates.STOPPED;
    };

    var tween = game.add.tween(chicken).to({ x: newX, y: newY }, duration, Phaser.Easing.Linear.None, true);

    tween.onComplete.add(doSomething, this);

    // chicken.destination = [newX, newY];

    // game.physics.arcade.moveToXY(chicken, newX, newY);

    if (xDiff < 0 && Math.abs(yDiff) < Math.abs(xDiff)) {
        chicken.animations.play('left');
    } else if (yDiff < 0 && Math.abs(xDiff) < Math.abs(yDiff)) {
        chicken.animations.play('up');
    } else if (xDiff > 0 &&Math.abs(xDiff) > Math.abs(yDiff)) {
        chicken.animations.play('right');
    } else {
        chicken.animations.play('down');
    }

    // console.log(game.physics.arcade.distanceToXY(chicken, newX, newY));
}

function drawFence(x, y, width, height, group) {
    var spriteWidth = 48;
    var spriteHeight = 48;

    for (var i = 0; i < width; i++) {
        for (var j = 0; j < height; j++) {
            if (i == 0 || j == 0 || i == (width - 1) || j == (height - 1)) {
                var spriteIndex = 0;
                if (i == 0 && j == 0) {
                    spriteIndex = 6;
                } else if (j == 0 && i == (width - 1)) {
                    spriteIndex = 9;
                } else if (i == 0 && j == (height - 1)) {
                    spriteIndex = 7;
                } else if (i == (width - 1) && j == (height - 1)) {
                    spriteIndex = 10;
                } else if (i == 0 || i == (width - 1)) {
                    spriteIndex = j % 2 == 0 ? 2 : 3;
                } else if (j == 0 || j == (height - 1)) {
                    spriteIndex = i % 2 == 0 ? 0 : 1;
                } 

                var f = game.add.sprite(x + (i * spriteWidth), y + (j * spriteHeight), 'fence00', spriteIndex);
                group.add(f);
            }
        }
    }
}

CoopCommander.Game = {preload: preload, create: create, update: update};