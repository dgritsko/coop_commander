TrapStates = {

};

class Trap {
    constructor(info, isCurrent, x, y) {
        this.isCurrent = isCurrent;

        x = x || game.input.x;
        y = y || game.input.y;

        this.position = new Phaser.Point(x, y);

        this.graphics = game.add.graphics(x, y);

        this.graphics.lineStyle(2, 0xffd900, 1);

        //graphics.beginFill(0xFF0000, 1);
        this.graphics.drawCircle(0, 0, info['radius']);
        this.info = info;
        this.sprite = game.add.sprite(x, y, info['spriteName']);
        this.sprite.anchor.setTo(0.5, 0.5);
    }
}

Trap.prototype.update = function() {
    if (this.isCurrent) {
        var menuWidth = 100;
        var fadeDistance = 50;

        if (game.input.x < menuWidth) {
            this.graphics.visible = false;
            this.sprite.visible = false;
        } else {
            this.graphics.visible = true;
            this.sprite.visible = true;
        }

        if (game.input.x >= menuWidth && game.input.x <= (menuWidth + fadeDistance)) {
            this.sprite.alpha = (game.input.x - menuWidth) / fadeDistance;
        } else {
            this.sprite.alpha = 1.0;
        }

        var snapAmount = 30;

        var x = game.input.x - (game.input.x % snapAmount) + (snapAmount / 2);
        var y = game.input.y - (game.input.y % snapAmount) + (snapAmount / 2);

        this.graphics.x = x;
        this.graphics.y = y;

        this.sprite.x = x;
        this.sprite.y = y;
    }
}

Trap.prototype.changeType = function(info) {
    this.info = info;
    this.sprite.loadTexture(info['spriteName']);
}

Trap.prototype.kill = function() {
    this.sprite.kill();
    this.graphics.kill();
}

Trap.prototype.canPlace = function() {
    return game.input.x >= 150;
}