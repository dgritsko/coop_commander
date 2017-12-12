(function() {
    function init(args) {
        CoopDefender.Score.args = args;
    }

    function preload() {
        Util.preloadState(game);
    }

    var playerName;
    var scoreText;
    var maxLength = 100;
    var doneLabel;

    var remainingTime;

    function create() {
        game.stage.backgroundColor = 0x001933;

        var args = CoopDefender.Score.args;

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

        doneLabel = GameUtil.drawTextButton(game, game.world.width - 170, 20, 'Done', function() {
            showMenu();
        }, this);

        var margin = 10;
        doneLabel.hitArea = new Phaser.Rectangle(-margin, -margin, doneLabel.width + margin * 8, doneLabel.height + margin * 2); 
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
        Util.shutdownState(game); 
    }

    function showMenu() {
        var score = CoopDefender.Score.args.score || 0;
        var level = CoopDefender.Score.args.level || 0;

        $.post('http://gritsko.com/coop_defender/api/scores?name=' + playerName + '&score=' + score + '&level=' + level).always(function() {
            game.camera.fade('#000000', 250);
            game.camera.onFadeComplete.add(function() { 
                game.state.start('Menu');
            }, this);
        });
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

    CoopDefender.Score = {init: init, preload: preload, create: create, update: update, shutdown: shutdown};
})();