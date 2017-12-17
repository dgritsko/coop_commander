RatStates = {
    STOPPED: 0,
    HUNGRY: 1,
    ESCAPING: 2,
    ESCAPED: 3,
    KILLED_BY_SHOVEL: 4,
    KILLED_BY_FLASHLIGHT: 5,
    KILLED_BY_POISON: 6,
    KILLED_BY_BASIC_TRAP: 7,
    KILLED_BY_STRONG_TRAP: 8,
    KILLED_BY_SNAP_TRAP: 9,
    TRAPPED_IN_HUMANE_TRAP: 10,
    KILLED_IN_HUMANE_TRAP: 11,
    KILLED_BY_JOHN: 12
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

    constructor(group, type, level, x, y) {
        this.group = group;
        this.type = Object.assign({}, type);
        this.level = level;
        this.id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

        this.state = RatStates.STOPPED;

        this.spriteName = Rat.getSpriteName(this.type);
        
        this.setupSprite(game, x, y);

        this.speed = Rat.getSpeed(this.type, this.level);
    }
}

Rat.prototype.setupSprite = function(game, x, y) {
    var scale = Rat.getScale(this.type);

    this.sprite = game.add.sprite(x, y, this.spriteName);
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

Rat.prototype.move = function(food) {
    if (food.length == 0) {
        return;
    }

    var target = food[Math.floor(Math.random() * food.length)];

    this.target = new Phaser.Point(target[0], target[1]);

    this.state = RatStates.HUNGRY;

    game.physics.arcade.moveToXY(this.sprite, this.target.x, this.target.y, this.speed * 50);
}

Rat.prototype.update = function(food, items, player, gameState) {
    if (this.state == RatStates.STOPPED) {
        this.move(food);
    }

    var activeStates = [RatStates.HUNGRY, RatStates.TRAPPED_IN_HUMANE_TRAP];

    if (activeStates.indexOf(this.state) > -1) {
        var activeItems = _.where(items, { isActive : true });
        
        var itemVector = new Phaser.Point(0, 0);

        for (var i = 0; i < activeItems.length; i++) {
            var activeItem = activeItems[i];

            if (activeItem.calculateVector) {
                var vector = activeItem.calculateVector(this);

                if (vector) {
                    itemVector.add(vector.x, vector.y);
                }
            }

            if (activeItem.affectRat) {
                activeItem.affectRat(this, gameState);
            }
        }

        if (activeStates.indexOf(this.state) > -1) {
            var actualSpeed = this.sprite.body.velocity.getMagnitude();

            if (itemVector.x != 0 || itemVector.y != 0) {
                var desiredPosition = Phaser.Point.add(this.sprite.position, itemVector);

                game.physics.arcade.moveToXY(this.sprite, desiredPosition.x, desiredPosition.y, actualSpeed);
            } else {
                var distance = game.physics.arcade.distanceToXY(this.sprite, this.target.x, this.target.y);
                
                if (distance < 5) {
                    // Food could have been eaten by another rat; in this case, just retreat so that rat is not stuck
                    this.escape();
                } else {
                    game.physics.arcade.moveToXY(this.sprite, this.target.x, this.target.y, actualSpeed);
                }
            }

            this.sprite.animations.play('right');
        }
    }

    if (this.state == RatStates.ESCAPING) {
        this.sprite.animations.play('left');
    }
}

Rat.prototype.setState = function(newState, gameState) {
    this.state = newState;
}

Rat.prototype.kill = function(newState, gameState) {
    if (this.isDead()) {
        console.log('TODO: Fix this (how can you kill that which has no life)');
        return;
    }

    if (this.state == RatStates.TRAPPED_IN_HUMANE_TRAP) {
        newState = RatStates.KILLED_IN_HUMANE_TRAP;
    }

    this.setState(newState, gameState);

    switch (newState) {
        case RatStates.KILLED_BY_POISON:
            this.sprite.tint = 0x008000;

            game.time.events.add(1000, function() {
                this.sprite.body.stop();
                this.sprite.animations.stop();
            }, this);

            break;
        case RatStates.KILLED_BY_BASIC_TRAP:
        case RatStates.KILLED_BY_STRONG_TRAP:
        case RatStates.KILLED_BY_SNAP_TRAP:
            this.sprite.body.stop();
            this.sprite.animations.stop();
            break;
        default:
            this.sprite.body.stop();
            this.sprite.animations.stop();

            this.sprite.kill();
            this.group.remove(this.sprite);
            break;
    }

    if (newState != RatStates.ESCAPED) {
        gameState.score += this.type.score;
    }

    gameState.inactiveRats.push(this);
}

Rat.prototype.shouldEat = function() {
    return this.state == RatStates.HUNGRY;
}

Rat.prototype.escape = function() {
    this.state = RatStates.ESCAPING;
    this.sprite.body.velocity.x *= -1;
    this.sprite.body.velocity.y *= 0.25;
}

Rat.prototype.isDead = function() {
    var deadStates = [ 
        RatStates.KILLED_BY_SHOVEL,
        RatStates.KILLED_BY_FLASHLIGHT,
        RatStates.KILLED_BY_POISON,
        RatStates.KILLED_BY_BASIC_TRAP,
        RatStates.KILLED_BY_STRONG_TRAP,
        RatStates.KILLED_BY_SNAP_TRAP,
        RatStates.KILLED_IN_HUMANE_TRAP,
        RatStates.KILLED_BY_JOHN
    ];

    return deadStates.indexOf(this.state) > -1;
};