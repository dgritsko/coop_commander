(function() {
    var Modes = {
        Setup: 0,
        Intro: 1,
        Play: 2,
        Outro: 3
    };

    var pen = new Phaser.Rectangle(860, 120, 8 * 48, 11 * 48);

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

        GameLevels.level(gameState.level);

        console.log(gameState);

        if (gameState.upgradePoints <= 0) {
            mode = Modes.Intro;
        } else {
            mode = Modes.Setup;
        }
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

        if (mode == Modes.Intro) {
            beginIntro();
        }

        if (mode == Modes.Play) {
            beginGame();
        }
        
        if (mode == Modes.Outro) {
            beginOutro();
        }
    }

    function beginStage() {
        GameUtil.drawGrass(game);
        
        GameUtil.drawDirt(game, pen);

        fence = game.add.group();
        GameUtil.drawFence(game, pen, fence);
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

    function beginIntro() {
        mode = Modes.Intro;

        var introLabel = game.add.bitmapText(game.world.centerX, game.world.centerY, 'blackOpsOne', 'Ready!', 28);
        introLabel.anchor.setTo(0.5, 0.5);

        game.time.events.add(1500, function() {
            var t1 = game.add.tween(introLabel).to({alpha: 0}, 200, Phaser.Easing.Linear.None);
            t1.onComplete.add(function() {
                beginGame();
            });
            t1.start();
        }, this);
    }

    function beginOutro() {
        mode = Modes.Outro;

        game.time.events.add(1500, function() {
            game.camera.fade('#000000', 250);
            game.camera.onFadeComplete.add(function() { 
                game.state.start('Cutscene', true, false, gameState);
            }, this);            
        });
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

        if (mode == Modes.Outro) {
            player.move();
        }
    }

    function placeTraps() {
        store.update();

        if (store.state == StoreStates.DONE) {
            items = store.placedItems;
            beginIntro();
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
            beginOutro();
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
        var type = RatTypes[Math.floor(Math.random() * RatTypes.length)];

        rats.push(new Rat(rodents, rats.length, gameState.ratSpeed, type));
        fxSqueak.play();
    }

    function createChicken() {
        chickens.push(new Chicken(flock, chickens.length, pen));
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
        fxPunch = game.add.sound('punch00');
        fxZap = game.add.sound('zap01');
    }

    function setupInput() {
        cursors = game.input.keyboard.createCursorKeys();

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(function() { 
            gameState.swingCount += 1;
            fxWhoosh.play();
            player.attack(game);
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

        var debugKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
        debugKey.onDown.add(function() {
            // TODO: Add any debug functionality here
            food = game.add.group();
        });
    }
    
    function useFlashlight() {
        if (gameState.flashlights <= 0) {
            return;
        }

        fxZap.play();
        
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