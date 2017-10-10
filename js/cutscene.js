function init() {
}

function preload() {
}

function create() {
    game.stage.disableVisibilityChange = true;

    sunrise();
    //sunset();

    // predator();

    drawGrass();
}

function update() {

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
    var t1 = backgroundColor(0x001933, 0xfb9fa4, 500, Phaser.Easing.Cubic.InOut);
    var t2 = backgroundColor(0xfb9fa4, 0xa7d9ff, 1000, Phaser.Easing.Quartic.Out);

    t1.chain(t2);
    t1.start();

    var sun = game.add.sprite(500, 500, 'sun');
    sun.anchor.setTo(0.5, 0.5);

    // Sun tint
    var t3 = tweenColor(0xD55446, 0x00ffffff, 750, Phaser.Easing.Linear.None, function(color) {
        sun.tint = fromRgb(color);
    });
    t3.start();

    // Sun position
    var t4 = moveAlongArc(sun, 270, 180, 300, 1500, Phaser.Easing.Bounce.Out);//Phaser.Easing.Cubic.Out);    
    t4.start();
}

function sunset() {
    // Sky color
    var t1 = backgroundColor(0xa7d9ff, 0xfb9fa4, 1000, Phaser.Easing.Cubic.Out);
    var t2 = backgroundColor(0xfb9fa4, 0x001933, 500, Phaser.Easing.Quartic.InOut);

    t1.chain(t2);
    t1.start();

    var sun = game.add.sprite(500, 500, 'sun');
    sun.anchor.setTo(0.5, 0.5);

    // Sun tint
    var t3 = tweenColor(0x00ffffff, 0xD55446, 750, Phaser.Easing.Linear.None, function(color) {
        sun.tint = fromRgb(color);
    });
    t3.start();

    // Sun position
    var t4 = moveAlongArc(sun, 180, 90, 300, 1500, Phaser.Easing.Cubic.Out);//Phaser.Easing.Cubic.Out);    
    t4.start();
}

function drawGrass() {
    var grassSprite = 'grass00';

    var grassSize = game.cache.getImage(grassSprite).width;
    
     for (var x = 0; x < game.width; x += grassSize) {
         for (var y = 450; y < game.height; y += grassSize) {
             game.add.sprite(x, y, grassSprite);
         }
     }
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