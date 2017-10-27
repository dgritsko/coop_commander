TrapStates = {

};

class Trap {
    constructor() {
        this.isCurrent = true;

        this.position = new Phaser.Point(0, 0);

        this.graphics = game.add.graphics(0, 0);

        this.graphics.lineStyle(2, 0xffd900, 1);

        //graphics.beginFill(0xFF0000, 1);
        // TODO: Trap radius
        this.graphics.drawCircle(0, 0, 200);

        // TODO: Sprite
        this.sprite = game.add.sprite(0, 0, 'trap00');
        this.sprite.anchor.setTo(0.5, 0.5);
    }
}

Trap.prototype.update = function() {
    if (this.isCurrent) {
        if (game.input.x < 150) {
            this.graphics.visible = false;
            this.sprite.visible = false;
        } else {
            this.graphics.visible = true;
            this.sprite.visible = true;
        }

        this.graphics.x = game.input.x;
        this.graphics.y = game.input.y;

        this.sprite.x = game.input.x;
        this.sprite.y = game.input.y;
    }
}

Trap.prototype.changeType = function(sprite) {
    this.sprite.loadTexture(sprite);
}

Trap.prototype.kill = function() {
    this.sprite.kill();
}
