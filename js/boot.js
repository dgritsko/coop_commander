(function() {
    function preload() {
        // TODO: Load artwork for Preload screen
        game.load.spritesheet('loading_bar', 'assets/loading_bar.png', 256, 64);
        game.load.image('papa_g', 'img/papa_g.png');
    }

    function create() {
        game.scale.scaleMode = Phaser.ScaleManager.NONE; // SHOW_ALL
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        game.state.start('Preload');
    }

    CoopCommander.Boot = {preload: preload, create: create};
})();