

function init(args) {
    CoopCommander.Score.args = args;
}

function preload() {
   
}

function create() {
    var args = CoopCommander.Score.args;

    var foodText = game.add.text(200, 200, 'Food: ' + args.foodCount, { fontSize: '20px', fill: '#fff' })
}

function update() {
    if (game.input.activePointer.isDown) {
        game.state.start('Menu');
    }
}

CoopCommander.Score = {init: init, preload: preload, create: create, update: update};