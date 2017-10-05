function preload() {
    // TODO: Load "Loading" image
    game.load.image('loading', 'assets/loading.png');
}

function create() {
    game.scale.scaleMode = Phaser.ScaleManager.NONE; // SHOW_ALL
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    game.state.start('Preload');
}

CoopCommander.Boot = {preload: preload, create: create};