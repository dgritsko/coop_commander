function init() {
}

function preload() {
}

function create() {
    sunrise();

    // predator();
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
    // Sky color.
    backgroundColor(0x001933, 0xfb9fa4, 5000, Phaser.Easing.Cubic.InOut, function() { 
        backgroundColor(0xfb9fa4, 0xa7d9ff, 10000, Phaser.Easing.Quartic.Out, function() {

        })
    });

    var sun = game.add.sprite(500, 500, 'chicken00');
    sun.anchor.setTo(0.5, 0.5);

    //moveAlongArc(sprite1, 3.14, -3.14 * 2, 100, 1000)
    //moveAlongArc(sprite1, -45, 45, 500, 2000);
    moveAlongArc(sun, 270, 180, 300, 15000);
    //moveAlongArc(sprite1, 0, 360, 100, 2000);
}

function moveAlongArc(sprite, startAngle, endAngle, radius, duration, onCompleteCallback) {
    startAngle = startAngle / (180 / Math.PI);
    endAngle = endAngle / (180 / Math.PI);

    var centerX = sprite.x;
    var centerY = sprite.y;

    sprite.x = centerX + Math.sin(startAngle) * radius;
    sprite.y = centerY + Math.cos(startAngle) * radius;

    var rotationState = { angle: startAngle };

    var tween = game.add.tween(rotationState).to({ angle: endAngle }, duration, Phaser.Easing.Linear.None);
    tween.onUpdateCallback(function() {
        var newX = Math.sin(rotationState.angle) * radius;
        var newY = Math.cos(rotationState.angle) * radius;

        sprite.x = centerX + newX;
        sprite.y = centerY + newY;
    }, this);

    if (onCompleteCallback) {
        tween.onComplete.add(onCompleteCallback);
    }

    tween.start();
}

function backgroundColor(startColor, endColor, duration, easing, onCompleteCallback) {
    var colorState = {percent : 0};
    
    var tween = game.add.tween(colorState).to({ percent: 100 }, duration, easing);
    
    tween.onUpdateCallback(function() {
        var rgbStart = toRgb(startColor);
        var rgbEnd = toRgb(endColor);

        function interp(index) {
            return Math.round(rgbStart[index] + ((rgbEnd[index] - rgbStart[index]) / 100) * colorState.percent);
        }

        var backgroundColor = toColor([ interp(0), interp(1), interp(2) ]);

        game.stage.backgroundColor = backgroundColor;
    }, this);

    if (onCompleteCallback) {
        tween.onComplete.add(onCompleteCallback);
    }

    tween.start();
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