(function() {
    var Modes = {
        Setup: 0,
        Intro: 1,
        Play: 2,
        Outro: 3
    };

    var pen = new Phaser.Rectangle(860, 120, 8 * 48, 11 * 48);

    var gameState;

    var hud = {};

    var rats = [];
    var chickens = [];
    var items = [];
    var rodents;
    var powerups = [];

    var mode = Modes.Setup;
    var pauseMenu;

    function init(args) {
        hud = {};
        rats = [];
        chickens = [];
        items = [];
        powerups = [];

        gameState = { };

        if (args && args.showHints) {
            GameUtil.setupHints(game);
        }

        if (args && args.previousState) {
            _.extend(gameState, args.previousState);
        } else {
            var initialState = {
                level: 1,
                flashlights: 3,
                foodCount: 10,
                score: 0,
                money: 0,
                swingCount: 0,
                allDeadRats: [],
                blood: true,
                debug: false
            };

            _.extend(gameState, initialState);
        }

        gameState.initialFoodCount = gameState.foodCount;
        gameState.initialMoney = gameState.money;

        gameState.inactiveRats = [];
        gameState.activeRats = GameLevels.level(gameState.level);

        if (gameState.money <= 0) {
            mode = Modes.Intro;
        } else {
            mode = Modes.Setup;
        }
    }

    function preload() {
        Util.preloadState(game);
    }

    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

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

        coop = GameUtil.drawCoop(game, pen);
    }

    function beginGame() {
        var ratSpawns = _.pluck(gameState.activeRats, 'spawn');
        spawnPowerups(ratSpawns);

        rodents = game.add.group();
        food = game.add.group();
        flock = game.add.group();

        var coopBounds = coop.getBounds();
        for (var i = 0; i < gameState.foodCount; i++) {
            createFood();
            createChicken();
        }

        player = new Player();
        
        setupInput();

        mode = Modes.Play;

        gameState.activeRats.forEach(function(r) {
            var ratTypes = _.filter(RatTypes, function(t) { return r.class == t.class && r.size == t.size; });
            
            if (ratTypes.length == 1) {
                var spawnTime = r.spawn * 1000;
                game.time.events.add(spawnTime, function() {
                    createRat(ratTypes[0], r.x, r.y);
                });
            } else {
                console.log('error: couldn\'t find correct rat info for ', r, ratTypes);
            }
        });
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

        chickens.forEach(function(c) { c.stop(); });

        game.time.events.add(1500, function() {
            game.camera.fade('#000000', 250);
            game.camera.onFadeComplete.add(function() { 
                gameState.currentRatInfo = GameUtil.getRatInfos(gameState.inactiveRats);

                var itemInfos = _.map(items, function(i) { return { id: i.info.id, x: i.position.x, y: i.position.y }; })
                gameState.currentItemInfo = itemInfos;

                game.state.start('Cutscene', true, false, gameState);
            }, this);            
        });
    }

    function beginSetup() {
        // Existing items should look like this, where 'id' is index into the Items array:
        //{'id': 0, 'x': 100, 'y': 200}, {'id': 2, 'x': 300, 'y': 300}];
        var existingItems = gameState.currentItemInfo || [];

        store = new Store(gameState.money, existingItems, gameState.level);

        store.newItemCallback(function() {
            gameState.money = store.money;
            updateHud();
        });
    }    

    function update() {
        if (mode == Modes.Setup) {
            placeItems();
        }

        if (mode == Modes.Play) {
            playGame();
        }

        if (mode == Modes.Outro) {
            player.move();
            updateHud();
        }
    }

    function placeItems() {
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
            rat.update(targets, items, player, gameState);

            if (rat.sprite.alive && !rat.sprite.inCamera) {
                rat.kill(RatStates.ESCAPED, gameState);                
            }
        }

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.update) {
                item.update(game);
            }
        }

        // Occasionally play a cluck.
        if (Math.random() < 0.001) {
            game.audio.play(AudioEvents.CHICKEN_CLUCK);
        }

        var coopBounds = coop.getBounds();
        for (var i = 0; i < chickens.length; i++) {
            chickens[i].update();

            if (Phaser.Rectangle.containsPoint(coopBounds, chickens[i].sprite)) {
                if (chickens[i].isMoving()) {
                    chickens[i].stop();
                }
            } else {
                game.physics.arcade.collide(fence, chickens[i].sprite, function(fenceSegment, c) {
                    if (chickens[i].isMoving()) {
                        chickens[i].stop();
                    }
                });
            }
        }

        game.physics.arcade.collide(rodents, food, function(rodent, foodItem) {
            
        }, function(rodent, foodItem) {
            var rat = _.find(rats, function(r) { return r.id == rodent.id; });

                if (rat && rat.shouldEat()) {
                    rat.escape();
                    foodItem.kill();
                    food.remove(foodItem);
                    gameState.foodCount -= 1;
    
                    game.audio.play(AudioEvents.RAT_EAT);
                }    

            return false;
            });

        var playerBounds = player.sprite.getBounds();
        var originalWidth = playerBounds.width;
        var originalHeight = playerBounds.height;

        playerBounds = playerBounds.scale(0.5, 0.75).offset(originalWidth * 0.25, originalHeight * 0.25);

        for (var i = 0; i < powerups.length; i++) {
            var powerup = powerups[i];

            if (!powerup.isActive) {
                continue;
            }

            var powerupBounds = powerup.sprite.getBounds();
        
            if (Phaser.Rectangle.intersects(playerBounds, powerupBounds)) {
                powerup.kill();
                // TODO: Play sound effect

                switch (powerup.id) {
                    case 0:
                        gameState.foodCount += 1;
                        createFood();    
                        createChicken();
                        game.audio.play(AudioEvents.POWERUP_EGG_PICKUP);
                        break;
                    case 1:
                        player.increaseSpeed();
                        // game.time.events.add(1000 * 10, function() {
                        //     player.resetSpeed();
                        // });
                        game.audio.play(AudioEvents.POWERUP_BOOTS_PICKUP);
                    break;
                    case 2:
                        gameState.money += 25;
                        game.audio.play(AudioEvents.POWERUP_MONEY_PICKUP);
                        break;
                    case 3:
                        gameState.flashlights += 1;
                        addFlashlight();
                        game.audio.play(AudioEvents.POWERUP_FLASHLIGHT_PICKUP);
                        break;
                }
            }
        }

        if (player.shovel.alpha) {
            handleAttacks();
        }

        for (var i = 0; i < items.length; i++) {
            if (typeof(items[i].update) != 'undefined') {
                items[i].update();
            }
        }

        var gameOver = food.children.length == 0;
        var levelComplete = gameState.inactiveRats.length == gameState.activeRats.length;

        if (gameOver) {
            var state = { 
                foodCount: food.children.length,
                level: gameState.level,
                flashlights: gameState.flashlights,
                score: gameState.score,
                money: gameState.money,
                swingCount: gameState.swingCount,
            };

            // Add anything killed this level to the list of previously killed rats
            var currentRatInfo = GameUtil.getRatInfos(gameState.inactiveRats);
            var currentDeadRats = _.where(currentRatInfo, { isDead: true });
            state.allDeadRats = (gameState.allDeadRats || []).concat(currentDeadRats);

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

            if (rat.isDead()) {
                return false;
            }

            // Keep track of the last swing index that hit the rat... this seems like a crummy way to do this but it works
            rodent.hitBySwing = gameState.swingCount;
            game.audio.play(AudioEvents.RAT_HIT);
            rat.kill(RatStates.KILLED_BY_SHOVEL, gameState);

            if (gameState.blood) {
                var vector = Phaser.Point.subtract(rat.sprite.position, player.sprite.position);
                vector.normalize();

                var emitter = game.add.emitter(rat.sprite.position.x, rat.sprite.position.y, 10);
                emitter.particleDrag = new Phaser.Point(400, 400);
                var maxVelocity = 500;

                var xVal = maxVelocity * vector.x;
                var yVal = maxVelocity * vector.y;

                emitter.setXSpeed(Math.min(0, xVal), Math.max(0, xVal));
                emitter.setYSpeed(Math.min(0, yVal), Math.max(0, yVal));
                emitter.makeParticles('blood', [0,1,2,3,4]);
                emitter.start(true, 1250, null, 10);
            }

            return false;         
        });
    }

    function createRat(type, x, y) {
        rats.push(new Rat(rodents, type, gameState.level, x, y));
        game.audio.play(AudioEvents.RAT_SPAWN);
    }

    function createChicken() {
        var spawnArea = new Phaser.Rectangle();
        spawnArea.copyFrom(pen);
        spawnArea.scale(0.85, 0.9);

        chickens.push(new Chicken(flock, chickens.length, spawnArea));
    }

    function setupInput() {
        cursors = game.input.keyboard.createCursorKeys();

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(function() { 
            gameState.swingCount += 1;
            game.audio.play(AudioEvents.SWING_SHOVEL);
            player.attack(game);
        }, this);

        var fKey = game.input.keyboard.addKey(Phaser.Keyboard.F);
        fKey.onDown.add(function() {
            useFlashlight();
        }, this);

        // TODO: Implement this or take it out
        // var shiftKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        // shiftKey.onDown.add(function() {
        //     game.audio.play(AudioEvents.SCREAM);
        // }, this);

        var pauseKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
        pauseKey.onDown.add(function() {
            if (!game.paused) {
                pauseMenu = drawMenu();
            } else {
                pauseMenu.kill();
            }
            
            game.paused = !game.paused;
        }, this);

        var escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        escKey.onDown.add(function() {
            if (!game.paused) {
                pauseMenu = drawMenu();
            } else {
                pauseMenu.kill();
            }
            
            game.paused = !game.paused;
        }, this);

        var bKey = game.input.keyboard.addKey(Phaser.Keyboard.B);
        bKey.onDown.add(function() {
            gameState.blood = !(gameState.blood || false);
        });

        var debugKey = game.input.keyboard.addKey(Phaser.Keyboard.TILDE);
        debugKey.onDown.add(function() {
            gameState.debug = !(gameState.debug || false);
            
            if (!gameState.debug) {
                game.debug.reset();
            }
        });
    }

    function drawMenu() {
        var menuWidth = 500;
        var menuHeight = 400;

        var menu = GameUtil.drawKey(game, game.world.centerX - menuWidth / 2, game.world.centerY - menuHeight / 2, menuWidth, menuHeight);

        var continueButton = GameUtil.drawTextButton(game, menuWidth * 0.25 - 30, 60, 'Continue', function() {
            menu.kill();
            game.paused = false;
        }, this);
        menu.addChild(continueButton);
        continueButton.tint = 0x70665B;

        var quitButton = GameUtil.drawTextButton(game, menuWidth * 0.75 - 44, 60, 'Quit', function() {
            game.state.start('Menu');
            game.paused = false;
        }, this);
        menu.addChild(quitButton);
        quitButton.tint = 0x70665B;

        debugItems = [continueButton, quitButton];

        function drawLabel(x, y, text, size) {
            size = size || 18;
            var l = game.add.bitmapText(x, y, 'blackOpsOne', text, size);
            l.anchor.setTo(0.5, 0.5);
            menu.addChild(l);
            l.tint = 0x70665B;
        }

        var keySize = 40;
        var keyX = 290;
        var keyY = 260;
        var keySeparator = 6;

        var spaceKey = GameUtil.drawKey(game, 50, keyY + keySize + keySeparator, keySize * 5, keySize);
        menu.addChild(spaceKey);

        var firstRowY = 170;

        var flashlightKey = GameUtil.drawKey(game, 130, firstRowY, keySize, keySize, 'F');
        menu.addChild(flashlightKey);

        var pauseKey = GameUtil.drawKey(game, 336, firstRowY, keySize, keySize, 'P');
        menu.addChild(pauseKey);

        var upKey = GameUtil.drawKey(game, keyX + keySize + keySeparator, keyY, keySize, keySize, '↑');
        menu.addChild(upKey);

        var downKey = GameUtil.drawKey(game, keyX + keySize + keySeparator, keyY + keySeparator + keySize, keySize, keySize, '↓');
        menu.addChild(downKey);
        
        var leftKey = GameUtil.drawKey(game, keyX, keyY + keySeparator + keySize, keySize, keySize, '←');
        menu.addChild(leftKey);
        
        var rightKey = GameUtil.drawKey(game, keyX + keySize * 2 + keySeparator * 2, keyY + keySeparator + keySize, keySize, keySize, '→');
        menu.addChild(rightKey); 
        
        drawLabel(spaceKey.centerX, spaceKey.y + spaceKey.height + 16, 'Attack');
        drawLabel(downKey.centerX, downKey.y + downKey.height + 16, 'Move');
        drawLabel(pauseKey.centerX, pauseKey.y + pauseKey.height + 16, 'Pause');  
        drawLabel(flashlightKey.centerX, flashlightKey.y + flashlightKey.height + 16, 'Flashlight'); 
        
        drawLabel(menu.width / 2, 24, 'Paused', 32);
        drawLabel(menu.width / 2, 140, 'Controls', 32);

        return menu;
    }
    
    function useFlashlight() {
        if (gameState.flashlights <= 0) {
            game.camera.flash(0x000000, 250);
            game.audio.play(AudioEvents.NO_FLASHLIGHTS);
            return;
        }

        game.audio.play(AudioEvents.FLASHLIGHT);
        
        gameState.flashlights -= 1;

        game.camera.flash(0xFFFFFF, 250);

        var removed = hud.flashlights.splice(-1);

        removed[0].destroy();

        for (var i = rodents.children.length - 1; i >= 0; i--) {
            var rodent = rodents.children[i];
            var rat = _.find(rats, function(r) { return r.id == rodent.id; });
            rat.kill(RatStates.KILLED_BY_FLASHLIGHT, gameState);
        }
    }

    function drawHud() {
        function addText(x, y, text, size) {
            size = size || 24;

            return game.add.bitmapText(x, y, 'blackOpsOne', text + '', size);
        }
        
        hud.levelText = addText(10, 10, 'Level ' + gameState.level);
        hud.chickenText = addText(10, 40, 'Flock: ' + gameState.foodCount);
        hud.scoreText = addText(10, 70, 'Score: ' + gameState.score);
        hud.upgradePointText = addText(10, 100, '$' + gameState.money);
        //hud.flashlightText = addText(10, 100, gameState.flashlights);
        
        hud.flashlights = [];

        for (var i = 0; i < gameState.flashlights; i++) {
            //var x = 44 + i * 30;
            addFlashlight();
        }
    }

    function addFlashlight() {
        var x = 10 + hud.flashlights.length * 30;
        
        var f = game.add.sprite(x, 130, 'flashlight');
        f.scale.setTo(1/3.8, 1/3.8);
        hud.flashlights.push(f);
    }

    function updateHud() {
        //hud.flashlightText.setText(gameState.flashlights);
        hud.chickenText.setText('Flock: ' + gameState.foodCount);
        hud.scoreText.setText('Score: ' + gameState.score);
        hud.upgradePointText.setText('$' + gameState.money);
    }

    function createFood() {
        var group = food;
        var rect = pen;
        var excludeRect = coop.getBounds();

        var getCoordinates = function() {
            var x = rect.x + 8 + (Math.random() * (rect.width - 96));
            var y = rect.y + 8 + (Math.random() * (rect.height - 96));
            return new Phaser.Point(x, y);
        }

        var coordinates;
        while (true) {
            coordinates = getCoordinates();

            if (!Phaser.Rectangle.containsPoint(excludeRect, coordinates)) {
                break;
            }
        }

        var x = coordinates.x;
        var y = coordinates.y;
        
        var foodIndexes = [0,12,13,14,15,16,18,21,23,24,25,26,27,28,29,32,33,34,35,36,37,38,40,43,44,46,47,48,49,50,56,59,61,62,63];
        var foodIndex = Phaser.ArrayUtils.getRandomItem(foodIndexes);

        var f = game.add.sprite(x, y, 'food', foodIndex);
        f.scale.setTo(2, 2);

        game.physics.arcade.enable(f); 
        f.body.moves = false;
        
        group.add(f);
    }

    function spawnPowerups(ratSpawns) {
        var lifetime = 8;
        var firstSpawn = 10;
        var spawnInterval = 15;

        var lastRatSpawn = _.max(ratSpawns);

        var availableIds = _.pluck(PowerupTypes, 'id');

        var spawns = [];

        for (var i = firstSpawn; i <= lastRatSpawn; i += spawnInterval) {
            
            var id = -1;
            if (availableIds.length > 0) {
                id = Phaser.ArrayUtils.removeRandomItem(availableIds);
            } else {
                // $$$ or flashlight
                id = Phaser.ArrayUtils.getRandomItem([2, 3]);
            }

            if (id >= 0) {
                spawns.push({ id: id, time: i });
            }
        }

        spawns.forEach(function(spawn) {
            game.time.events.add(1000 * spawn.time, function() {
                var powerup = new Powerup(game, spawn.id);
                game.audio.play(AudioEvents.POWERUP_SPAWN);

                powerups.push(powerup);

                game.time.events.add(1000 * lifetime, function() {
                    powerup.kill();
                    powerups = _.filter(powerups, function(p) { return p !== powerup; });
                });
            });
        });
    }

    function render() {
        if (gameState.debug) {
            game.debug.text(gameState.inactiveRats.length + ' / ' + gameState.activeRats.length, 2, 14, "#00ff00");   

            // if (mode == Modes.Play) {
            //     game.debug.geom(player.sprite.getBounds(), 'rgba(0, 0, 255, 0.5)');
            // }

            items.forEach(function(i) {
                if (i.render) {
                    i.render(game);
                }
            });
        } 
    }

    function shutdown() {
        Util.shutdownState(game);
    }

    CoopDefender.Game = {init: init, preload: preload, create: create, update: update, render: render, shutdown: shutdown};
})();