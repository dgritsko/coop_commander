(function() {
    isStarting = false;

    function init() {
        isStarting = false;
    }

    function preload() {
        Util.preloadState(game);
    }

    function create() {
        game.audio.playMusic(MusicEvents.INTRO_START);

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(function() {
            playGame();
        }, this);
        
        enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        enterKey.onDown.add(function() { 
            playGame();
        }, this);

        escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        escKey.onDown.add(function() { 
            showMenu();
        }, this);

        setupMessages();
    }

    function setupMessages() {
        var displayText = game.add.bitmapText(game.world.centerX, game.world.centerY, 'blackOpsOne', '', 34);
        displayText.anchor.setTo(0.5, 0.5);

        function showText(text, time) {
            game.time.events.add(time * 1000, function() {
                displayText.text = text;
            }, this);
        }

        function clearText(time) {
            game.time.events.add(time * 1000, function() {
                displayText.text = '';
            }, this);
        }

        showText('Dusk.', 2);
        clearText(6);

        showText('The bamboo rustles softly. They’ll be here soon.', 9);
        clearText(12);

        showText('The rats are a scourge, a pestilence.', 16);
        showText('An endless hunger.', 19);
        clearText(22);

        showText('Roaming the countryside, preying upon the weak.', 24);
        clearText(28);
        
        showText('A pestilence born of instinct and greed.', 30);
        clearText(34);

        showText('But tonight, they\'ve met their match.', 37);
        clearText(40);
        
        showText('The cold steel of your shovel is ready. The traps are set.', 42);
        clearText(45);
        
        showText('They\'re here.', 47);

        game.time.events.add(49000, playGame, this);
    }

    function playGame() {
        if (isStarting) {
            return;
        }
        isStarting = true;

        game.camera.fade('#000000', 4000);
        game.camera.onFadeComplete.add(function() { 
            game.state.start('Game', true, false, { showHints: true });
        }, this);
    }

    function showMenu() {
        if (isStarting) {
            return;
        }
        isStarting = true;

        game.camera.fade('#000000', 250);
        game.camera.onFadeComplete.add(function() { 
            game.state.start('Menu');
        }, this);
    }

    function update() {
    }

    function shutdown() {
        Util.shutdownState(game); 
    }

    CoopDefender.Intro = {init: init, preload: preload, create: create, update: update, shutdown: shutdown};
})();