class Util {
    static preloadState(game) {
        game.stage.disableVisibilityChange = true;

        var mKey = game.input.keyboard.addKey(Phaser.Keyboard.M);
        mKey.onDown.add(function() {
            game.audio.toggleMute();
        }, this);
    }

    static shutdownState(game) {
        game.camera.onFadeComplete.removeAll();   
        game.time.events.removeAll();
        game.input.keyboard.reset(true); 
        game.audio.stopSounds();
    }

    static drawGrass(game) {
        var ground = game.add.group();

        var grassSprite = 'grass01';

        var grassSize = game.cache.getImage(grassSprite).width;
        
        var scale = 0.15;
        var maxScale = 1.5;
        var scaleIncrement = 0.15;
        
        var index = 0;
        for (var y = 450; y < game.height; y += ((grassSize * scale) / 2)) {
            index++;
            scale = Math.min(maxScale, scale + scaleIncrement);

            for (var x = 0; x < game.width; x += (grassSize * scale)) {
                var g = game.add.sprite(x, y, grassSprite);

                g.scale.setTo(scale, scale);
                
                if (y >= 550) {
                    game.physics.arcade.enable(g);
                    g.body.moves = false;
                    ground.add(g);
                }
            }
        }

        return ground;
    }

    static drawSunrise(sun, game) {
        // Sky color
        var t1 = Util.backgroundColor(0x001933, 0xfb9fa4, 500, Phaser.Easing.Cubic.InOut, game);
        var t2 = Util.backgroundColor(0xfb9fa4, 0xa7d9ff, 1000, Phaser.Easing.Quartic.Out, game);

        t1.chain(t2);
        t1.start();

        // Sun tint
        var t3 = Util.tweenColor(0xD55446, 0x00ffffff, 750, Phaser.Easing.Linear.None, function(color) {
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

    static drawSunset(sun, game, callback) {
        // Sky color
        var t1 = Util.backgroundColor(0xa7d9ff, 0xfb9fa4, 1000, Phaser.Easing.Cubic.Out, game);
        var t2 = Util.backgroundColor(0xfb9fa4, 0x001933, 500, Phaser.Easing.Quartic.InOut, game);

        t1.chain(t2);
        t1.start();

        // var sun = game.add.sprite(500, 500, 'sun');
        // sun.anchor.setTo(0.5, 0.5);
        sun.x = 400;
        sun.y = 500;

        // Sun tint
        var t3 = Util.tweenColor(0x00ffffff, 0xD55446, 750, Phaser.Easing.Linear.None, function(color) {
            sun.tint = Util.fromRgb(color);
        }, game);
        t3.start();

        // Sun position
        var t4 = Util.moveAlongArc(sun, 180, 90, 300, 1500, Phaser.Easing.Cubic.Out, game);

        if (callback) {
            t4.onComplete.add(callback);
        }

        t4.start();
    }

    static drawClouds(game) {
        var clouds = game.add.group();

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

            clouds.add(cloud);
        }

        return clouds;
    }

    static moveAlongArc(sprite, startAngle, endAngle, radius, duration, easing, game) {
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

    static tweenColor(startColor, endColor, duration, easing, onUpdateCallback, game) {
        var colorState = {percent : 0};
        
        var tween = game.add.tween(colorState).to({ percent: 100 }, duration, easing);
        
        tween.onUpdateCallback(function() {
            var rgbStart = Util.toRgb(startColor);
            var rgbEnd = Util.toRgb(endColor);

            function interp(index) {
                return Math.round(rgbStart[index] + ((rgbEnd[index] - rgbStart[index]) / 100) * colorState.percent);
            }

            var color = [ interp(0), interp(1), interp(2) ];
            onUpdateCallback(color);
        }, this);

        return tween;
    }

    static backgroundColor(startColor, endColor, duration, easing, game) {
        return Util.tweenColor(startColor, endColor, duration, easing, function(color) {
            var backgroundColor = Util.toColor(color);
            game.stage.backgroundColor = backgroundColor;
        }, game);
    }

    static toRgb(color) {
        var r = (color & 0xff0000) >> 16;
        var g = (color & 0x00ff00) >> 8;
        var b = color & 0x0000ff;
        return [r, g, b];
    }

    static fromRgb(color) {
        var r = color[0] << 16;
        var g = color[1] << 8;
        var b = color[2];
        return r | g | b;
    }

    static toColor(c) {
        function toHex(d) {
            return  ('0'+(Number(d).toString(16))).slice(-2).toUpperCase()
        }

        return '0x' + toHex(c[0]) + toHex(c[1]) + toHex(c[2]);
    }
}