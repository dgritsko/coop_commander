(function() {
    function preload() {
        // Fonts
        game.load.bitmapFont('blackOpsOne', 'assets/fonts/BlackOpsOne.png', 'assets/fonts/BlackOpsOne.fnt');

        // Sprites
        game.load.image('grass00', 'assets/grass00.png');
        game.load.image('grass01', 'assets/grass01.png');
        game.load.spritesheet('player', 'assets/player.png', 64, 64);
        game.load.spritesheet('rat00', 'assets/rat00.png', 32, 32);
        game.load.spritesheet('chicken00', 'assets/chicken00.png', 48, 48);
        game.load.spritesheet('fence00', 'assets/fence00.png', 48, 48);
        game.load.spritesheet('food', 'assets/food.png', 16, 16);
        game.load.image('menu_arrow', 'assets/menu_arrow.png');
        game.load.image('sun', 'assets/sun.png');
        game.load.image('flashlight', 'assets/flashlight.png');
        game.load.image('shovel', 'assets/shovel.png');
        game.load.image('test', 'assets/test.png');
        
        // Sounds
        game.load.audio('whoosh00', 'assets/sound/fx/whoosh00.mp3');
        game.load.audio('click00', 'assets/sound/fx/click00.wav');
        game.load.audio('footsteps00', 'assets/sound/fx/footsteps00.wav');
        game.load.audio('squeak00', 'assets/sound/fx/squeak00.wav');
        game.load.audio('cluck00', 'assets/sound/fx/cluck00.wav');
        game.load.audio('eating00', 'assets/sound/fx/eating00.wav');
        game.load.audio('bang00', 'assets/sound/fx/bang00.wav');
        game.load.audio('smack00', 'assets/sound/fx/smack00.wav');
        game.load.audio('smack01', 'assets/sound/fx/smack01.flac');
        
        // Music
        game.load.audio('music00', 'assets/sound/music/Rolemusic_-_Keiken_soku.mp3');
        game.load.audio('music01', 'assets/sound/music/sawsquarenoise_-_01_-_Interstellar.mp3');
    }

    function create() {
        pauseDuration = game.time.now + 1000;

        var titleLabel = game.add.bitmapText(game.world.centerX, 60, 'blackOpsOne', 'Papa G\'s Coop Commando', 64);
        titleLabel.anchor.setTo(0.5, 0.5);

        

        loadingBar = game.add.sprite(game.world.centerX, 650, 'loading_bar');
        loadingBar.anchor.setTo(0.5, 0.5);
        loadingBar.animations.add('default', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 24, true);

        var label = game.add.bitmapText(game.world.centerX, 650, 'blackOpsOne', 'Loading...', 28);
        label.anchor.setTo(0.5, 0.5);

        // TODO: Show artwork
    }

    function update() {
        loadingBar.animations.play('default');

        if (game.time.now > pauseDuration) {
            game.camera.fade('#000000', 250);
            game.camera.onFadeComplete.add(function() { 
                game.state.start('Menu');   
            }, this);
        }
    }

    CoopCommander.Preload = {preload: preload, create: create, update: update};
})();