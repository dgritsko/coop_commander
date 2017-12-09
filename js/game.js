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

    function init(args) {
        hud = {};
        rats = [];
        chickens = [];

        gameState = { };

        if (args && args.previousState) {
            _.extend(gameState, args.previousState);
        } else {
            var initialState = {
                level: 1,
                flashlights: 3,
                foodCount: 10,
                score: 0,
                money: 0,
                swingCount: 0
            };

            _.extend(gameState, initialState);
        }

        gameState.inactiveRats = [];
        gameState.activeRats = GameLevels.level(gameState.level);

        if (gameState.money <= 0) {
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

        player = new Player();
        
        setupInput();

        mode = Modes.Play;

        gameState.activeRats.forEach(function(r) {
            var ratTypes = _.filter(RatTypes, function(t) { return r.class == t.class && r.size == t.size; });
            
            if (ratTypes.length == 1) {
                var spawnTime = r.spawn * 1000;
                game.time.events.add(spawnTime, function() {
                    createRat(ratTypes[0]);
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

        game.time.events.add(1500, function() {
            game.camera.fade('#000000', 250);
            game.camera.onFadeComplete.add(function() { 
                var ratInfos = _.map(gameState.inactiveRats, function(r) { return { level: r.level, state: r.state, rank: r.type.rank, class: r.type.class, size: r.type.size, spriteName: r.sprite.key, scale: r.sprite.scale }; });
                gameState.currentRatInfo = ratInfos;

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
            placeTraps();
        }

        if (mode == Modes.Play) {
            playGame();
        }

        if (mode == Modes.Outro) {
            player.move();
            updateHud();
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
                rat.kill(RatStates.ESCAPED);
                gameState.inactiveRats.push(rat);
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

        var playerBounds = player.sprite.getBounds();        
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
                        createFood(pen, food);                
                        break;
                    case 1:
                        player.increaseSpeed();
                        game.time.events.add(1000 * 10, function() {
                            player.resetSpeed();
                        });
                    break;
                    case 2:
                        gameState.money += 1;
                        break;
                }
            }
        }

        if (player.shovel.alpha) {
            handleAttacks();
        }

        var gameOver = food.children.length == 0;
        var levelComplete = gameState.inactiveRats.length == gameState.activeRats.length;

        var state = { 
            foodCount: food.children.length,
            level: gameState.level,
            flashlights: gameState.flashlights,
            score: gameState.score,
            money: gameState.money,
            swingCount: gameState.swingCount,
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
            killRat(rat, RatStates.KILLED_BY_SHOVEL);

            return false;         
        });
    }

    function createRat(type) {
        rats.push(new Rat(rodents, type, gameState.level));
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
        fxZap.volume = 0.7;
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
            // TODO: Pause menu
            
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
            killRat(rat, RatStates.KILLED_BY_FLASHLIGHT);
        }
    }

    function killRat(rat, newState) {
        rat.kill(newState);
        gameState.score += rat.type.score;
        gameState.inactiveRats.push(rat);
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
            var x = 10 + i * 30;

            var f = game.add.sprite(x, 130, 'flashlight');
            f.scale.setTo(1/3.8, 1/3.8);
            hud.flashlights.push(f);
        }
    }

    function updateHud() {
        //hud.flashlightText.setText(gameState.flashlights);
        hud.chickenText.setText('Flock: ' + gameState.foodCount);
        hud.scoreText.setText('Score: ' + gameState.score);
        hud.upgradePointText.setText('$' + gameState.money);
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

    function spawnPowerups() {
        var lifetime = 8;

        var spawnTime = 1;

        game.time.events.add(1000 * spawnTime, function() {
            var powerup = new Powerup(game);
            powerups.push(powerup);

            game.time.events.add(1000 * lifetime, function() {
                powerup.kill();
                powerups = _.filter(powerups, function(p) { return p !== powerup; });
            });
        });
    }

    function render() {
        game.debug.text(gameState.inactiveRats.length + ' / ' + gameState.activeRats.length, 2, 14, "#00ff00");   
    }

    function shutdown() {
        fxFootsteps.stop();
        fxHit.stop();
        fxScream.stop();
        fxWhoosh.stop();

        game.camera.onFadeComplete.removeAll();
    }

    CoopCommander.Game = {init: init, preload: preload, create: create, update: update, render: render, shutdown: shutdown};
})();