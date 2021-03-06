(function() {
    function preload() {
        // Load everything needed for loading screen

        // Sprites/images
        game.load.spritesheet('loading_bar', 'assets/loading_bar.png', 256, 64);
        game.load.image('papa_g', 'img/papa_g.png');

        // Fonts
        game.load.bitmapFont('blackOpsOne', 'assets/fonts/BlackOpsOne.png', 'assets/fonts/BlackOpsOne.fnt');
    }

    function create() {
        var scaleMode = CoopDefender.fullscreen ? Phaser.ScaleManager.SHOW_ALL : Phaser.ScaleManager.NONE;

        game.scale.scaleMode = scaleMode;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        game.state.start('Preload');
    }

    CoopDefender.Boot = {preload: preload, create: create};
})();