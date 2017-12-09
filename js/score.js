(function() {
    function init(args) {
        CoopCommander.Score.args = args;
    }

    function preload() {
    
    }

    var playerName;
    var scoreText;
    var maxLength = 100;

    var remainingTime;

    function create() {
        game.stage.disableVisibilityChange = true;
        
        game.stage.backgroundColor = 0x001933;

        var args = CoopCommander.Score.args;

        var gameOverText = game.add.bitmapText(game.world.centerX, game.world.centerY, 'blackOpsOne', 'Game Over', 28);
        gameOverText.anchor.setTo(0.5, 0.5);

        // var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        // spaceKey.onDown.add(function() {
        //     showMenu();
        // }, this);
       
        enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        enterKey.onDown.add(function() { 
            showMenu();
        }, this);

        var clouds = Util.drawClouds(game);
        
        Util.drawGrass(game);

        game.camera.flash('#000000', 250);

        playerName = '';
        scoreText = game.add.bitmapText(game.world.centerX, game.world.centerY + 34, 'blackOpsOne', '', 28);
        scoreText.anchor.setTo(0.5, 0.5);
        
        getInput();

        remainingTime = game.time.now + (1000 * 20);
        doneLabel = game.add.bitmapText(game.world.width - 170, 20, 'blackOpsOne', 'Done', 28);

        doneLabel.inputEnabled = true;
        doneLabel.events.onInputUp.add(function() {
            showMenu();
        }, this);
    }

    function update() {
        scoreText.text = playerName + '_';

        var remainingSeconds = Math.floor((remainingTime - game.time.now) / 1000);

        if (remainingSeconds <= 0) {
            showMenu();
        }

        doneLabel.text = 'Done (' + remainingSeconds + ')';
    }

    function shutdown() {
        game.camera.onFadeComplete.removeAll();        
    }

    function showMenu() {
        game.camera.fade('#000000', 250);
        game.camera.onFadeComplete.add(function() { 
            console.log('TODO: Save score for', playerName);

            game.state.start('Menu');
        }, this);
    }

    function getInput() {
        game.input.keyboard.addCallbacks(this, null, function(evt) { 
            // var char = String.fromCharCode(evt.keyCode).toString();
            // var pattern = /[A-Za-z0-9 ]/;
            // if (pattern.test(char)) {

            if (evt.key.length == 1 && playerName.length < maxLength) {
                playerName += evt.key;
            } else if (evt.keyCode === 8) {
                evt.preventDefault();
                playerName = playerName.length > 0 ? playerName.slice(0, playerName.length - 1) : '';
            }
        }, null);
    }

    CoopCommander.Score = {init: init, preload: preload, create: create, update: update, shutdown: shutdown};
})();