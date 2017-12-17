ChickenStates = {
    STOPPED: 0,
    MOVING_TO_POINT: 1,
    WAITING: 2
};

class Chicken {
    constructor(group, id, bounds) {
        this.id = id;
        this.state = ChickenStates.STOPPED;
        this.group = group;

            var x = bounds.x + (bounds.width / 4) + (Math.random() * (bounds.width / 2));
            var y = bounds.y + (bounds.height / 2.5) + (Math.random() * (bounds.height / 3));

        this.sprite = game.add.sprite(x, y, 'chicken00');
        this.sprite.id = id;
        
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.scale.setTo(1.5, 1.5);
        
        game.physics.arcade.enable(this.sprite);
        
        this.sprite.animations.add('down', [0, 1, 2], 10, true);
        this.sprite.animations.add('left', [3, 4, 5], 10, true);
        this.sprite.animations.add('right', [6, 7, 8], 10, true);
        this.sprite.animations.add('up', [9, 10, 11], 10, true);
        
        this.dest = [0, 0];
        
        group.add(this.sprite);
    }
}

Chicken.prototype.update = function() {
    if (this.state == ChickenStates.STOPPED) {
        this.state = ChickenStates.WAITING;

        var waitDuration = (Phaser.Timer.SECOND * 2) + (Phaser.Timer.SECOND * 8 * Math.random());
        game.time.events.add(waitDuration, this.move, this);
    } else if (this.state == ChickenStates.MOVING_TO_POINT && game.physics.arcade.distanceToXY(this.sprite, this.dest[0], this.dest[1]) < 10) {
        this.stop();
    }
}

Chicken.prototype.move = function() {
    var that = this;

    function chooseDestination() {
        var xMult = Math.random() < 0.5 ? -1 : 1;
        var yMult = Math.random() < 0.5 ? -1 : 1;

        var xDiff = (10 + Math.random() * 80) * xMult;
        var yDiff = (10 + Math.random() * 80) * yMult;
        var newX = that.sprite.x + xDiff;
        var newY = that.sprite.y + yDiff;
        return [newX, newY, xDiff, yDiff];
    }

    var dest = chooseDestination();
    
    var newX = dest[0];
    var newY = dest[1];
    var xDiff = dest[2];
    var yDiff = dest[3];

    game.physics.arcade.moveToXY(this.sprite, newX, newY);

    this.dest = dest;

    if (xDiff < 0 && Math.abs(yDiff) < Math.abs(xDiff)) {
        this.sprite.animations.play('left');
    } else if (yDiff < 0 && Math.abs(xDiff) < Math.abs(yDiff)) {
        this.sprite.animations.play('up');
    } else if (xDiff > 0 &&Math.abs(xDiff) > Math.abs(yDiff)) {
        this.sprite.animations.play('right');
    } else {
        this.sprite.animations.play('down');
    }

    this.state = ChickenStates.MOVING_TO_POINT;
}

Chicken.prototype.stop = function() {
    this.dest = [0, 0];
    this.sprite.body.velocity.x = 0;
    this.sprite.body.velocity.y = 0;
    this.sprite.animations.stop();
    this.state = ChickenStates.STOPPED;
}

Chicken.prototype.isMoving = function() {
    return this.state == ChickenStates.MOVING_TO_POINT;
}