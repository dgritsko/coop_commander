(function() {
    var loadingBar;

    function preload() {
        Util.preloadState(game);

        setupLoadingScreen();

        // Sprites
        game.load.image('grass00', 'assets/grass00.png');
        game.load.image('grass01', 'assets/grass01.png');
        game.load.spritesheet('dirt01', 'assets/dirt01.png', 48, 48);
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
        game.load.spritesheet('simpletrap', 'assets/simpletrap.png', 48, 48);
        game.load.spritesheet('poison', 'assets/ratpoison.png', 48, 48);
        game.load.image('cloud00', 'assets/cloud00.png');
        game.load.spritesheet('fox00', 'assets/fox00.png', 47, 44);
        game.load.spritesheet('vulture00', 'assets/vulture00.png', 40, 40);
        game.load.spritesheet('garbagetruck00', 'assets/garbagetruck00.png', 308, 142);
        game.load.image('ufo00', 'assets/ufo00.gif');
        game.load.image('beam00', 'assets/beam00.png');
        game.load.spritesheet('powerups', 'assets/powerups.png', 24, 24);
        game.load.spritesheet('cat00', 'assets/cat00.png', 48, 48);
        game.load.spritesheet('john', 'assets/john.png', 32, 48);
        game.load.spritesheet('hat', 'assets/hat.png', 48, 48);
        game.load.image('shed', 'assets/shed.png');
        game.load.spritesheet('snaptrap', 'assets/snaptrap.png', 48, 48);
        game.load.spritesheet('humanetrap', 'assets/humanetrap.png', 96, 48);
        
        // Sounds
        game.load.audio('whoosh00', 'assets/sound/fx/whoosh00.mp3');
        game.load.audio('click00', 'assets/sound/fx/click00.wav');
        game.load.audio('footsteps00', 'assets/sound/fx/footsteps00.wav');
        game.load.audio('squeak00', 'assets/sound/fx/squeak00.wav');
        game.load.audio('squawk00', 'assets/sound/fx/squawk00.mp3');
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
        game.load.audio('foxsay', 'assets/sound/fx/foxsayshort.mp3');
        game.load.audio('alert00', 'assets/sound/fx/alert00.wav');
        game.load.audio('bonus00', 'assets/sound/fx/bonus00.wav');
        game.load.audio('cash', 'assets/sound/fx/cash.wav');
        game.load.audio('crunch00', 'assets/sound/fx/crunch00.wav');
        game.load.audio('powerupspawn', 'assets/sound/fx/powerupspawn.mp3');
        game.load.audio('snap00', 'assets/sound/fx/snap00.wav');
        game.load.audio('snap01', 'assets/sound/fx/snap01.mp3');
        game.load.audio('speedup00', 'assets/sound/fx/speedup00.mp3');
        game.load.audio('speedup01', 'assets/sound/fx/speedup01.wav');
        game.load.audio('speedup02', 'assets/sound/fx/speedup02.wav');
        game.load.audio('splat00', 'assets/sound/fx/splat00.wav');
        game.load.audio('splat01', 'assets/sound/fx/splat01.wav');
        game.load.audio('success01', 'assets/sound/fx/success01.wav');
        game.load.audio('success02', 'assets/sound/fx/success02.wav');
        game.load.audio('success03', 'assets/sound/fx/success03.wav');
        game.load.audio('meow00', 'assets/sound/fx/meow00.mp3');
        
        // Music
        game.load.audio('music00', 'assets/sound/music/Rolemusic_-_Keiken_soku.mp3');
        game.load.audio('music01', 'assets/sound/music/sawsquarenoise_-_01_-_Interstellar.mp3');

        game.load.audio('sandman', 'assets/sound/music/sandman.mp3');
    }

    function setupLoadingScreen() {
        var titleLabel = game.add.bitmapText(game.world.centerX, 60, 'blackOpsOne', 'Coop Defender', 64);
        titleLabel.anchor.setTo(0.5, 0.5);

        var papaGLabel = game.add.bitmapText(game.world.centerX - titleLabel.width / 2, 20, 'blackOpsOne', 'Papa G\'s', 20);
        papaGLabel.anchor.setTo(0, 0.5);

        var subtitleLabel = game.add.bitmapText(game.world.centerX, 100, 'blackOpsOne', 'Inspired by true events', 24);
        subtitleLabel.anchor.setTo(0.5, 0.5);

        loadingBar = game.add.sprite(game.world.centerX, 650, 'loading_bar');
        loadingBar.anchor.setTo(0.5, 0.5);
        loadingBar.animations.add('default', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 24, true);

        var label = game.add.bitmapText(game.world.centerX, 650, 'blackOpsOne', 'Loading...', 28);
        label.anchor.setTo(0.5, 0.5);

        var loadingImage = game.add.sprite(game.world.centerX, game.world.centerY, 'papa_g');
        loadingImage.anchor.setTo(0.5, 0.5);
    }

    function create() {
        game.audio = new AudioManager(game);
        game.state.start('Menu');
    }

    function loadUpdate() {
        loadingBar.animations.play('default');
    }

    CoopDefender.Preload = {preload: preload, create: create, loadUpdate: loadUpdate};
})();