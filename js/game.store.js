var Items = [
    {
        id: 0,
        name: 'Poison',
        description: '',
        cost: 2,
        minLevel: 1,
        max: -1,
        menuSprite: 'poison',
        menuScale: 1,
        create: function(info, isCurrent, x, y) { return new Poison(info, isCurrent, x, y); }
    },
    {
        id: 1,
        name: 'Small Trap',
        description: '',
        cost: 2,
        minLevel: 1,
        max: -1,
        menuSprite: 'simpletrap',
        menuScale: 1,
        create: function(info, isCurrent, x, y) { return new SmallTrap(info, isCurrent, x, y); }
    },
    {
        id: 2,
        name: 'Large Trap',
        description: '',
        cost: 1,
        minLevel: 1,
        max: -1,
        menuSprite: 'simpletrap',
        menuScale: 1,
        create: function(info, isCurrent, x, y) { return new LargeTrap(info, isCurrent, x, y); }
    },
    {
        id: 3,
        name: 'Heavy-Duty Trap',
        description: '',
        cost: 10,
        minLevel: 1,
        max: -1,
        menuSprite: 'simpletrap',
        menuScale: 1,
        create: function(info, isCurrent, x, y) { return new HeavyDutyTrap(info, isCurrent, x, y); }
    },
    {
        id: 4,
        name: 'Humane Trap',
        description: '',
        cost: 15,
        minLevel: 3,
        max: -1,
        menuSprite: 'simpletrap',
        menuScale: 1,
        create: function(info, isCurrent, x, y) { return new HumaneTrap(info, isCurrent, x, y); }
    },
    {
        id: 5,
        name: 'Cat',
        description: '',
        cost: 15,
        minLevel: 4,
        max: -1,
        menuSprite: 'simpletrap',
        menuScale: 1,
        create: function(info, isCurrent, x, y) { return new Cat(info, isCurrent, x, y); }
    },
    {
        id: 6,
        name: 'John',
        description: '',
        cost: 15,
        minLevel: 5,
        max: 1,
        menuSprite: 'simpletrap',
        menuScale: 1,
        create: function(info, isCurrent, x, y) { return new John(info, isCurrent, x, y); }
    },
];

StoreStates = {
    ACTIVE: 0,
    DONE: 1
};

class Store {
    constructor(money, existingItems, level) {
        this.state = StoreStates.ACTIVE;

        this.money = money;
        this.level = level;

        this.selectedIndex = 0;
        this.availableItems = [];
        this.itemLabels = [];
        this.placedItems = [];
        this.itemAddedCallbacks = [];
        
        this.selection = game.add.graphics(50, this.getIndexY(0));
        this.selection.lineStyle(2, 0xffd900, 1);
        this.selection.drawRect(0, 0, 48, 48);

        function addItem(info, that) {
            var index = that.availableItems.length;
            var y = that.getIndexY(index);
            var t = game.add.sprite(50, y, info.menuSprite);
            t.scale.setTo(info.menuScale);

            var l = game.add.bitmapText(50 + 20, y + 28, 'blackOpsOne', '$' + info.cost, 18);
            l.itemId = info.id;

            t.inputEnabled = true;
            t.events.onInputDown.add(function() {
                that.selectItem(index);
            }, this);

            that.availableItems.push(t);
            that.itemLabels.push(l);
        }

        for (var i = 0; i < Items.length; i++) {
            if (this.level >= Items[i].minLevel) {
                addItem(Items[i], this);
            }
        }

        for (var i = 0; i < (existingItems || []).length; i++) {
            var info = Items[existingItems[i]['id']];
            var x = existingItems[i]['x'];
            var y = existingItems[i]['y'];
            
            this.placedItems.push(info.create(info, false, x, y));
        }

        this.updatePriceLabels();

        var currInfo = Items[this.selectedIndex];
        this.currItem = currInfo.create(currInfo, true);
        
        this.doneLabel = GameUtil.drawTextButton(game, game.world.width - 170, 20, 'Done', function() {
            this.done();
        }, this);
        var margin = 10;
        this.doneLabel.hitArea = new Phaser.Rectangle(-margin, -margin, this.doneLabel.width + margin * 8, this.doneLabel.height + margin * 2);

        var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        upKey.onDown.add(function() { 
            if (this.state == StoreStates.ACTIVE) {
                var newIndex = this.selectedIndex > 0 ? this.selectedIndex - 1 : this.availableItems.length - 1;
                this.selectItem(newIndex);
            }
        }, this);

        var downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        downKey.onDown.add(function() { 
            if (this.state == StoreStates.ACTIVE) {
                var newIndex = this.selectedIndex < this.availableItems.length - 1 ? this.selectedIndex + 1 : 0;
                this.selectItem(newIndex);
            } 
        }, this);

        this.remainingTime = game.time.now + (1000 * 20);

        this.descriptionLabel = game.add.bitmapText(200, 20, 'blackOpsOne', '', 28);

        this.selectItem(0, true);
    }
}

