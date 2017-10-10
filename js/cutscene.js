function init() {
}

function preload() {
}

function create() {
    // backgroundColor(0xff0000, 0x0000ff, 1000, function() { 
    //     console.log('done'); 
    // });
}

function update() {

}

function backgroundColor(startColor, endColor, duration, onCompleteCallback) {
    var colorState = {percent : 0};
    
    var tween = game.add.tween(colorState).to({ percent: 100 }, 3000, Phaser.Easing.Quartic.Out);
    
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