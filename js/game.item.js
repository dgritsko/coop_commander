class Item {
    constructor(info, isCurrent, x, y) {
        this.isActive = true;
        this.isCurrent = isCurrent;

        if (isCurrent) {
            x = x || game.input.x;
            y = y || game.input.y;
        }

        this.position = new Phaser.Point(x, y);

        this.info = info;
    }
}

Item.prototype.move = function() {
    if (this.isCurrent) {
        var menuWidth = 100;
        var fadeDistance = 50;

        var isVisible = this.canPlace();

        var snapAmount = 30;

        var x = game.input.x - (game.input.x % snapAmount) + (snapAmount / 2);
        var y = game.input.y - (game.input.y % snapAmount) + (snapAmount / 2);

        this.position = new Phaser.Point(x, y);

        if (this.updateGraphics) {
            this.updateGraphics(isVisible);
        } else if (this.graphics) {
            this.graphics.visible = isVisible;
            this.graphics.x = x;
            this.graphics.y = y;
        }

        if (this.sprite) {
            this.sprite.visible = isVisible;

            if (this.updateSprite) {
                this.updateSprite();
            } else {
                this.sprite.x = x; 
                this.sprite.y = y;
            }
        }
    }
}

Item.prototype.kill = function() {
    this.isActive = false;

    if (this.sprite) {
        this.sprite.destroy();
    }

    if (this.destroyGraphics) {
        this.destroyGraphics();
    } else if (this.graphics) {
        this.graphics.destroy();
    }
}

Item.prototype.canPlace = function() {
    return game.input.x >= 150 && game.input.x <= 850;
}

class TrapItem extends Item {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);
    }
}

TrapItem.prototype.setup = function(radius) {
    this.radius = radius;

    this.graphics = game.add.graphics(this.position.x, this.position.y);
    this.graphics.lineStyle(2, 0xffd900, 1);
    this.graphics.drawCircle(0, 0, this.radius * 2);
}

TrapItem.prototype.calculateVector = function(rat) {
    if (!this.isActive) {
        return;
    }

    var dist = rat.sprite.position.distance(this.sprite.position);

    if (dist <= this.radius) {
        var vector = Phaser.Point.subtract(this.sprite.position, rat.sprite.position);

        vector.normalize();
        vector.setMagnitude(this.radius - dist);

        return vector;
    }
}

TrapItem.prototype.intersects = function(rat) {
    var trapBounds = this.sprite.getBounds();
    var ratBounds = rat.sprite.getBounds();
    return Phaser.Rectangle.intersects(trapBounds, ratBounds);
}

class Poison extends TrapItem {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);

        this.setup(275);

        this.sprite = game.add.sprite(x, y, 'poison');
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.scale.setTo(0.6);

        this.capacity = 10;
    }
}

Poison.prototype.affectRat = function(rat, gameState) {
    if (!this.isActive) {
        return;
    }

    if (!this.intersects(rat)) {
        return;
    }

    this.capacity -= 1;

    if (this.capacity == 0) {
        this.sprite.frame = 2;
        this.isActive = false;
    } else if (this.capacity <= 6) {
        this.sprite.frame = 1;
    } else {
        this.sprite.frame = 0;
    }

    rat.kill(RatStates.KILLED_BY_POISON, gameState);
}

class BasicTrap extends TrapItem {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);

        this.setup(250);

        this.sprite = game.add.sprite(x, y, 'simpletrap');
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.scale.setTo(0.5);

        this.sprite.animations.add('snap', [0, 1, 2, 3, 4, 5, 6, 7], 60, false);
    }
}

BasicTrap.prototype.calculateVector = function(rat) {
    if (rat.type.size == 'medium' || rat.type.size == 'large') {
        return;
    }
    
    return TrapItem.prototype.calculateVector.call(this, rat);    
}

BasicTrap.prototype.affectRat = function(rat, gameState) {
    if (!this.isActive) {
        return;
    }

    if (rat.type.size == 'medium' || rat.type.size == 'large') {
        return;
    }

    if (!this.intersects(rat)) {
        return;
    }

    this.isActive = false;

    this.sprite.animations.play('snap');

    rat.kill(RatStates.KILLED_BY_BASIC_TRAP, gameState);
}

class StrongTrap extends TrapItem {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);

        this.setup(225);

        this.sprite = game.add.sprite(x, y, 'simpletrap');
        this.sprite.anchor.setTo(0.5, 0.5);

        this.sprite.scale.setTo(0.8);
        
        this.sprite.animations.add('snap', [0, 1, 2, 3, 4, 5, 6, 7], 60, false);
    }
}

StrongTrap.prototype.calculateVector = function(rat) {
    if (rat.type.size == 'large') {
        return;
    }
    
    return TrapItem.prototype.calculateVector.call(this, rat);    
}

StrongTrap.prototype.affectRat = function(rat, gameState) {
    if (!this.isActive) {
        return;
    }

    if (rat.type.size == 'large') {
        return;
    }

    if (!this.intersects(rat)) {
        return;
    }

    this.isActive = false;

    this.sprite.animations.play('snap');

    rat.kill(RatStates.KILLED_BY_STRONG_TRAP, gameState);
}

class SnapTrap extends TrapItem {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);

        this.setup(200);

        this.sprite = game.add.sprite(x, y, 'simpletrap');
        this.sprite.anchor.setTo(0.5, 0.5);
    }
}

class HumaneTrap extends TrapItem {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);

        this.setup(175);

        this.sprite = game.add.sprite(x, y, 'simpletrap');
        this.sprite.anchor.setTo(0.5, 0.5);
    }
}

