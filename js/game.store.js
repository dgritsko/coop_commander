var ItemTypes = {
    POISON: 0,
    BASIC: 1,
    STRONG: 2,
    SNAP: 3,
    HUMANE: 4,
    CAT: 5,
    JOHN: 6
}

var Items = [
    {
        id: ItemTypes.POISON,
        name: 'Rat-X Poison',
        description: 'Cheap and effective, but frowned upon by the Geneva Conventions.\nLasts for 1 night, killing up to 10 rats. Be forewarned -- using it comes with consequences.',
        cost: 2,
        minLevel: 1,
        max: -1,
        menuSprite: 'poison',
        menuScale: 0.8,
        create: function(info, isCurrent, x, y) { return new Poison(info, isCurrent, x, y); }
    },
    {
        id: ItemTypes.BASIC,
        name: 'Basic Wooden Trap',
        description: 'Just a humble rat trap.\nCatches 1 small rat per night.',
        cost: 2,
        minLevel: 1,
        max: -1,
        menuSprite: 'simpletrap',
        menuScale: 1,
        create: function(info, isCurrent, x, y) { return new SmallTrap(info, isCurrent, x, y); }
    },
    {
        id: ItemTypes.STRONG,
        name: 'Strong Wooden Trap',
        description: 'Better, faster, stronger.\nCatches 1 small or medium rat per night.',
        cost: 1,
        minLevel: 1,
        max: -1,
        menuSprite: 'simpletrap',
        menuScale: 1,
        create: function(info, isCurrent, x, y) { return new LargeTrap(info, isCurrent, x, y); }
    },
    {
        id: ItemTypes.SNAP,
        name: 'Heavy-Duty Snap Trap',
        description: 'Quick killing. 100% effective.\nCatches 1 rat of any size per night.',
        cost: 10,
        minLevel: 1,
        max: -1,
        menuSprite: 'simpletrap',
        menuScale: 1,
        create: function(info, isCurrent, x, y) { return new HeavyDutyTrap(info, isCurrent, x, y); }
    },
    {
        id: ItemTypes.HUMANE,
        name: '"Humane" Trap',
        description: 'Non-lethal -- you\'ll have to finish the job.\nCatches up to 5 rats of any size per night.',
        cost: 15,
        minLevel: 3,
        max: -1,
        menuSprite: 'simpletrap',
        menuScale: 1,
        create: function(info, isCurrent, x, y) { return new HumaneTrap(info, isCurrent, x, y); }
    },
    {
        id: ItemTypes.CAT,
        name: 'Cat',
        description: 'Nature\'s own rat repellent.\nRats will avoid cats at all costs.',
        cost: 15,
        minLevel: 4,
        max: 2,
        menuSprite: 'cat00',
        menuScale: 1,
        create: function(info, isCurrent, x, y) { return new Cat(info, isCurrent, x, y); }
    },
    {
        id: ItemTypes.JOHN,
        name: 'John',
        description: 'The Tonto to your Lone Ranger, the Robin to your Batman.\nJohn will "take care" of any rats he encounters.',
        cost: 100,
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
        
        this.setupStoreMenu();

        this.addExistingItems(existingItems);

        this.updatePriceLabels();

        var currInfo = Items[this.selectedIndex];
        this.currItem = currInfo.create(currInfo, true);

        this.setupInput();

        this.remainingTime = game.time.now + (1000 * 20);

        this.nameLabel = game.add.bitmapText(145, 10, 'blackOpsOne', '', 28);
        this.descriptionLabel = game.add.bitmapText(145, 38, 'blackOpsOne', '', 24);

        this.selectItem(0, true);
    }
}

Store.prototype.setupStoreMenu = function() {
    var menuX = 50;

    this.selection = game.add.graphics(menuX - 24, this.getIndexY(0));
    this.selection.lineStyle(2, 0xffd900, 1);
    this.selection.drawRect(0, 0, 48, 48);

    function addItem(info, that) {
        var index = that.availableItems.length;
        var y = that.getIndexY(index);
        var t = game.add.sprite(menuX, y, info.menuSprite);
        t.scale.setTo(info.menuScale);
        t.anchor.setTo(0.5, 0);

        var l = game.add.bitmapText(menuX + 28, y + 24, 'blackOpsOne', '$' + info.cost, 18);
        l.itemId = info.id;
        l.anchor.setTo(0, 0.5);
        
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
}

Store.prototype.setupInput = function() {
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

    var escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
    escKey.onDown.add(function() {
        this.done();
    }, this);


}

Store.prototype.addExistingItems = function(existingItems) {
    // Poison does not persist between levels
    existingItems = _.filter((existingItems || []), function(i) { i.id != ItemTypes.POISON });
    
    for (var i = 0; i < existingItems.length; i++) {
        var info = Items[existingItems[i]['id']];
        var x = existingItems[i]['x'];
        var y = existingItems[i]['y'];
        
        this.placedItems.push(info.create(info, false, x, y));
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

    this.nameLabel.text = info.name;
    this.descriptionLabel.text = info.description;

    if (info.max > 0) {
        this.descriptionLabel.text += '\nMax: ' + info.max;
    } else {
        this.descriptionLabel.text += '\nMax: Unlimited';
    }


    if (!silent) {
        game.audio.play(AudioEvents.MENU_CLICK);
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
    this.nameLabel.kill();
    this.descriptionLabel.kill();
    
    this.state = StoreStates.DONE;

    game.audio.play(AudioEvents.STORE_DONE);
}

Store.prototype.error = function() {
    game.audio.play(AudioEvents.STORE_ERROR);

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

            game.audio.play(AudioEvents.PLACE_ITEM);

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