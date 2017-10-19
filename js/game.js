(function() {
    var pen = new Phaser.Rectangle(720, 120, 8 * 48, 10 * 48);

    var instance = {};

    var hud = {};

    var rats = [];
    var chickens = [];

    function init() {
        instance = [];
        hud = {};
        rats = [];
        chickens = [];

        instance.level = 1;
        instance.flashlights = 3;
        instance.food = 10;
        instance.score = 0;
        instance.upgradePoints = 0;
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
        for (var i = 0; i < 2; i++) {
            createRat();
        }

        fence = game.add.group();
        drawFence(pen, fence);

        food = game.add.group();
        for (var i = 0; i < instance.food; i++) {
            createFood(pen, food);
        }

        flock = game.add.group();
        for (var i = 0; i < 10; i++) {
            createChicken();
        }

        drawHud();
    }

    function update() {
        movePlayer();

        var targets = food.children.map(function(item) { return [item.x, item.y]; });
        for (var i = 0; i < rats.length; i++) {
            rats[i].update(targets);
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
            }

            return false;
        });

        game.physics.arcade.collide(rodents, shovelHead, function(rodent, weapon) {

        }, function(rodent, weapon) {
            console.log('hit');
            fxHit.play();
            return false;
        });

        if (rodents.children.length < 2) {
            createRat();
        }

        if (food.children.length == 0) {
            game.state.start('Score', true, false, { foodCount: 0 });
        }

        updateHud();
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

        var speedFactor = 150;

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

        player.body.velocity.x += (xVelocity * speedFactor);    
        player.body.velocity.y += (yVelocity * speedFactor);

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

        shovel = game.make.sprite(0, 0, 'shovel');
        shovel.alpha = 0;
        shovel.scale.setTo(0.5, 0.5);
        shovel.anchor.setTo(0.5, 0);
        
        player.addChild(shovel);

        shovelHead = game.make.sprite(0, 64, 'hitbox00');
        shovelHead.alpha = 1;
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
    }

    function setupInput() {
        cursors = game.input.keyboard.createCursorKeys();

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(function() { 
            // TODO: Cancel previous tween so that it doesn't kill the shovel mid-swing

            if (player.body.velocity.x == 0) {
                // TODO: Wat do about vertical-only swings?
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
    }

    function useFlashlight() {
        if (instance.flashlights <= 0) {
            return;
        }

        instance.flashlights -= 1;

        game.camera.flash(0xFFFFFF, 100);

        var removed = hud.flashlights.splice(-1);

        removed[0].destroy();

        console.log('TODO: Kill all rats');
    }

    function drawHud() {
        function addText(x, y, text) {
            return game.add.bitmapText(x, y, 'blackOpsOne', text + '', 24);
        }
        
        hud.levelText = addText(10, 10, 'Level ' + instance.level);

        hud.flashlightText = addText(10, 40, instance.flashlights);

        hud.flashlights = [];

        for (var i = 0; i < instance.flashlights; i++) {
            var f = game.add.sprite(44 + i * 30, 40, 'flashlight');
            f.scale.setTo(1/3.8, 1/3.8);
            hud.flashlights.push(f);
        }

        hud.foodText = addText(10, 70, instance.food);

        hud.food = [];

        for (var i = 0; i < instance.food; i++) {
            console.log('TODO: draw food');
        }

        hud.scoreText = addText(10, 100, instance.score);

        hud.upgradePointText = addText(10, 130, instance.upgradePoints);
    }

    function updateHud() {
        hud.flashlightText.setText(instance.flashlights);
        hud.foodText.setText(instance.food);
        hud.scoreText.setText(instance.score);
        hud.upgradePointText.setText(instance.upgradePoints);
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
    }

    CoopCommander.Game = {init: init, preload: preload, create: create, update: update, shutdown: shutdown};
})();