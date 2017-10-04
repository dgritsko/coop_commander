var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

function preload() {
	game.scale.scaleMode = Phaser.ScaleManager.NONE;
	game.scale.pageAlignHorizontally = true;
	game.scale.pageAlignVertically = true;
}

function create() {
}

function update() {

}