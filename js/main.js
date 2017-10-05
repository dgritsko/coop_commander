var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'game');

game.state.add('Boot', CoopCommander.Boot);
game.state.add('Preload', CoopCommander.Preload);
game.state.add('Game', CoopCommander.Game);
game.state.start('Boot');