class Cat extends Item {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);

        var types = {
            whiteAndGray: { x: 0, y: 0 },
            white: { x: 3, y: 0 },
            darkGray: { x : 6, y: 0 },
            beige: { x: 9, y: 0 },
            gray: { x: 0, y: 4 },
            darkBrown: { x: 3, y: 4 },
            orange: { x : 6, y: 4 },
            lightBrown: { x: 9, y: 4 }
        };

        var keys = _.keys(types);
        var key = Phaser.ArrayUtils.getRandomItem(keys);
        var type = types[key];

        function getFrames(x, y) {
            var results = [];
            for (var i = 0; i < 3; i++) {
                results.push(x + i + y * 12);
            }
            return results;
        }

        var downFrames = getFrames(type.x, type.y);
        var leftFrames = getFrames(type.x, type.y + 1);
        var rightFrames = getFrames(type.x, type.y + 2);
        var upFrames = getFrames(type.x, type.y + 3);

        this.sprite = game.add.sprite(x, y, 'cat00', downFrames[0]);
        this.sprite.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.sprite);

        this.sprite.animations.add('down', downFrames, 10, true);
        this.sprite.animations.add('left', leftFrames, 10, true);
        this.sprite.animations.add('right', rightFrames, 10, true);
        this.sprite.animations.add('up', upFrames, 10, true);

        this.radius = 100;
        this.patrolRadius = 200;

        this.graphics = game.add.graphics(x, y);
        this.graphics.lineStyle(2, 0xff0000, 1);
        this.graphics.drawCircle(0, 0, this.radius * 2);

        this.patrolGraphics = game.add.graphics(x, y);
        this.patrolGraphics.lineStyle(2, 0x333333, 1);
        this.patrolGraphics.drawCircle(0, 0, this.patrolRadius * 2);
    }
}

Cat.prototype.calculateVector = function(rat) {
    var dist = rat.sprite.position.distance(this.sprite.position);

    if (dist <= this.radius) {
        var vector = Phaser.Point.subtract(rat.sprite.position, this.sprite.position);

        vector.normalize();
        vector.setMagnitude(this.radius - dist);

        return vector;
    }
}

Cat.prototype.destroyGraphics = function() {
    this.graphics.destroy();
    this.patrolGraphics.destroy();
}

Cat.prototype.updateGraphics = function(isVisible) {
    this.graphics.visible = isVisible;
    this.patrolGraphics.visible = isVisible;

    this.graphics.x = this.position.x;
    this.graphics.y = this.position.y;
    this.patrolGraphics.x = this.position.x;
    this.patrolGraphics.y = this.position.y;
}

Cat.prototype.update = function() {
    if (typeof(this.destination) == 'undefined' || Math.abs(this.sprite.position.distance(this.destination)) <= 10) {
        var point = new Phaser.Point(Math.random() - 0.5, Math.random() - 0.5);
        point.setMagnitude(Math.random() * this.patrolRadius);
        this.destination = Phaser.Point.add(this.position, point);

        game.physics.arcade.moveToXY(this.sprite, this.destination.x, this.destination.y);        
    }

    this.graphics.x = this.sprite.x;
    this.graphics.y = this.sprite.y;

    var yVel = this.sprite.body.velocity.y;
    var xVel = this.sprite.body.velocity.x;
    if (Math.abs(xVel) > Math.abs(yVel)) {
        if (xVel > 0) {
            this.sprite.animations.play('right');
        } else {
            this.sprite.animations.play('left');
        }
    } else {
        if (yVel > 0) {
            this.sprite.animations.play('down');
        } else {
            this.sprite.animations.play('up');
        }
    }
}

class John extends Item {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);

        this.graphics = game.add.graphics(x || 0, 0);
        this.graphics.lineStyle(2, 0xffd900, 1);

        var dashLength = 10;
        for (var i = 0; i < game.world.height; i += dashLength) {
            if ((i / dashLength) % 2 == 0) {
                this.graphics.moveTo(0, i);
                this.graphics.lineTo(0, i + dashLength);
            }
        }

        this.sprite = game.add.sprite(x, y, 'john', 0);
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.scale.setTo(1.75);
        game.physics.arcade.enable(this.sprite);
        this.sprite.body.collideWorldBounds = true;

        this.sprite.animations.add('down', [0, 1, 2, 3], 8, true);
        this.sprite.animations.add('left', [4, 5, 6, 7], 8, true);
        this.sprite.animations.add('right', [8, 9, 10, 11], 8, true);
        this.sprite.animations.add('up', [12, 13, 14, 15], 8, true);
    }
}

John.prototype.updateGraphics = function(isVisible) {
    this.graphics.visible = isVisible;

    this.graphics.x = this.position.x;
}

John.prototype.update = function() {
    if (this.sprite.body.velocity.y == 0) {
        this.sprite.body.velocity.y = this.sprite.y > game.world.centerY ? -100 : 100;
    }

    if (this.sprite.body.velocity.y > 0) {
        this.sprite.animations.play('down');
    } else {
        this.sprite.animations.play('up');
    }
}


John.prototype.affectRat = function(rat, gameState) {
    if (!this.isActive) {
        return;
    }

    var johnBounds = this.sprite.getBounds();
    var ratBounds = rat.sprite.getBounds();

    if (!Phaser.Rectangle.intersects(johnBounds, ratBounds)) {
        return;
    }

    rat.kill(RatStates.KILLED_BY_JOHN, gameState);
}