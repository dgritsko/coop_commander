RatStates = {
    STOPPED: 0,
    HUNGRY: 1,
    RETREATING: 2
};

RatTypes = [
    { 
        'rank': 0,
        'class': 1,
        'size': 'small'
    },
    { 
        'rank': 1,
        'class': 1,
        'size': 'medium'
    },
    { 
        'rank': 2,
        'class': 1,
        'size': 'large'
    },
    { 
        'rank': 3,
        'class': 2,
        'size': 'small'
    },
    { 
        'rank': 4,
        'class': 2,
        'size': 'medium'
    },
    { 
        'rank': 5,
        'class': 2,
        'size': 'large'
    },
    { 
        'rank': 6,
        'class': 3,
        'size': 'small'
    },
    { 
        'rank': 7,
        'class': 3,
        'size': 'medium'
    },
    { 
        'rank': 8,
        'class': 3,
        'size': 'large'
    },
];

class Rat {
    constructor(group, id, speed, type) {
        this.id = id;
        this.state = RatStates.STOPPED;
        this.group = group;
        this.type = Object.assign({}, type);

        var spriteName = 'rat00';
        if (type['class'] == 2) {
            spriteName = 'rat01';
        } else if (type['class'] == 3) {
            spriteName = 'rat02';
        }

        var scale = 1.0;
        if (type['size'] == 'medium') {
            scale = 1.2;
        } else if (type['size'] == 'large') {
            scale = 1.5;
        }

        var width = game.cache.getImage(spriteName).width;
        this.sprite = game.add.sprite(game.camera.bounds.x - (width / 10), Math.random() * game.world.height, spriteName);

        this.sprite.scale.setTo(scale, scale);

        this.sprite.id = id;

        game.physics.arcade.enable(this.sprite);
        
        this.sprite.animations.add('down', [0, 1, 2], 10, true);
        this.sprite.animations.add('left', [3, 4, 5], 10, true);
        this.sprite.animations.add('right', [6, 7, 8], 10, true);
        this.sprite.animations.add('up', [9, 10, 11], 10, true);

        group.add(this.sprite);

        this.speed = speed;
    }
}

Rat.prototype.move = function(food, items, player) {
    if (food.length == 0) {
        return;
    }

    var target = food[Math.floor(Math.random() * food.length)];
    this.state = RatStates.HUNGRY;
    game.physics.arcade.moveToXY(this.sprite, target[0], target[1]);

    this.sprite.body.velocity.x *= this.speed;
    this.sprite.body.velocity.y *= this.speed;
}

Rat.prototype.update = function(food, items, player) {
    if (this.state == RatStates.STOPPED) {
        this.move(food, items, player);
    }

    if (this.state == RatStates.HUNGRY) {
        this.sprite.animations.play('right');
    }

    if (this.state == RatStates.RETREATING) {
        this.sprite.animations.play('left');
    }
}

Rat.prototype.kill = function() {
    this.sprite.kill();
    this.group.remove(this.sprite);
}

Rat.prototype.shouldEat = function() {
    return this.state == RatStates.HUNGRY;
}

Rat.prototype.eat = function() {
    this.state = RatStates.RETREATING;
    this.sprite.body.velocity.x *= -1;
    this.sprite.body.velocity.y *= 0.25;
}