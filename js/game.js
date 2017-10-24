(function() {
    var pen = new Phaser.Rectangle(720, 120, 8 * 48, 10 * 48);

    var gameState = {};

    var hud = {};

    var rats = [];
    var chickens = [];

    function init(args) {
        hud = {};
        rats = [];
        chickens = [];

        gameState = {
            playerSpeed: 200,
            maxActiveRats: 4
        };

        if (args) {
            _.extend(gameState, args);

            gameState.level += 1;
            gameState.totalRats = 3;
            gameState.ratsKilled = 0;
            gameState.ratsTrapped = 0;
            gameState.ratsRetreated = 0;            
        } else {
            gameState.level = 1;
            gameState.flashlights = 3;
            gameState.foodCount = 10;
            gameState.score = 0;
            gameState.upgradePoints = 0;
            gameState.initialRats = 2;            
            gameState.swingCount = 0;            
            gameState.totalRats = 3;
            gameState.ratsKilled = 0;
            gameState.ratsTrapped = 0;
            gameState.ratsRetreated = 0;
        }

        console.log(gameState);
    }

    function preload() {
    }

    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        game.stage.disableVisibilityChange = true;
        
        drawGrass();

        setupPlayer();

        setupInput();

        rodents = game.add.group();
        for (var i = 0; i < gameState.initialRats; i++) {
            createRat();
        }

        fence = game.add.group();
        drawFence(pen, fence);

        food = game.add.group();
        flock = game.add.group();
        for (var i = 0; i < gameState.foodCount; i++) {
            createFood(pen, food);
            createChicken();
        }

        drawHud();
    }

    function update() {
        movePlayer();

        var targets = food.children.map(function(item) { return [item.x, item.y]; });
        for (var i = 0; i < rats.length; i++) {
            var rat = rats[i];
            rat.update(targets);

            if (rat.sprite.alive && !rat.sprite.inCamera) {
                rat.kill();
                // TODO: Distinguish between "scared" vs. "not scared"?
                gameState.ratsRetreated += 1;
            }
        }

        for (var i = 0; i < chickens.length; i++) {
            chickens[i].update();
        }

        game.physics.arcade.collide(fence, flock, function(fenceSegment, chicken) {
            var actualChicken = _.find(chickens, function(c) { return c.id == chicken.id; });

            if (actualChicken && actualChicken.isMoving()) {
                actualChicken.stop();
            }
        });

        game.physics.arcade.collide(rodents, food, function(rodent, foodItem) {
            
        }, function(rodent, foodItem) {
            var rat = _.find(rats, function(r) { return r.id == rodent.id; });

            if (rat && rat.shouldEat()) {
                rat.eat();
                foodItem.kill();
                food.remove(foodItem);
                gameState.foodCount -= 1;
                fxChomp.play();
            }

            return false;
        });

        if (shovel.alpha) {
            handleAttacks();
        }

        var remainingRats = getRemainingRats();

        // TODO: Account for "dead" rats?        
        if (rodents.children.length < gameState.maxActiveRats && remainingRats > 0 && rodents.children.length < remainingRats) {
            createRat();
        }

        var gameOver = food.children.length == 0;
        var levelComplete = remainingRats <= 0;

        var state = { 
            foodCount: food.children.length,
            level: gameState.level,
            flashlights: gameState.flashlights,
            score: gameState.score,
            upgradePoints: gameState.upgradePoints,
            swingCount: gameState.swingCount,
            totalRats: gameState.totalRats,
            ratsKilled: gameState.ratsKilled,
            ratsTrapped: gameState.ratsTrapped,
            ratsRetreated: gameState.ratsRetreated
        };

        if (gameOver) {
            game.state.start('Score', true, false, state);
            return;
        }

        if (levelComplete) {
            game.state.start('Cutscene', true, false, state);
            return;
        }

        updateHud();
    }

    function handleAttacks() {
        game.physics.arcade.collide(rodents, shovelHead, function(weapon, rodent) {
            
        }, function(weapon, rodent) {
            var rat = _.find(rats, function(r) { return r.id == rodent.id; });

            if (rodent.hitBySwing && rodent.hitBySwing >= gameState.swingCount) {
                return false;
            }

            // Keep track of the last swing index that hit the rat... this seems like a crummy way to do this but it works
            rodent.hitBySwing = gameState.swingCount;
            fxHit.play();
            // TODO: Maybe we should just injure the rat?
            killRat(rat);

            return false;         
        });
    }

    function getRemainingRats() {
        return gameState.totalRats - (gameState.ratsKilled + gameState.ratsTrapped + gameState.ratsRetreated);
    }

    function createRat() {
        rats.push(new Rat(rodents, rats.length));
        fxSqueak.play();
    }

    function createChicken() {
        chickens.push(new Chicken(flock, chickens.length, pen));
    }

    function movePlayer() {
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        var diagonalVelocity = 0.70710678118; // 1/sqrt(2)

        var xVelocity = 0;
        var yVelocity = 0;
        var animation = '';

        if (cursors.left.isDown) {
            animation = 'left';
            if (cursors.up.isDown) {
                xVelocity = -diagonalVelocity;
                yVelocity = -diagonalVelocity;
            } else if (cursors.down.isDown) {
                xVelocity = -diagonalVelocity;
                yVelocity = diagonalVelocity;
            } else {
                shovel.x = -8;
                shovel.y = 8;
                xVelocity = -1;
            }
        } else if (cursors.right.isDown) {
            animation = 'right';
            if (cursors.up.isDown) {
                xVelocity = diagonalVelocity;
                yVelocity = -diagonalVelocity;
            } else if (cursors.down.isDown) {
                xVelocity = diagonalVelocity;
                yVelocity = diagonalVelocity;
            } else {
                shovel.x = 8;
                shovel.y = 8;
                xVelocity = 1;
            }
        } else if (cursors.up.isDown) {
            animation = 'up';
            yVelocity = -1;
        } else if (cursors.down.isDown) {
            animation = 'down';
            yVelocity = 1;
        }

        if (xVelocity || yVelocity) {
            if (!fxFootsteps.isPlaying) {
                fxFootsteps.play();
            }
        } else {
            fxFootsteps.stop();
        }

        player.body.velocity.x += (xVelocity * gameState.playerSpeed);    
        player.body.velocity.y += (yVelocity * gameState.playerSpeed);

        if (animation) {
            player.animations.play(animation);
        } else {
            player.animations.stop();
        }
    }

    function drawGrass() {
        var grassSprite = 'grass00';

        var grassSize = game.cache.getImage(grassSprite).width;
        
        for (var x = 0; x < game.width; x += grassSize) {
            for (var y = 0; y < game.height; y += grassSize) {
                game.add.sprite(x, y, grassSprite);
            }
        }
    }

    function setupPlayer() {
        player = game.add.sprite(100, 100, 'player');

        // TODO: Add shovel to group so that we can set the z-index correctly

        // TODO: Adjust the scaling so that it's the appropriate size for the player
        shovel = game.make.sprite(0, 0, 'shovel');
        shovel.alpha = 0;
        shovel.scale.setTo(0.5, 0.5);
        shovel.anchor.setTo(0.5, 0);
        
        player.addChild(shovel);

        shovelHead = game.make.sprite(0, 64, 'hitbox00');
        shovelHead.alpha = 0;
        shovelHead.anchor.setTo(0.5, 0.5);
        shovel.addChild(shovelHead);
        
        player.scale.setTo(2, 2);
        player.anchor.setTo(0.5, 0.5);

        game.physics.arcade.enable(shovel);
        game.physics.arcade.enable(shovelHead);

        game.physics.arcade.enable(player);

        player.body.collideWorldBounds = true;

        player.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7, 8], 10, true);
        player.animations.add('left', [9, 10, 11, 12, 13, 14, 15, 16, 17], 10, true);
        player.animations.add('down', [18, 19, 20, 21, 22, 23, 24, 25, 26], 10, true);
        player.animations.add('right', [27, 28, 29, 30, 31, 32, 33, 34, 35], 10, true);

        fxWhoosh = game.add.sound('whoosh00');
        fxWhoosh.allowMultiple = true;
        fxFootsteps = game.add.sound('footsteps00');
        fxFootsteps.loop = true;
        fxFootsteps.volume = 0.2;
        fxSqueak = game.add.sound('squeak00');
        fxHit = game.add.sound('bang00');
        fxHit.allowMultiple = true;
        fxScream = game.add.sound('scream00');
        fxChomp = game.add.sound('chomp00');
    }

    function setupInput() {
        cursors = game.input.keyboard.createCursorKeys();

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(function() { 
            gameState.swingCount += 1;

            // TODO: Cancel previous tween so that it doesn't kill the shovel mid-swing

            // TODO: Appropriate direction swing if player is not moving

            if (player.body.velocity.x == 0) {
                // TODO: Wat do about vertical-only swings?
                if (player.body.velocity.y > 0) {

                } else {
                    
                }
            } else {            
                if (player.body.velocity.x > 0) {
                    startAngle = 180;
                    endAngle = 0;
                } else {
                    startAngle = 179;
                    endAngle = 0;
                }            
            }

            shovel.alpha = 1;
            shovel.angle = startAngle;
            var tween = game.add.tween(shovel).to({ angle: endAngle }, 200, Phaser.Easing.Quartic.InOut);
            
            tween.onComplete.add(function() {
                shovel.alpha = 0;
            });
        
            tween.start();
            fxWhoosh.play();
            
        }, this);

        var ctrlKey = game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
        ctrlKey.onDown.add(function() {
            useFlashlight();
        }, this);

        var shiftKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        shiftKey.onDown.add(function() {
            fxScream.play();
            console.log('todo: yell (scare nearby rats)');
        }, this);

        var pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
        pauseKey.onDown.add(function() {
            console.log('todo: pause menu');
            game.paused = !game.paused;
        }, this);
    }

    function useFlashlight() {
        if (gameState.flashlights <= 0) {
            return;
        }

        gameState.flashlights -= 1;

        game.camera.flash(0xFFFFFF, 250);

        var removed = hud.flashlights.splice(-1);

        removed[0].destroy();

        for (var i = rodents.children.length - 1; i >= 0; i--) {
            var rodent = rodents.children[i];
            var rat = _.find(rats, function(r) { return r.id == rodent.id; });
            killRat(rat);
        }
    }

    function killRat(rat) {
        rat.kill();
        gameState.ratsKilled += 1;
        gameState.score += 10;

        console.log('Rats remaining: ' + getRemainingRats());
    }

    function drawHud() {
        function addText(x, y, text) {
            return game.add.bitmapText(x, y, 'blackOpsOne', text + '', 24);
        }
        
        hud.levelText = addText(10, 10, 'Level ' + gameState.level);

        hud.flashlightText = addText(10, 40, gameState.flashlights);

        hud.flashlights = [];

        for (var i = 0; i < gameState.flashlights; i++) {
            var f = game.add.sprite(44 + i * 30, 40, 'flashlight');
            f.scale.setTo(1/3.8, 1/3.8);
            hud.flashlights.push(f);
        }

        hud.foodText = addText(10, 70, gameState.foodCount);

        hud.food = [];

        for (var i = 0; i < gameState.foodCount; i++) {
            console.log('TODO: draw food in HUD');
        }

        hud.scoreText = addText(10, 100, gameState.score);

        hud.upgradePointText = addText(10, 130, gameState.upgradePoints);
    }

    function updateHud() {
        hud.flashlightText.setText(gameState.flashlights);
        hud.foodText.setText(gameState.foodCount);
        hud.scoreText.setText(gameState.score);
        hud.upgradePointText.setText(gameState.upgradePoints);
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

    function shutdown() {
        console.log('TODO: Call .destroy() on anything that we still have a reference to so as not to cause memory leaks');

        fxFootsteps.stop();
        fxHit.stop();
        fxScream.stop();
        fxWhoosh.stop();
    }

    CoopCommander.Game = {init: init, preload: preload, create: create, update: update, shutdown: shutdown};
})();