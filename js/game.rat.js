RatStates = {
    STOPPED: 0,
    HUNGRY: 1,
    ESCAPING: 2,
    ESCAPED: 3,
    KILLED_BY_SHOVEL: 4,
    KILLED_BY_FLASHLIGHT: 5
};

RatTypes = [
    { 
        rank: 0,
        class: 1,
        size: 'small',
        score: 5
    },
    { 
        rank: 1,
        class: 1,
        size: 'medium',
        score: 10
    },
    { 
        rank: 2,
        class: 1,
        size: 'large',
        score: 15
    },
    { 
        rank: 3,
        class: 2,
        size: 'small',
        score: 20
    },
    { 
        rank: 4,
        class: 2,
        size: 'medium',
        score: 25
    },
    { 
        rank: 5,
        class: 2,
        size: 'large',
        score: 30
    },
    { 
        rank: 6,
        class: 3,
        size: 'small',
        score: 35
    },
    { 
        rank: 7,
        class: 3,
        size: 'medium',
        score: 40
    },
    { 
        rank: 8,
        class: 3,
        size: 'large',
        score: 45
    },
];

class Rat {
    static getSpriteName(type) {
        var spriteName = 'rat00';
        if (type.class == 2) {
            spriteName = 'rat01';
        } else if (type.class == 3) {
            spriteName = 'rat02';
        }
        return spriteName;
    }

    static getScale(type) {
        var scale = 1.0;
        switch (type.size) {
            case 'small':
                break;
            case 'medium':
                scale = 1.2;
                break;
            case 'large':
                scale = 1.4;
                break;
        }
        return scale;
    }

    static getSpeed(type, level) {
        var baseSpeed = 0.5;
        
        var levelSpeed = level / 3;

        var classSpeed = 0;

        switch (type.class) {
            case 1:
                classSpeed = 0.1;
                break;
            case 2:
                classSpeed = 0.2;
                break;
            case 3:
                classSpeed = 0.3;
                break;
        }

        var sizeSpeed = 0;

        switch (type.size) {
            case 'small':
                sizeSpeed = 0.05;
                break;
            case 'medium':
                sizeSpeed = 0.1;
                break;
            case 'large':
                sizeSpeed = 0.15;
                break;
        }

        return baseSpeed + levelSpeed + classSpeed + sizeSpeed;
    }

    constructor(group, type, level) {
        this.group = group;
        this.type = Object.assign({}, type);
        this.level = level;
        this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

        this.state = RatStates.STOPPED;

        this.setupSprite(game);

        this.speed = Rat.getSpeed(this.type, this.level);
    }
}

Rat.prototype.setupSprite = function(game) {
    var spriteName = Rat.getSpriteName(this.type);
    var scale = Rat.getScale(this.type);

    var width = game.cache.getImage(spriteName).width;
    this.sprite = game.add.sprite(game.camera.bounds.x - (width / 10), Math.random() * game.world.height, spriteName);
    this.sprite.scale.setTo(scale, scale);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.id = this.id;
    game.physics.arcade.enable(this.sprite);
    
    this.sprite.animations.add('down', [0, 1, 2], 10, true);
    this.sprite.animations.add('left', [3, 4, 5], 10, true);
    this.sprite.animations.add('right', [6, 7, 8], 10, true);
    this.sprite.animations.add('up', [9, 10, 11], 10, true);

    this.group.add(this.sprite);
};

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

    if (this.state == RatStates.ESCAPING) {
        this.sprite.animations.play('left');
    }
}

Rat.prototype.kill = function(newState) {
    this.sprite.kill();
    this.group.remove(this.sprite);
    this.state = newState;
}

Rat.prototype.shouldEat = function() {
    return this.state == RatStates.HUNGRY;
}

Rat.prototype.eat = function() {
    this.state = RatStates.ESCAPING;
    this.sprite.body.velocity.x *= -1;
    this.sprite.body.velocity.y *= 0.25;
}