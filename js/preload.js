function preload() {
    var loading = game.add.sprite(game.world.centerX, game.world.centerY, 'loading');
    loading.anchor.setTo(0.5, 0.5);

    game.load.image('grass', 'assets/grass00.png');
    game.load.spritesheet('player', 'assets/player.png', 64, 64);
    game.load.spritesheet('rat00', 'assets/rat00.png', 32, 32);
    game.load.spritesheet('chicken00', 'assets/chicken00.png', 48, 48);
    game.load.spritesheet('fence00', 'assets/fence00.png', 48, 48);
    game.load.spritesheet('food', 'assets/food.png', 16, 16);
}

function create() {
    game.state.start('Game');
}

CoopCommander.Preload = {preload: preload, create: create};