CoopCommander.Game = {
    preload: function() {
        game.load.image('grass', 'assets/grass00.png');
		game.load.spritesheet('player', 'assets/player.png', 64, 64);
		game.load.spritesheet('rat00', 'assets/rat00.png', 32, 32);
        
        game.scale.scaleMode = Phaser.ScaleManager.NONE; // SHOW_ALL
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
    },    
    create: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        for (var x = 0; x < game.width; x += 100) {
            for (var y = 0; y < game.height; y += 100) {
                game.add.sprite(x, y, 'grass');
            }
        }

        player = game.add.sprite(100, 100, 'player');

        game.physics.arcade.enable(player);

        player.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7, 8], 20, true);
        player.animations.add('left', [9, 10, 11, 12, 13, 14, 15, 16, 17], 20, true);
        player.animations.add('down', [18, 19, 20, 21, 22, 23, 24, 25, 26], 20, true);
        player.animations.add('right', [27, 28, 29, 30, 31, 32, 33, 34, 35], 20, true);

        cursors = game.input.keyboard.createCursorKeys();
		
		rat = game.add.sprite(100, 200, 'rat00');
		
		game.physics.arcade.enable(rat);
		
		rat.animations.add('down', [0, 1, 2], 10, true);
		rat.animations.add('left', [3, 4, 5], 10, true);
		rat.animations.add('right', [6, 7, 8], 10, true);
		rat.animations.add('up', [9, 10, 11], 10, true);
    },    
    update: function() {
        player.body.velocity.x = 0;
        player.body.velocity.y = 0;

        if (cursors.up.isDown) {
            player.body.velocity.y -= 100;
            player.animations.play('up');
        } else if (cursors.down.isDown) {
            player.body.velocity.y += 100;
            player.animations.play('down');
        } else if (cursors.left.isDown) {
            player.body.velocity.x = -100;
            player.animations.play('left');
        } else if (cursors.right.isDown) {
            player.body.velocity.x += 100;
            player.animations.play('right');
        } else {
            player.animations.stop();
        }

        rat.animations.play('right');

    }
};