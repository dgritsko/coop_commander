CoopCommander.Game = {
    preload: function() {
        game.load.image('grass', 'assets/grass00.png');
        
        game.scale.scaleMode = Phaser.ScaleManager.NONE; // SHOW_ALL
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
    },    
    create: function() {
        for (var x = 0; x < game.width; x += 100) {
            for (var y = 0; y < game.height; y += 100) {
                game.add.sprite(x, y, 'grass');
            }
        }
        
    },    
    update: function() {
    }
};