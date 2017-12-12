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

Item.prototype.update = function() {
    if (this.isCurrent) {
        var menuWidth = 100;
        var fadeDistance = 50;

        var isVisible = this.canPlace();

        var snapAmount = 30;

        var x = game.input.x - (game.input.x % snapAmount) + (snapAmount / 2);
        var y = game.input.y - (game.input.y % snapAmount) + (snapAmount / 2);

        this.position = new Phaser.Point(x, y);

        if (this.graphics) {
            this.graphics.visible = isVisible;

            if (this.updateGraphics) {
                this.updateGraphics();
            } else {
                this.graphics.x = x;
                this.graphics.y = y;
            }
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

    if (this.graphics) {
        this.graphics.destroy();
    }
}

Item.prototype.canPlace = function() {
    return game.input.x >= 150 && game.input.x <= 850;
}

class Poison extends Item {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);

        this.graphics = game.add.graphics(x, y);
        this.graphics.lineStyle(2, 0xffd900, 1);
        this.graphics.drawCircle(0, 0, 75);

        this.sprite = game.add.sprite(x, y, 'poison');
        this.sprite.anchor.setTo(0.5, 0.5);
    }
}

class SmallTrap extends Item {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);

        this.sprite = game.add.sprite(x, y, 'simpletrap');
        this.sprite.anchor.setTo(0.5, 0.5);

        this.graphics = game.add.graphics(x, y);
        this.graphics.lineStyle(2, 0x00d900, 1);
        this.graphics.drawCircle(0, 0, 75);
    }
}

class LargeTrap extends Item {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);

        this.sprite = game.add.sprite(x, y, 'simpletrap');
        this.sprite.anchor.setTo(0.5, 0.5);

        this.graphics = game.add.graphics(x, y);
        this.graphics.lineStyle(2, 0x00d900, 1);
        this.graphics.drawCircle(0, 0, 75);
    }
}

class HeavyDutyTrap extends Item {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);

        this.sprite = game.add.sprite(x, y, 'simpletrap');
        this.sprite.anchor.setTo(0.5, 0.5);

        this.graphics = game.add.graphics(x, y);
        this.graphics.lineStyle(2, 0x00d900, 1);
        this.graphics.drawCircle(0, 0, 75);
    }
}

class HumaneTrap extends Item {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);

        this.sprite = game.add.sprite(x, y, 'simpletrap');
        this.sprite.anchor.setTo(0.5, 0.5);

        this.graphics = game.add.graphics(x, y);
        this.graphics.lineStyle(2, 0x00d900, 1);
        this.graphics.drawCircle(0, 0, 75);
    }
}

class Cat extends Item {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);

        this.sprite = game.add.sprite(x, y, 'simpletrap');
        this.sprite.anchor.setTo(0.5, 0.5);

        this.graphics = game.add.graphics(x, y);
        this.graphics.lineStyle(2, 0xff0000, 1);
        this.graphics.drawCircle(0, 0, 75);
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
    }
}

John.prototype.updateGraphics = function() {
    this.graphics.x = this.position.x;
}