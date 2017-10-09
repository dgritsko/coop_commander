ChickenStates = {
    STOPPED: 0,
    MOVING_TO_POINT: 1,
    WAITING: 2
};

RodentStates = {
    STOPPED: 0,
    HUNGRY: 1,
    RETREATING: 2
};

var pen = new Phaser.Rectangle(720, 120, 8 * 48, 10 * 48);

function preload() {
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.disableVisibilityChange = true;
    
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

    setupInput();

    rodents = game.add.group();
    for (var i = 0; i < 2; i++) {
        createRodent(rodents);
    }

    fence = game.add.group();
    drawFence(pen, fence);

    food = game.add.group();
    for (var i = 0; i < 2; i++) {
        createFood(pen, food);
    }

    flock = game.add.group();
    for (var i = 0; i < 10; i++) {
        createChickens(pen, flock);
    }
}

function update() {
    movePlayer();

    var targets = food.children.map(function(item) { return [item.x, item.y]; });
    for (var i = 0; i < rodents.children.length; i++) {
        var rodent = rodents.children[i];

        if (rodent.state == RodentStates.STOPPED) {
            moveRodent(rodent, targets);
        }

        if (rodent.state == RodentStates.HUNGRY) {
            rodent.animations.play('right');        
        }

        if (rodent.state == RodentStates.RETREATING) {
            rodent.animations.play('left');
        }

        if (!rodent.inCamera) {
            rodent.kill();
            rodents.remove(rodent);
        }
    }

    for (var i = 0; i < flock.children.length; i++) {
        var chicken = flock.children[i];
        
        if (chicken.state == ChickenStates.STOPPED) {
            chicken.state = ChickenStates.WAITING;

            function createClosure(c) {
                return function() {
                    moveChicken(c);
                }
            }

            var waitDuration = (Phaser.Timer.SECOND * 2) + (Phaser.Timer.SECOND * 8 * Math.random());
            game.time.events.add(waitDuration, createClosure(chicken), this);
        } else if (chicken.state == ChickenStates.MOVING_TO_POINT && game.physics.arcade.distanceToXY(chicken, chicken.dest[0], chicken.dest[1]) < 1) {
            stopChicken(chicken);
        }
    }

    game.physics.arcade.collide(fence, flock, function(fenceSegment, chicken) {
        if (chicken.state == ChickenStates.MOVING_TO_POINT) {
            stopChicken(chicken);
        }
    });

    game.physics.arcade.collide(rodents, food, function(rodent, foodItem) {
        
    }, function(rodent, foodItem) {
        if (rodent.state != RodentStates.HUNGRY) {
            return false;
        }

        rodent.state = RodentStates.RETREATING;
        foodItem.kill();
        food.remove(foodItem);
        rodent.body.velocity.x *= -1;
        rodent.body.velocity.y *= 0.25;        
        return false;
    });

    if (rodents.children.length < 2) {
        createRodent(rodents);
    }

    if (food.children.length == 0) {
        game.state.start('Score', true, false, { foodCount: 0 });
    }
}

function movePlayer() {
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    var speedFactor = 100;

    var diagonalVelocity = 0.70710678118; // 1/sqrt(2)

    var xVelocity = 0;
    var yVelocity = 0;
    var animation = '';

    // TODO: Play the animation corresponding to the last directional key pressed...
    var lastKey = CoopCommander.Game.input.lastKey[CoopCommander.Game.input.lastKey.length - 1];

    if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
        if (lastKey == Phaser.Keyboard.UP) {
            animation = 'up';
        } else if (lastKey == Phaser.Keyboard.DOWN) {
            animation = 'down';
        } else if (lastKey == Phaser.Keyboard.LEFT) {
            animation = 'left';
        } else if (lastKey == Phaser.Keyboard.RIGHT) {
            animation = 'right';
        }
    }

    if (cursors.left.isDown) {
        if (cursors.up.isDown) {
            xVelocity = -diagonalVelocity;
            yVelocity = -diagonalVelocity;
        } else if (cursors.down.isDown) {
            xVelocity = -diagonalVelocity;
            yVelocity = diagonalVelocity;
        } else {
            xVelocity = -1;
        }
    } else if (cursors.right.isDown) {
        if (cursors.up.isDown) {
            xVelocity = diagonalVelocity;
            yVelocity = -diagonalVelocity;
        } else if (cursors.down.isDown) {
            xVelocity = diagonalVelocity;
            yVelocity = diagonalVelocity;
        } else {
            xVelocity = 1;
        }
    } else if (cursors.up.isDown) {
        yVelocity = -1;
    } else if (cursors.down.isDown) {
        yVelocity = 1;
    }

    player.body.velocity.x += (xVelocity * speedFactor);    
    player.body.velocity.y += (yVelocity * speedFactor);

    if (animation) {
        player.animations.play(animation);
    } else {
        player.animations.stop();
    }
}

