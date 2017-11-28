(function() {
    var gameState = {};
    var updateCallbacks = [];

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

        levelComplete();
        
        sunrise();

        grass();

        rats(gameState.ratsKilled);

        clouds();

        game.time.events.add(1500, predator, this)

        game.time.events.add(3000, sunset, this);

        game.time.events.add(5000, nextLevel, this);
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

    function predator() {
        var sprite0 = game.add.sprite(0, 0, 'chicken00');
        
        var t1 = game.add.tween(sprite0).to({ x : 1000 }, 3000, Phaser.Easing.Quartic.InOut);
        var t2 = game.add.tween(sprite0).to({ y : 250 }, 1500, Phaser.Easing.Linear.None)
        var t3 = game.add.tween(sprite0).to({ y : 0 }, 1500, Phaser.Easing.Quartic.InOut);

        t2.chain(t3);
        t1.start();
        t2.start();
    }

    function sunrise() {
        // Sky color
        var t1 = backgroundColor(0x001933, 0xfb9fa4, 250, Phaser.Easing.Cubic.InOut);
        var t2 = backgroundColor(0xfb9fa4, 0xa7d9ff, 500, Phaser.Easing.Quartic.Out);

        t1.chain(t2);
        t1.start();

        sun = game.add.sprite(500, 500, 'sun');
        sun.anchor.setTo(0.5, 0.5);

        // Sun tint
        var t3 = tweenColor(0xD55446, 0x00ffffff, 750, Phaser.Easing.Linear.None, function(color) {
            sun.tint = fromRgb(color);
        });
        t3.start();

        // Sun position
        var t4 = moveAlongArc(sun, 270, 180, 300, 750, Phaser.Easing.Bounce.Out);//Phaser.Easing.Cubic.Out);    

        t4.onComplete.add(function() {
            // TODO
        });

        t4.start();        
    }

    function sunset() {
        // Sky color
        var t1 = backgroundColor(0xa7d9ff, 0xfb9fa4, 1000, Phaser.Easing.Cubic.Out);
        var t2 = backgroundColor(0xfb9fa4, 0x001933, 500, Phaser.Easing.Quartic.InOut);

        t1.chain(t2);
        t1.start();

        // var sun = game.add.sprite(500, 500, 'sun');
        // sun.anchor.setTo(0.5, 0.5);
        sun.x = 500;
        sun.y = 500;

        // Sun tint
        var t3 = tweenColor(0x00ffffff, 0xD55446, 750, Phaser.Easing.Linear.None, function(color) {
            sun.tint = fromRgb(color);
        });
        t3.start();

        // Sun position
        var t4 = moveAlongArc(sun, 180, 90, 300, 1500, Phaser.Easing.Cubic.Out);//Phaser.Easing.Cubic.Out);    
        t4.start();
    }

    function grass() {
        var grassSprite = 'grass00';

        var grassSize = game.cache.getImage(grassSprite).width;
        
        for (var x = 0; x < game.width; x += grassSize) {
            for (var y = 450; y < game.height; y += grassSize) {
                game.add.sprite(x, y, grassSprite);
            }
        }
    }

    function clouds() {
        // TODO
        console.log('TODO: Draw clouds');
    }

    function rats(numRats) {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        emitter = game.add.emitter(game.world.centerX, 150);
        emitter.bounce.setTo(0.5, 0.5);
        emitter.setXSpeed(-50, 50);
        emitter.setYSpeed(-50, 50);
        emitter.gravity = new Phaser.Point(0, 400);
        emitter.particleDrag = new Phaser.Point(10, 10);
        emitter.angularDrag = 25;
        emitter.makeParticles('rat00', [0,1,2,3,4,5,6,7,8,9,10,11], numRats, true, true);
        emitter.forEach(function (p) {
            p.body.setSize(10, 10, 10, 10);
            // p.body.setCircle(15);
        }, this);
        emitter.start(false, 0, 100);

        updateCallbacks.push(function() {
            game.physics.arcade.collide(emitter, emitter);
            game.physics.arcade.collide(emitter, emitter, function(a, b) {
                a.body.angularVelocity *= 0.9; 
                b.body.angularVelocity *= 0.9;
            });
    
            emitter.forEach(function (p) {
                //game.debug.body(p);
            }, this);
        });
    }

    function moveAlongArc(sprite, startAngle, endAngle, radius, duration, easing) {
        startAngle = startAngle / (180 / Math.PI);
        endAngle = endAngle / (180 / Math.PI);

        var centerX = sprite.x;
        var centerY = sprite.y;

        sprite.x = centerX + Math.sin(startAngle) * radius;
        sprite.y = centerY + Math.cos(startAngle) * radius;

        var rotationState = { angle: startAngle };

        var tween = game.add.tween(rotationState).to({ angle: endAngle }, duration, easing);
        tween.onUpdateCallback(function() {
            var newX = Math.sin(rotationState.angle) * radius;
            var newY = Math.cos(rotationState.angle) * radius;

            sprite.x = centerX + newX;
            sprite.y = centerY + newY;
        }, this);

        return tween;
    }

    function tweenColor(startColor, endColor, duration, easing, onUpdateCallback) {
        var colorState = {percent : 0};
        
        var tween = game.add.tween(colorState).to({ percent: 100 }, duration, easing);
        
        tween.onUpdateCallback(function() {
            var rgbStart = toRgb(startColor);
            var rgbEnd = toRgb(endColor);

            function interp(index) {
                return Math.round(rgbStart[index] + ((rgbEnd[index] - rgbStart[index]) / 100) * colorState.percent);
            }

            var color = [ interp(0), interp(1), interp(2) ];
            onUpdateCallback(color);
        }, this);

        return tween;
    }

    function backgroundColor(startColor, endColor, duration, easing) {
        return tweenColor(startColor, endColor, duration, easing, function(color) {
            var backgroundColor = toColor(color);
            game.stage.backgroundColor = backgroundColor;
        });
    }

    function toRgb(color) {
        var r = (color & 0xff0000) >> 16;
        var g = (color & 0x00ff00) >> 8;
        var b = color & 0x0000ff;
        return [r, g, b];
    }

    function fromRgb(color) {
        var r = color[0] << 16;
        var g = color[1] << 8;
        var b = color[2];
        return r | g | b;
    }

    function toColor(c) {
        function toHex(d) {
            return  ('0'+(Number(d).toString(16))).slice(-2).toUpperCase()
        }

        return '0x' + toHex(c[0]) + toHex(c[1]) + toHex(c[2]);
    }

    CoopCommander.Cutscene = {init: init, preload: preload, create: create, update: update};
})();