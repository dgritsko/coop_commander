(function() {
    function init(args) {
        CoopCommander.Score.args = args;
    }

    function preload() {
    
    }

    function create() {
        game.stage.backgroundColor = 0x001933;

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

        var clouds = Util.drawClouds(game);
        
        Util.drawGrass(game);

        game.camera.flash('#000000', 250);
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

    function getInput() {
        var text = '';
        
        game.input.keyboard.addCallbacks(this, null, function(evt) { 
            var char = String.fromCharCode(evt.keyCode).toString();
            var pattern = /[A-Za-z0-9\s]/;
            
            if (pattern.test(char)) {
                text += char;
                console.log(text);
            } else if (evt.keyCode === 8) {
                //console.log(evt.keyCode);
                console.log('backspace pressed');
            }
        }, null);
    }

    CoopCommander.Score = {init: init, preload: preload, create: create, update: update};
})();