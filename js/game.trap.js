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

        
    }
}

Trap.prototype.update = function() {
    if (this.isCurrent) {
        this.graphics.x = game.input.x;
        this.graphics.y = game.input.y;
    }
}

