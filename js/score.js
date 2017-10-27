(function() {
    function init(args) {
        CoopCommander.Score.args = args;
    }

    function preload() {
    
    }

    function create() {
        game.stage.backgroundColor = '#000000';

        game.camera.flash(0x000000, 250);

        var args = CoopCommander.Score.args;

        var gameOverText = game.add.bitmapText(game.world.centerX, game.world.centerY, 'blackOpsOne', 'Game Over', 28);
        gameOverText.anchor.setTo(0.5, 0.5);

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(function() {
            showMenu();
        }, this);

        
        enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        enterKey.onDown.add(function() { 
            showMenu();
        }, this);
    }

    function update() {
        if (game.input.activePointer.isDown) {
            showMenu();
        }
    }

    function showMenu() {
        game.camera.fade('#000000', 250);
        game.camera.onFadeComplete.add(function() { 
            game.state.start('Menu');
        }, this);
    }

    CoopCommander.Score = {init: init, preload: preload, create: create, update: update};
})();