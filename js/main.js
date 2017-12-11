$(document).bind("keydown", function (e) {
    if (e.keyCode == 8) { // backspace
      e.preventDefault();
    }
});

var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'game');

game.state.add('Boot', CoopDefender.Boot);
game.state.add('Preload', CoopDefender.Preload);
game.state.add('Menu', CoopDefender.Menu);
game.state.add('Game', CoopDefender.Game);
game.state.add('Score', CoopDefender.Score);
game.state.add('Cutscene', CoopDefender.Cutscene);
game.state.add('Help', CoopDefender.Help);
game.state.start('Boot');