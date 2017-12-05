(function() {
    var gameState = {};
    var updateCallbacks = [];
    var predator = undefined;
    var sounds = [];

    function init(args) {
        updateCallbacks = [];
        gameState = args;
    }

    function preload() {
    }

    function create() {
        game.stage.disableVisibilityChange = true;
        game.stage.backgroundColor = '#000000';

        fxSuccess = game.add.sound('success00');

        Util.drawClouds(game);

        sun = game.add.sprite(500, 500, 'sun');
        sun.anchor.setTo(0.5, 0.5);

        Util.drawSunrise(sun, game);

        var texts = [
            'first',
            'second',
            'third'
        ];

        levelComplete(texts);

        ground = Util.drawGrass(game);

        drawRats(gameState.ratsKilled);

        var extraDelay = 500 * texts.length;

        game.time.events.add(extraDelay + 1500, drawPredator, this)

        game.time.events.add(extraDelay + 6000, function() { Util.drawSunset(sun, game); }, this);

        game.time.events.add(extraDelay + 8000, nextLevel, this);

        fxSmash = game.add.sound('smash00');
        fxSmash.volume = 0.5;
        sounds.push(fxSmash);
        fxScore = game.add.sound('punch00');
        fxScore.allowMultiple = true;
        sounds.push(fxScore);
        fxPunch = game.add.sound('punch01');
        sounds.push(fxPunch);
        fxChomp = game.add.sound('chomp01');
        fxChomp.volume = 0.5;
        sounds.push(fxChomp);
        fxZap = game.add.sound('zap00');
        fxZap.volume = 0.5;
        sounds.push(fxZap);
        fxSquawk = game.add.sound('squawk00');
        fxSquawk.volume = 0.5;
        sounds.push(fxSquawk);
    }

    function update() {
        for (var i = 0; i < updateCallbacks.length; i++) {
            updateCallbacks[i]();
        }
    }

    function nextLevel() {
        game.camera.fade('#000000', 250);
        game.camera.onFadeComplete.add(function() { 
            game.state.start('Game', true, false, gameState);
        }, this);
    }

    function levelComplete(texts) {
        fxSuccess.play();

        var label = game.add.bitmapText(game.world.centerX, 150, 'blackOpsOne', 'Level ' + gameState.level + ' Complete', 28);
        label.anchor.setTo(0.5, 0.5);
        label.alpha = 0;

        var tween = game.add.tween(label).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None);
        tween.delay(500);

        tween.onComplete.add(function() {
            drawLevelStats(texts);
        });        

        tween.start();
    }

    function drawLevelStats(texts) {
        var fontSize = 24;
        var margin = 2;
        var delay = 500;

        texts.forEach(function(text, index) {
            game.time.events.add(delay * (index + 1), function () {
                fxScore.play();

                var textLabel = game.add.bitmapText(game.world.centerX, 180 + (fontSize + margin) * index, 'blackOpsOne', text, fontSize);
                textLabel.anchor.setTo(0.5, 0.5);

                var t1 = game.add.tween(textLabel.scale).to({ x : 2, y : 2}, 150, Phaser.Easing.Cubic.Out);
                var t2 = game.add.tween(textLabel.scale).to({ x : 1, y : 1}, 150, Phaser.Easing.Cubic.In);
                t1.chain(t2);
                t1.start();
            });
        });
    }

    function drawPredator() {
        var duration = 5000;
        
        var predators = [
            drawVulture,
            drawFox,
            drawGarbageTruck,
            drawAliens
            //drawOldLady,
            //drawBear
        ];

        predators[Math.floor(Math.random() * predators.length)](duration);
    }

    function drawVulture(duration) {
        predator = game.add.sprite(-50, 150, 'vulture00');

        predator.anchor.setTo(0.5, 0.5);
        predator.scale.setTo(2, 2);
        
        predator.animations.add('down', [0, 1, 2], 10, true);
        predator.animations.add('left', [3, 4, 5], 10, true);
        predator.animations.add('right', [6, 7, 8], 10, true);
        predator.animations.add('up', [9, 10, 11], 10, true);

        var hasPlayedChomp = false;
        updateCallbacks.push(function() {
            predator.animations.play('right');

            rats.children.forEach(function(r) {
                if (predator.x >= r.x && r.alpha > 0) {
                    r.alpha = 0;
                }
            });

            if (predator.x >= game.world.centerX && !hasPlayedChomp) {
                hasPlayedChomp = true;
                fxChomp.play();
            }
        });

        var t1 = game.add.tween(predator).to({ x : game.world.width + 50 }, duration, Phaser.Easing.Cubic.InOut);
        var t2 = game.add.tween(predator).to({ y : 525 }, duration/2, Phaser.Easing.Linear.None)
        var t3 = game.add.tween(predator).to({ y : -100 }, duration/2, Phaser.Easing.Cubic.InOut);

        t2.chain(t3);
        t1.start();
        t2.start();

        fxSquawk.play();
    }

    function drawGarbageTruck(duration) {
        predator = game.add.sprite(-150, 535, 'garbagetruck00');
        predator.anchor.setTo(0.5, 0.5);
        
        predator.animations.add('right', [0, 1, 2, 3], 10, true);
        
        updateCallbacks.push(function() {
            predator.animations.play('right');
        });

        var t1 = game.add.tween(predator).to({ x : game.world.width / 2 + 150 }, duration/2, Phaser.Easing.Cubic.Out);
        
        t1.onComplete.add(function() {
            fxSmash.play();
            rats.children.forEach(function(r) {
                r.alpha = 0;
            });
        });

        var t2 = game.add.tween(predator).to({ x : game.world.width + 150 }, duration/2, Phaser.Easing.Cubic.In)

        t1.chain(t2);
        t1.start();

        var fxEngine = game.add.sound('engine00');
        fxEngine.play();

        sounds.push(fxEngine);
    }

    function drawAliens(duration) {
        predator = game.add.sprite(-150, 350, 'ufo00');

        predator.anchor.setTo(0.5, 0.5);
        predator.scale.setTo(0.25, 0.25);

        var t1 = game.add.tween(predator).to({ x : game.world.width / 2 }, duration/2, Phaser.Easing.Cubic.Out);
        var t2 = game.add.tween(predator).to({ x : game.world.width + 150 }, duration/2, Phaser.Easing.Cubic.In)

        t1.chain(t2);

        game.time.events.add(duration/2-250, function() {
            var beam = game.add.sprite(game.world.width/2, 370, 'beam00');
            beam.scale.setTo(1.0, 2.0);
            beam.anchor.setTo(0.5, 0);
            predator.bringToTop();
            game.time.events.add(600, function() {
                beam.alpha = 0;
            }, this);
        });

        t1.onComplete.add(function() {
            fxZap.play();

            for (var i = 0; i < rats.children.length; i++) {
                var rat = rats.children[i];
                rat.body.moves = false;
                game.add.tween(rat).to({y : rat.y - 200}, duration / 10, Phaser.Easing.Cubic.Out).start();
                game.add.tween(rat).to({alpha : 0}, duration / 15, Phaser.Easing.Cubic.Out).start();
            }
        });

        t1.start();

        var fxThrum = game.add.sound('thrum00');
        fxThrum.play();

        sounds.push(fxThrum);
    }

    function drawFox(duration) {
        predator = game.add.sprite(-50, 535, 'fox00');

        predator.anchor.setTo(0.5, 0.5);
        predator.scale.setTo(2.5, 2.5);

        predator.animations.add('down', [0, 1, 2, 3], 10, true);
        predator.animations.add('left', [4, 5, 6, 7], 10, true);
        predator.animations.add('right', [8, 9, 10, 11], 10, true);
        predator.animations.add('up', [12, 13, 14, 15], 10, true);

        // TODO: "What does the Fox say?"

        var hasPlayedChomp = false;
        updateCallbacks.push(function() {
            predator.animations.play('right');

            rats.children.forEach(function(r) {
                if (predator.x >= r.x && r.alpha > 0) {
                    r.alpha = 0;
                }
            });

            if (predator.x >= game.world.centerX && !hasPlayedChomp) {
                hasPlayedChomp = true;
                fxChomp.play();
            }
        });

        var t1 = game.add.tween(predator).to({ x : game.world.width + 50 }, duration, Phaser.Easing.Linear.None);
        t1.start();
    }

    function drawRats(numRats) {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        rats = game.add.group();

        for (var i = 0; i < numRats; i++) {
            var rat = game.add.sprite(game.world.centerX, 500, 'rat00', Math.floor(Math.random() * 12));
            game.physics.arcade.enable(rat);
            rat.anchor.setTo(0.5, 0.5);
            rat.body.bounce.setTo(0.5, 0.5);
            rat.body.gravity.setTo(0, 400);
            rat.body.setSize(10, 10, 10, 10);
            rat.body.velocity.x = (Math.random() * 100) - 50;
            rat.body.velocity.y = (Math.random() * 200) - 150;
            rat.body.angularVelocity = (Math.random() * 180) - 90;
            rat.body.drag = new Phaser.Point(20, 200);
            rats.add(rat);
        }

        var friction = 0.8;
        var minVelocity = 0.05;

        updateCallbacks.push(function() {
            function slowDown(rat) {
                rat.body.angularVelocity *= friction;
                if (rat.body.angularVelocity <= minVelocity) {
                    rat.body.angularVelocity = 0.0;
                }
            }
            game.physics.arcade.collide(rats, rats, function (a, b) {
                slowDown(a);
                slowDown(b);
            });

            game.physics.arcade.collide(rats, ground, function(a, b) {
                a.body.velocity.y = 0;
            });
        });
    }

    function shutdown() {
        predator.destroy();
        predator = null;
    }

    CoopCommander.Cutscene = {init: init, preload: preload, create: create, update: update, shutdown: shutdown};
})();