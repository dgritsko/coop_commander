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

        // var alpha = 1.0;
        // if (game.input.x >= menuWidth && game.input.x <= (menuWidth + fadeDistance)) {
        //     alpha = (game.input.x - menuWidth) / fadeDistance;
        // }

        if (this.graphics) {
            //this.graphics.alpha = alpha;
            this.graphics.visible = isVisible;
            this.graphics.x = x;
            this.graphics.y = y;
        }

        if (this.sprite) {
            //this.sprite.alpha = alpha;
            this.sprite.visible = isVisible;
            this.sprite.x = x;
            this.sprite.y = y;
        }

        this.position = new Phaser.Point(x, y);
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
    }
}

class LargeTrap extends Item {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);
    }
}

class HeavyDutyTrap extends Item {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);
    }
}

class HumaneTrap extends Item {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);
    }
}

class Cat extends Item {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);
    }
}

class John extends Item {
    constructor(info, isCurrent, x, y) {
        super(info, isCurrent, x, y);
    }
}
