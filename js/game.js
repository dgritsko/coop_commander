ChickenStates = {
    STOPPED: 0,
    MOVING_TO_POINT: 1
}

var pen = new Phaser.Rectangle(720, 120, 8 * 48, 10 * 48);

function preload() {
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

    flock = game.add.group();
    createChickens(pen, flock);

    fence = game.add.group();
    drawFence(pen, fence);
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

    for (var i = 0; i < flock.children.length; i++) {
        var chicken = flock.children[i];
        
        if (chicken.state == ChickenStates.STOPPED) {
            chicken.state = ChickenStates.MOVING_TO_POINT;

            function createClosure(c) {
                return function() {
                    moveChicken(c, pen);
                }
            }

            game.time.events.add(Phaser.Timer.SECOND * 3, createClosure(chicken), this);
        }
    }

    game.physics.arcade.collide(fence, flock, function(fenceSegment, chicken) {
        stopChicken(chicken);
    });
}

function moveChicken(chicken, rect) {
    // TODO: Ensure that destination is within the bounds of the fence
    function chooseDestination() {
        var xDiff = (Math.random() - 0.5) * 200;
        var yDiff = (Math.random() - 0.5) * 200;
        var newX = chicken.x + xDiff;
        var newY = chicken.y + yDiff;
        return [newX, newY, xDiff, yDiff];
    }

    var dest = chooseDestination();
    
    var newX = dest[0];
    var newY = dest[1];
    var xDiff = dest[2];
    var yDiff = dest[3];

    var duration = (game.physics.arcade.distanceToXY(chicken, newX, newY) / 90) * 1000;
    
    var tween = game.add.tween(chicken).to({ x: newX, y: newY }, duration, Phaser.Easing.Linear.None, true);

    tween.onComplete.add(function() { stopChicken(chicken); }, this);

    chicken.tween = tween;

    if (xDiff < 0 && Math.abs(yDiff) < Math.abs(xDiff)) {
        chicken.animations.play('left');
    } else if (yDiff < 0 && Math.abs(xDiff) < Math.abs(yDiff)) {
        chicken.animations.play('up');
    } else if (xDiff > 0 &&Math.abs(xDiff) > Math.abs(yDiff)) {
        chicken.animations.play('right');
    } else {
        chicken.animations.play('down');
    }
}

function drawFence(rect, group) {
    var spriteSize = 48;
    var width = rect.width / spriteSize;
    var height = rect.height / spriteSize;

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

                var f = game.add.sprite(rect.x + (i * spriteSize), rect.y + (j * spriteSize), 'fence00', spriteIndex);

                game.physics.arcade.enable(f);

                group.add(f);
            }
        }
    }
}

function createChickens(rect, group) {
    for (var i = 0; i < 1; i++) {
        var chicken = game.add.sprite(rect.x + rect.width / 2, rect.y + rect.height / 2, 'chicken00');
        
        chicken.anchor.setTo(0.5, 0.5);
        chicken.scale.setTo(2, 2);
        
        game.physics.arcade.enable(chicken);
        
        chicken.animations.add('down', [0, 1, 2], 10, true);
        chicken.animations.add('left', [3, 4, 5], 10, true);
        chicken.animations.add('right', [6, 7, 8], 10, true);
        chicken.animations.add('up', [9, 10, 11], 10, true);
        
        chicken.state = ChickenStates.STOPPED;

        group.add(chicken);
    }
}

function stopChicken(chicken) {
    chicken.tween.stop();
    chicken.animations.stop();
    chicken.state = ChickenStates.STOPPED;
}

CoopCommander.Game = {preload: preload, create: create, update: update};