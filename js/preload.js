(function() {
    function preload() {
        // Fonts
        game.load.bitmapFont('blackOpsOne', 'assets/fonts/BlackOpsOne.png', 'assets/fonts/BlackOpsOne.fnt');

        // Sprites
        game.load.image('grass00', 'assets/grass00.png');
        game.load.image('grass01', 'assets/grass01.png');
        game.load.spritesheet('player', 'assets/player.png', 64, 64);
        game.load.spritesheet('rat00', 'assets/rat00.png', 32, 32);
        game.load.spritesheet('rat01', 'assets/rat01.png', 32, 32);
        game.load.spritesheet('rat02', 'assets/rat02.png', 32, 32);
        game.load.spritesheet('chicken00', 'assets/chicken00.png', 48, 48);
        game.load.spritesheet('fence00', 'assets/fence00.png', 48, 48);
        game.load.spritesheet('food', 'assets/food.png', 16, 16);
        game.load.image('menu_arrow', 'assets/menu_arrow.png');
        game.load.image('sun', 'assets/sun.png');
        game.load.image('flashlight', 'assets/flashlight.png');
        game.load.image('shovel', 'assets/shovel.png');
        game.load.image('hitbox00', 'assets/hitbox00.png');
        game.load.spritesheet('trap00', 'assets/simpletrap.png', 48, 48);
        game.load.image('trap01', 'assets/ratpoison.png');
        game.load.image('cloud00', 'assets/cloud00.png');
        game.load.spritesheet('fox00', 'assets/fox00.png', 47, 44);
        game.load.spritesheet('vulture00', 'assets/vulture00.png', 40, 40);
        game.load.image('garbagetruck00', 'assets/garbagetruck00.gif');
        game.load.image('ufo00', 'assets/ufo00.gif');
        game.load.image('beam00', 'assets/beam00.png');
        
        // Sounds
        game.load.audio('whoosh00', 'assets/sound/fx/whoosh00.mp3');
        game.load.audio('click00', 'assets/sound/fx/click00.wav');
        game.load.audio('footsteps00', 'assets/sound/fx/footsteps00.wav');
        game.load.audio('squeak00', 'assets/sound/fx/squeak00.wav');
        game.load.audio('cluck00', 'assets/sound/fx/cluck00.wav');
        game.load.audio('eating00', 'assets/sound/fx/eating00.wav');
        game.load.audio('bang00', 'assets/sound/fx/bang00.wav');
        game.load.audio('smack00', 'assets/sound/fx/smack00.wav');
        game.load.audio('scream00', 'assets/sound/fx/scream00.wav');
        game.load.audio('chomp00', 'assets/sound/fx/chomp00.wav');
        game.load.audio('chomp01', 'assets/sound/fx/chomp01.mp3');
        game.load.audio('success00', 'assets/sound/fx/success00.wav');
        game.load.audio('error00', 'assets/sound/fx/error00.wav');
        game.load.audio('error01', 'assets/sound/fx/error01.wav');
        game.load.audio('pop00', 'assets/sound/fx/pop00.wav');
        game.load.audio('pop01', 'assets/sound/fx/pop01.wav');
        game.load.audio('reload00', 'assets/sound/fx/reload00.wav');
        game.load.audio('punch00', 'assets/sound/fx/punch00.wav');
        game.load.audio('punch01', 'assets/sound/fx/punch01.wav');
        game.load.audio('punch02', 'assets/sound/fx/punch02.wav');
        game.load.audio('engine00', 'assets/sound/fx/engine00.wav');
        game.load.audio('zap00', 'assets/sound/fx/zap00.wav');
        game.load.audio('zap01', 'assets/sound/fx/zap01.wav');
        game.load.audio('thrum00', 'assets/sound/fx/thrum00.wav');
        game.load.audio('smash00', 'assets/sound/fx/smash00.wav');
        
        // Music
        game.load.audio('music00', 'assets/sound/music/Rolemusic_-_Keiken_soku.mp3');
        game.load.audio('music01', 'assets/sound/music/sawsquarenoise_-_01_-_Interstellar.mp3');
    }

    function create() {
        pauseDuration = game.time.now + 1000;

        var titleLabel = game.add.bitmapText(game.world.centerX, 60, 'blackOpsOne', 'Papa G\'s Coop Commander', 64);
        titleLabel.anchor.setTo(0.5, 0.5);

        

        loadingBar = game.add.sprite(game.world.centerX, 650, 'loading_bar');
        loadingBar.anchor.setTo(0.5, 0.5);
        loadingBar.animations.add('default', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 24, true);

        var label = game.add.bitmapText(game.world.centerX, 650, 'blackOpsOne', 'Loading...', 28);
        label.anchor.setTo(0.5, 0.5);

        var loadingImage = game.add.sprite(game.world.centerX, game.world.centerY, 'papa_g');
        loadingImage.anchor.setTo(0.5, 0.5);
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