Store.prototype.getIndexY = function(index) {
    var baseY = 200;
    var y = baseY + (50 * index);
    return y;    
}

Store.prototype.selectItem = function(index, silent) {
    var info = Items[index];
    var y = this.getIndexY(index);

    this.currItem.kill();

    this.currItem = info.create(info, true);
    this.selection.y = y;

    this.selectedIndex = index;

    this.descriptionLabel.text = info['name'];
    if (info['description']) {
        this.descriptionLabel.text += ': ' + info['description'];
    }

    if (!silent) {
        var fxClick = game.add.sound('click00');
        fxClick.play();
    }    
}

Store.prototype.updatePriceLabels = function() {
    var money = this.money;

    this.itemLabels.forEach(function(label) { 
        var item = Items[label.itemId];
        label.tint = item['cost'] <= money ? 0xffffff : 0xff0000;
    });
}

Store.prototype.done = function() {
    this.selection.kill();
    _.each(this.availableItems, function(t) { 
        t.kill();
    });

    _.each(this.itemLabels, function(l) {
        l.kill();
    });

    this.doneLabel.kill();
    this.currItem.kill();
    this.descriptionLabel.kill();
    
    this.state = StoreStates.DONE;

    fxReload.play();
}

Store.prototype.error = function() {
    fxError.play();
    game.camera.flash(0x000000, 50);    
}

Store.prototype.update = function() {
    var remainingSeconds = Math.floor((this.remainingTime - game.time.now) / 1000);
    if (remainingSeconds <= 5) {
        this.doneLabel.tint = 0xff0000;
    } 
    
    if (remainingSeconds <= 0) {
        this.done();
        return;
    }
    this.doneLabel.text = 'Done (' + remainingSeconds + ')';

    this.currItem.update();

    if (game.input.activePointer.isDown) {
        this.pointerDown = true;
    } else if (this.pointerDown) {
        this.pointerDown = false;

        if (!this.currItem.canPlace()) {
            return;
        }

        // Make sure we aren't placing this on top of another item
        if (this.currItem) {
            var currPos = this.currItem.position;
            var alreadyPlacedItems = _.filter(this.placedItems, function(i) { return i.position.equals(currPos); });
            if (alreadyPlacedItems.length > 0) {
                this.error();
                return;
            }
        }

        if (this.currItem.info.cost <= this.money) {
            this.currItem.isCurrent = false;   

            this.money -= this.currItem.info.cost;

            this.placedItems.push(this.currItem);

            var currInfo = Items[this.selectedIndex];
            this.currItem = currInfo.create(currInfo, true);

            this.updatePriceLabels();

            fxPop.play();

            for (var i = 0; i < this.itemAddedCallbacks.length; i++) {
                this.itemAddedCallbacks[i]();
            }
        } else {
            // can't place item, not enough funds
            this.error();        
        }
    }
}

Store.prototype.newItemCallback = function(f) {
    this.itemAddedCallbacks.push(f);
}