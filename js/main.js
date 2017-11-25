var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'game');

game.state.add('Boot', CoopCommander.Boot);
game.state.add('Preload', CoopCommander.Preload);
game.state.add('Menu', CoopCommander.Menu);
game.state.add('Game', CoopCommander.Game);
game.state.add('Score', CoopCommander.Score);
game.state.add('Cutscene', CoopCommander.Cutscene);
game.state.add('Help', CoopCommander.Help);
game.state.start('Boot');