function setupInput() {
    cursors = game.input.keyboard.createCursorKeys();
    
    CoopCommander.Game.input = { lastKey: [] };
    
    function configureKey(key, id) {
        key.onDown.add(function() { CoopCommander.Game.input.lastKey.push(id); })
        key.onUp.add(function() { CoopCommander.Game.input.lastKey.pop(); })
    }

    configureKey(cursors.up, Phaser.Keyboard.UP);
    configureKey(cursors.down, Phaser.Keyboard.DOWN);
    configureKey(cursors.left, Phaser.Keyboard.LEFT);
    configureKey(cursors.right, Phaser.Keyboard.RIGHT);

    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(function() { 
        game.camera.flash(0xFFFFFF, 100);
    }, this);
}

function createRodent(group) {    
    var width = game.cache.getImage('rat00').width;

    var rat = game.add.sprite(game.camera.bounds.x - (width / 10), Math.random() * game.world.height, 'rat00');
    
    game.physics.arcade.enable(rat);
    
    rat.animations.add('down', [0, 1, 2], 10, true);
    rat.animations.add('left', [3, 4, 5], 10, true);
    rat.animations.add('right', [6, 7, 8], 10, true);
    rat.animations.add('up', [9, 10, 11], 10, true);

    rat.state = RodentStates.STOPPED;
    group.add(rat);
}

function moveRodent(rodent, targets) {
    if (targets.length == 0) {
        return;
    }

    var speed = 1;

    var target = targets[Math.floor(Math.random() * targets.length)];
    rodent.state = RodentStates.HUNGRY;
    game.physics.arcade.moveToXY(rodent, target[0], target[1]);

    rodent.body.velocity.x *= speed;
    rodent.body.velocity.y *= speed;
}

function moveChicken(chicken) {
    function chooseDestination() {
        var xMult = Math.random() < 0.5 ? -1 : 1;
        var yMult = Math.random() < 0.5 ? -1 : 1;

        var xDiff = (10 + Math.random() * 80) * xMult;
        var yDiff = (10 + Math.random() * 80) * yMult;
        var newX = chicken.x + xDiff;
        var newY = chicken.y + yDiff;
        return [newX, newY, xDiff, yDiff];
    }

    var dest = chooseDestination();
    
    var newX = dest[0];
    var newY = dest[1];
    var xDiff = dest[2];
    var yDiff = dest[3];

    game.physics.arcade.moveToXY(chicken, newX, newY);

    chicken.dest = dest;

    if (xDiff < 0 && Math.abs(yDiff) < Math.abs(xDiff)) {
        chicken.animations.play('left');
    } else if (yDiff < 0 && Math.abs(xDiff) < Math.abs(yDiff)) {
        chicken.animations.play('up');
    } else if (xDiff > 0 &&Math.abs(xDiff) > Math.abs(yDiff)) {
        chicken.animations.play('right');
    } else {
        chicken.animations.play('down');
    }

    chicken.state = ChickenStates.MOVING_TO_POINT;
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

                f.anchor.setTo(0.5, 0.5);

                game.physics.arcade.enable(f);

                f.body.moves = false;

                group.add(f);
            }
        }
    }
}

function createFood(rect, group) {
    var x = rect.x + 8 + (Math.random() * (rect.width - 96));
    var y = rect.y + 8 + (Math.random() * (rect.height - 96));
    
    var f = game.add.sprite(x, y, 'food', Math.floor(Math.random() * 64))
    f.scale.setTo(2, 2);

    game.physics.arcade.enable(f); 
    f.body.moves = false;
    
    group.add(f);
}

function createChickens(rect, group) {
    var x = rect.x + (rect.width / 4) + (Math.random() * (rect.width / 2));
    var y = rect.y + (rect.height / 4) + (Math.random() * (rect.height / 2));

    var chicken = game.add.sprite(x, y, 'chicken00');
    
    chicken.anchor.setTo(0.5, 0.5);
    chicken.scale.setTo(1.5, 1.5);
    
    game.physics.arcade.enable(chicken);
    
    chicken.animations.add('down', [0, 1, 2], 10, true);
    chicken.animations.add('left', [3, 4, 5], 10, true);
    chicken.animations.add('right', [6, 7, 8], 10, true);
    chicken.animations.add('up', [9, 10, 11], 10, true);
    
    chicken.state = ChickenStates.STOPPED;
    chicken.dest = [0, 0];
    group.add(chicken);
}

function stopChicken(chicken) {
    chicken.dest = [0, 0];
    chicken.body.velocity.x = 0;
    chicken.body.velocity.y = 0;
    chicken.animations.stop();
    chicken.state = ChickenStates.STOPPED;
}

CoopCommander.Game = {preload: preload, create: create, update: update};