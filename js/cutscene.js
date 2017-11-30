(function() {
    var gameState = {};
    var updateCallbacks = [];
    var predator = undefined;

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

        for (var i = 0; i < 3; i++) {
            var j = i;
            var callback = (function() {
                
            })();

            game.time.events.add(1000 + 500 * i, function() {
                //fxPunch.play();
            }, this);
        }

        drawClouds();

        drawSunrise();

        levelComplete();

        ground = Util.drawGrass(game);

        drawRats(gameState.ratsKilled, 100);

        game.time.events.add(1500, drawPredator, this)

        game.time.events.add(6000, drawSunset, this);

        game.time.events.add(8000, nextLevel, this);
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

    function levelComplete() {
        fxSuccess.play();

        var label = game.add.bitmapText(game.world.centerX, 150, 'blackOpsOne', 'Level ' + gameState.level + ' Complete', 28);
        label.anchor.setTo(0.5, 0.5);
        label.alpha = 0;

        var tween = game.add.tween(label).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None);
        tween.delay(300);

        tween.onComplete.add(function() {
            // TODO
        });        

        tween.start();
    }

    function drawPredator() {
        var duration = 5000;
        
        var predators = [
            drawVulture,
            drawFox,
            //drawOldLady,
            //drawGarbageTruck,
            //drawBear,
            drawAliens
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

        updateCallbacks.push(function() {
            predator.animations.play('right');
        });

        var t1 = game.add.tween(predator).to({ x : game.world.width + 50 }, duration, Phaser.Easing.Cubic.InOut);
        var t2 = game.add.tween(predator).to({ y : 525 }, duration/2, Phaser.Easing.Linear.None)
        var t3 = game.add.tween(predator).to({ y : -100 }, duration/2, Phaser.Easing.Cubic.InOut);

        t2.chain(t3);
        t1.start();
        t2.start();
    }

    function drawGarbageTruck() {
        predator = game.add.sprite(50, 50, 'garbagetruck00');
        var t1 = game.add.tween(predator).to({ x : 1000 }, 3000, Phaser.Easing.Quartic.InOut);
        t1.start()
    }

    function drawAliens(duration) {
        predator = game.add.sprite(-150, 350, 'ufo00');

        predator.anchor.setTo(0.5, 0.5);
        predator.scale.setTo(0.25, 0.25);

        var t1 = game.add.tween(predator).to({ x : game.world.width / 2 }, duration/2, Phaser.Easing.Cubic.Out);
        var t2 = game.add.tween(predator).to({ x : game.world.width + 150 }, duration/2, Phaser.Easing.Cubic.In)

        t1.chain(t2);
        t1.start();
    }

    function drawFox(duration) {
        predator = game.add.sprite(-50, 535, 'fox00');

        predator.anchor.setTo(0.5, 0.5);
        predator.scale.setTo(2.5, 2.5);

        predator.animations.add('down', [0, 1, 2, 3], 10, true);
        predator.animations.add('left', [4, 5, 6, 7], 10, true);
        predator.animations.add('right', [8, 9, 10, 11], 10, true);
        predator.animations.add('up', [12, 13, 14, 15], 10, true);

        updateCallbacks.push(function() {
            predator.animations.play('right');
        });

        var t1 = game.add.tween(predator).to({ x : game.world.width + 50 }, duration, Phaser.Easing.Linear.None);
        t1.start();
    }

    function drawSunrise() {
        // Sky color
        var t1 = Util.backgroundColor(0x001933, 0xfb9fa4, 500, Phaser.Easing.Cubic.InOut, game);
        var t2 = Util.backgroundColor(0xfb9fa4, 0xa7d9ff, 1000, Phaser.Easing.Quartic.Out, game);

        t1.chain(t2);
        t1.start();

        sun = game.add.sprite(500, 500, 'sun');
        sun.anchor.setTo(0.5, 0.5);

        // Sun tint
        var t3 = Util.tweenColor(0xD55446, 0x00ffffff, 1500, Phaser.Easing.Linear.None, function(color) {
            sun.tint = Util.fromRgb(color);
        }, game);
        t3.start();

        // Sun position
        var t4 = Util.moveAlongArc(sun, 270, 180, 300, 1500, Phaser.Easing.Bounce.Out, game);

        t4.onComplete.add(function() {
            // TODO
        });

        t4.start();        
    }

    function drawSunset() {
        // Sky color
        var t1 = Util.backgroundColor(0xa7d9ff, 0xfb9fa4, 1000, Phaser.Easing.Cubic.Out, game);
        var t2 = Util.backgroundColor(0xfb9fa4, 0x001933, 500, Phaser.Easing.Quartic.InOut, game);

        t1.chain(t2);
        t1.start();

        // var sun = game.add.sprite(500, 500, 'sun');
        // sun.anchor.setTo(0.5, 0.5);
        sun.x = 500;
        sun.y = 500;

        // Sun tint
        var t3 = Util.tweenColor(0x00ffffff, 0xD55446, 750, Phaser.Easing.Linear.None, function(color) {
            sun.tint = Util.fromRgb(color);
        }, game);
        t3.start();

        // Sun position
        var t4 = Util.moveAlongArc(sun, 180, 90, 300, 1500, Phaser.Easing.Cubic.Out, game);
        t4.start();
    }

    function drawClouds() {
        for (var i = 0; i < 10; i++) {
            var maxX = game.world.width;
            var maxY = 300;

            var x = Math.random() * maxX - 300;
            var y = Math.random() * maxY;

            var cloud = game.add.sprite(x, y, 'cloud00');
            cloud.alpha = 0.5;

            var scaleFactor = 1 - ((maxY - y) / maxY);
            cloud.scale.setTo(scaleFactor, scaleFactor);

            game.physics.arcade.enable(cloud);
            cloud.body.velocity.x = 10 + 50 * scaleFactor;
        }
    }

    function drawRats(numRats, duration) {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        emitter = game.add.emitter(game.world.centerX, 500);
        emitter.bounce.setTo(0.5, 0.5);
        emitter.setXSpeed(-50, 50);
        emitter.setYSpeed(-150, 50);
        emitter.gravity = new Phaser.Point(0, 400);
        emitter.particleDrag = new Phaser.Point(10, 10);
        emitter.angularDrag = 25;
        emitter.makeParticles('rat00', [0,1,2,3,4,5,6,7,8,9,10,11], numRats, true, true);
        emitter.forEach(function (p) {
            p.body.setSize(10, 10, 10, 10);
            // p.body.setCircle(15);
        }, this);

        var interval = duration / numRats;

        emitter.start(false, 0, interval);

        var friction = 0.8;
        var minVelocity = 0.05;

        updateCallbacks.push(function() {
            function slowDown(particle) {
                particle.body.angularVelocity *= friction;
                if (particle.body.angularVelocity <= minVelocity) {
                    particle.body.angularVelocity = 0.0;
                }
            }

            //game.physics.arcade.collide(emitter, emitter);
            game.physics.arcade.collide(emitter, emitter, function(a, b) {
                slowDown(a);
                slowDown(b);
            });

            emitter.forEach(function (p) {
                if (predator && predator.x >= p.x) {
                    p.alpha = 0;

                    // TODO: Play sound effect
                }

                //game.debug.body(p);
            }, this);

            game.physics.arcade.collide(emitter, ground, function(a, b) {
                slowDown(a);
                a.body.velocity.y = 0;
                a.body.velocity.x *= 0.975;
            });
        });
    }

    CoopCommander.Cutscene = {init: init, preload: preload, create: create, update: update};
})();