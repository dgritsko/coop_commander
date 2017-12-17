class Player {
    constructor() {
        this.speed = 200;

        this.sprite = game.add.sprite(game.world.centerX, game.world.centerY, 'player');

        this.sprite.scale.setTo(2, 2);
        this.sprite.anchor.setTo(0.5, 0.5);

        this.hat = game.make.sprite(-1, -16, 'hat');
        this.hat.anchor.setTo(0.5);
        this.hat.scale.setTo(0.65);
        this.hat.frame = 0;
        this.sprite.addChild(this.hat);

        // TODO: Add shovel to group so that we can set the z-index correctly
        // TODO: Adjust the scaling so that it's the appropriate size for the player
        this.shovel = game.make.sprite(0, 0, 'shovel');
        this.shovel.alpha = 0;
        this.shovel.scale.setTo(0.5, 0.5);
        this.shovel.anchor.setTo(0.5, 0);
        
        this.sprite.addChild(this.shovel);

        this.shovelHead = game.make.sprite(0, 64, 'hitbox00');
        this.shovelHead.alpha = 0;
        this.shovelHead.anchor.setTo(0.5, 0.5);
        this.shovel.addChild(this.shovelHead);



        game.physics.arcade.enable(this.shovel);
        game.physics.arcade.enable(this.shovelHead);
        game.physics.arcade.enable(this.sprite);

        this.sprite.body.collideWorldBounds = true;

        this.sprite.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7, 8], 10, true);
        this.sprite.animations.add('left', [9, 10, 11, 12, 13, 14, 15, 16, 17], 10, true);
        this.sprite.animations.add('down', [18, 19, 20, 21, 22, 23, 24, 25, 26], 10, true);
        this.sprite.animations.add('right', [27, 28, 29, 30, 31, 32, 33, 34, 35], 10, true);

        this.hat.frame = 2;
        this.sprite.frame = 18;
        this.direction = 'down';
    }
}

Player.prototype.move = function() {
    this.sprite.body.velocity.x = 0;
    this.sprite.body.velocity.y = 0;
    
    var diagonalVelocity = 0.70710678118; // 1/sqrt(2)

    var xVelocity = 0;
    var yVelocity = 0;
    var animation = '';

    if (cursors.left.isDown) {
        animation = 'left';
        if (cursors.up.isDown) {
            xVelocity = -diagonalVelocity;
            yVelocity = -diagonalVelocity;
        } else if (cursors.down.isDown) {
            xVelocity = -diagonalVelocity;
            yVelocity = diagonalVelocity;
        } else {
            this.shovel.x = 0;
            this.shovel.y = 14;
            xVelocity = -1;
        }
    } else if (cursors.right.isDown) {
        animation = 'right';
        if (cursors.up.isDown) {
            xVelocity = diagonalVelocity;
            yVelocity = -diagonalVelocity;
        } else if (cursors.down.isDown) {
            xVelocity = diagonalVelocity;
            yVelocity = diagonalVelocity;
        } else {
            this.shovel.x = 0;
            this.shovel.y = 14;
            xVelocity = 1;
        }
    } else if (cursors.up.isDown) {
        animation = 'up';
        yVelocity = -1;

        this.shovel.x = -10;
        this.shovel.y = 14;
    } else if (cursors.down.isDown) {
        animation = 'down';
        yVelocity = 1;

        this.shovel.x = 10;
        this.shovel.y = 14;
    }

    if (animation) {
        this.direction = animation;
    }

    if (xVelocity || yVelocity) {
        game.audio.play(AudioEvents.WALKING);
    } else {
        game.audio.play(AudioEvents.STOP_WALKING);
    }

    this.sprite.body.velocity.x += (xVelocity * this.speed);    
    this.sprite.body.velocity.y += (yVelocity * this.speed);

    if (animation) {
        this.sprite.animations.play(animation);
    } else {
        this.sprite.animations.stop();
    }

    this.sprite

    switch (this.direction) {
        case 'down':
            this.hat.frame = 2;
            this.hat.x = 0;
            this.hat.y = -15;
            break;
        case 'left':
            this.hat.frame = 1;
            this.hat.x = 0;
            this.hat.y = -16;
            break;
        case 'right':
            this.hat.frame = 3;
            this.hat.x = 0;
            this.hat.y = -16;
            break;
        case 'up':
            this.hat.frame = 0;
            this.hat.x = -1;
            this.hat.y = -16;
            break;
    }
}

Player.prototype.attack = function(game) {
    // TODO: Cancel previous tween so that it doesn't kill the shovel mid-swing

    this.shovel.alpha = 1;

    if (this.direction == 'up' || this.direction == 'down') {
        if (this.direction == 'down') {
            this.shovel.scale.y = -0.5;
            endY = 0.5;
        } else {
            this.shovel.scale.y = 0.5;
            endY = -0.5;
        }

        var tween = game.add.tween(this.shovel.scale).to({ y: endY }, 200, Phaser.Easing.Quartic.InOut);
        
        tween.onComplete.add(function() {
            this.shovel.alpha = 0;
            this.shovel.scale.y = 0.5;
        }, this);
    
        tween.start();
    } else {            
        if (this.direction == 'right') {
            rotation = Math.PI * 2;
        } else if (this.direction == 'left') {
            rotation = 0;
        }            

        this.shovel.rotation = Math.PI;
        
        var tween = game.add.tween(this.shovel).to({ rotation: rotation }, 200, Phaser.Easing.Quartic.InOut);
        
        tween.onComplete.add(function() {
            this.shovel.alpha = 0;
            this.shovel.rotation = 0;
        }, this);
    
        tween.start();
    }
}

Player.prototype.increaseSpeed = function() {
    this.speed = 400;
}

Player.prototype.resetSpeed = function() {
    this.speed = 200;
}