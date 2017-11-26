(function() {
    var Modes = {
        Setup: 0,
        Play: 1
    };

    var pen = new Phaser.Rectangle(720, 120, 8 * 48, 10 * 48);

    var gameState = {};

    var hud = {};

    var rats = [];
    var chickens = [];
    var items = [];

    var mode = Modes.Setup;

    function init(args) {
        hud = {};
        rats = [];
        chickens = [];

        gameState = {
            playerSpeed: 200,
            maxActiveRats: 2,
            ratSpeed: 2,
            nextRatSpawn: 0
        };

        if (args) {
            console.log('Args: ', args);

            _.extend(gameState, args);

            gameState.level += 1;
            gameState.totalRats = 3 * gameState.level;
            gameState.maxActiveRats = 2 + gameState.level;
            gameState.ratSpeed = 2 + gameState.level * 0.5;
            gameState.ratsKilled = 0;
            gameState.ratsTrapped = 0;
            gameState.ratsRetreated = 0;            
        } else {
            gameState.level = 1;
            gameState.flashlights = 3;
            gameState.foodCount = 10;
            gameState.score = 0;
            gameState.upgradePoints = 0;
            gameState.swingCount = 0;            
            gameState.totalRats = 3;
            gameState.ratsKilled = 0;
            gameState.ratsTrapped = 0;
            gameState.ratsRetreated = 0;
        }

        console.log(gameState);

        mode = Modes.Setup;
    }

    function preload() {
    }

    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        game.stage.disableVisibilityChange = true;

        setupSounds();

        beginStage();
        
        drawHud();
        
        if (mode == Modes.Setup) {
            beginSetup();
        }

        if (mode == Modes.Play) {
            beginGame();
        }        
    }

    function beginStage() {
        drawGrass();
        
        fence = game.add.group();
        drawFence(pen, fence);
    }

    function beginGame() {
        rodents = game.add.group();
        food = game.add.group();
        flock = game.add.group();
        for (var i = 0; i < gameState.foodCount; i++) {
            createFood(pen, food);
            createChicken();
        }

        player = new Player(gameState.playerSpeed);
        
        setupInput();

        mode = Modes.Play;
    }

    function beginSetup() {
        var existingItems = []; 
        // Existing items should look like this, where 'id' is index into the Items array:
        //{'id': 0, 'x': 100, 'y': 200}, {'id': 2, 'x': 300, 'y': 300}];

        store = new Store(gameState.upgradePoints, existingItems);

        store.newItemCallback(function() {
            gameState.upgradePoints = store.money;
            updateHud();
        });
    }    

    function update() {
        if (mode == Modes.Setup) {
            placeTraps();
        }        

        if (mode == Modes.Play) {
            playGame();
        }
    }

    function placeTraps() {
        store.update();

        if (store.state == StoreStates.DONE) {
            items = store.placedItems;
            beginGame();
        }
    }

    function playGame() {
        player.move();
        
        var targets = food.children.map(function(item) { return [item.x, item.y]; });
        for (var i = 0; i < rats.length; i++) {
            var rat = rats[i];
            rat.update(targets, items, player);

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

        if (player.shovel.alpha) {
            handleAttacks();
        }

        var remainingRats = getRemainingRats();

        // TODO: Account for "dead" rats?        
        if (rodents.children.length < gameState.maxActiveRats && remainingRats > 0 && rodents.children.length < remainingRats) {
            if (gameState.nextRatSpawn < game.time.now) {
                gameState.nextRatSpawn = game.time.now + Phaser.Timer.SECOND * Math.random() * 2;
                createRat();
            }            
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
        game.physics.arcade.collide(rodents, player.shovelHead, function(weapon, rodent) {
            
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
        rats.push(new Rat(rodents, rats.length, gameState.ratSpeed));
        fxSqueak.play();
    }

    function createChicken() {
        chickens.push(new Chicken(flock, chickens.length, pen));
    }

    function drawGrass() {
        var grassSprite = 'grass01';

        var grassSize = game.cache.getImage(grassSprite).width;
        
        for (var x = 0; x < game.width; x += grassSize) {
            for (var y = 0; y < game.height; y += grassSize) {
                game.add.sprite(x, y, grassSprite);
            }
        }
    }

    function setupSounds() {
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
        fxPop = game.add.sound('pop00');
        fxError = game.add.sound('error01');
        fxReload = game.add.sound('reload00');
        fxReload.volume = 0.5;
    }

    function setupInput() {
        cursors = game.input.keyboard.createCursorKeys();

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(function() { 
            performAttack();            
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
            if (game.paused) {
                gameState.pauseEnded = game.time.now;

                var pauseDuration = gameState.pauseEnded - gameState.pauseBegan;
                gameState.nextRatSpawn += pauseDuration;
                console.log('pause duration: ', pauseDuration);
            } else {
                gameState.pauseBegan = game.time.now;
            }
            
            game.paused = !game.paused;
        }, this);
    }

    function performAttack() {
        gameState.swingCount += 1;
        
        // TODO: Cancel previous tween so that it doesn't kill the shovel mid-swing

        // TODO: Appropriate direction swing if player is not moving

        if (player.sprite.body.velocity.x == 0) {
            // TODO: Wat do about vertical-only swings?
            if (player.sprite.body.velocity.y > 0) {

            } else {
                
            }
        } else {            
            if (player.sprite.body.velocity.x > 0) {
                startAngle = 180;
                endAngle = 0;
            } else {
                startAngle = 179;
                endAngle = 0;
            }            
        }

        player.shovel.alpha = 1;
        player.shovel.angle = startAngle;
        var tween = game.add.tween(player.shovel).to({ angle: endAngle }, 200, Phaser.Easing.Quartic.InOut);
        
        tween.onComplete.add(function() {
            player.shovel.alpha = 0;
        });
    
        tween.start();
        fxWhoosh.play();
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
        function addText(x, y, text, size) {
            size = size || 24;

            return game.add.bitmapText(x, y, 'blackOpsOne', text + '', size);
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

        hud.upgradePointText = addText(10, 130, '$' + gameState.upgradePoints);
    }

    function updateHud() {
        hud.flashlightText.setText(gameState.flashlights);
        hud.foodText.setText(gameState.foodCount);
        hud.scoreText.setText(gameState.score);
        hud.upgradePointText.setText('$' + gameState.upgradePoints);
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