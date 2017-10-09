

function init(args) {
    CoopCommander.Score.args = args;
}

function preload() {
   
}

function create() {
    game.camera.flash(0x000000, 250);

    var args = CoopCommander.Score.args;

    var foodText = game.add.text(200, 200, 'Food: ' + args.foodCount, { fontSize: '20px', fill: '#fff' })
}

function update() {
    if (game.input.activePointer.isDown) {
        game.camera.fade('#000000', 250);
        game.camera.onFadeComplete.add(function() { 
            game.state.start('Menu');
        }, this);
    }
}

CoopCommander.Score = {init: init, preload: preload, create: create, update: update};