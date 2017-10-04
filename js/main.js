var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'game');

game.state.add('Game', CoopCommander.Game);
game.state.start('Game');