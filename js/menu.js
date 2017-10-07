

function init(args) {
    CoopCommander.Menu.args = args;
}

function preload() {
   
}

function create() {
    var args = CoopCommander.Menu.args;

    start_label = game.add.text(200, 200, 'Start', { font: '24px Arial', fill: '#fff'})
    start_label.inputEnabled = true;
    start_label.events.onInputUp.add(function() {
        startGame();
    });
}


function startGame() {
    game.state.start('Game');//, true, false, {});
}

CoopCommander.Menu = {init: init, preload: preload, create: create};