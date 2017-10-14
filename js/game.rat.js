RatStates = {
    STOPPED: 0,
    HUNGRY: 1,
    RETREATING: 2
};

class Rat {
    constructor(group, id) {
        this.id = id;
        this.state = RatStates.STOPPED;
        this.group = group;

        var width = game.cache.getImage('rat00').width;

        this.sprite = game.add.sprite(game.camera.bounds.x - (width / 10), Math.random() * game.world.height, 'rat00');
        this.sprite.id = id;

        game.physics.arcade.enable(this.sprite);
        
        this.sprite.animations.add('down', [0, 1, 2], 10, true);
        this.sprite.animations.add('left', [3, 4, 5], 10, true);
        this.sprite.animations.add('right', [6, 7, 8], 10, true);
        this.sprite.animations.add('up', [9, 10, 11], 10, true);

        group.add(this.sprite);
    }
}

Rat.prototype.move = function(targets) {
    if (targets.length == 0) {
        return;
    }

    var speed = 1;

    var target = targets[Math.floor(Math.random() * targets.length)];
    this.state = RatStates.HUNGRY;
    game.physics.arcade.moveToXY(this.sprite, target[0], target[1]);

    this.sprite.body.velocity.x *= speed;
    this.sprite.body.velocity.y *= speed;
}

Rat.prototype.update = function(targets) {
    if (this.state == RatStates.STOPPED) {
        this.move(targets);
    }

    if (this.state == RatStates.HUNGRY) {
        this.sprite.animations.play('right');
    }

    if (this.state == RatStates.RETREATING) {
        this.sprite.animations.play('left');
    }

    if (!this.sprite.inCamera) {
        this.sprite.kill();
        this.group.remove(this.sprite);
    }
}

Rat.prototype.shouldEat = function() {
    return this.state == RatStates.HUNGRY;
}

Rat.prototype.eat = function() {
    this.state = RatStates.RETREATING;
    this.sprite.body.velocity.x *= -1;
    this.sprite.body.velocity.y *= 0.25;
}