var ItemTypes = {
    POISON: 0,
    BASIC: 1,
    STRONG: 2,
    SNAP: 3,
    HUMANE: 4,
    CAT: 5,
    JOHN: 6
}

ItemParams = {
    POISON_RADIUS: 200,
    POISON_CAPACITY: 10,
    BASIC_RADIUS: 50,
    BASIC_RESETS: 3,
    BASIC_LIFETIME: 5,
    STRONG_RADIUS: 100,
    STRONG_RESETS: 3,
    STRONG_LIFETIME: 7,
    SNAP_RADIUS: 125,
    SNAP_RESETS: 3,
    SNAP_LIFETIME: 10,
    HUMANE_RADIUS: 175,
    HUMANE_CAPACITY: 5,
    HUMANE_RESETS: 3,
    HUMANE_LIFETIME: 10,
    CAT_RADIUS: 100,
    CAT_PATROL_RADIUS: 200,
    JOHN_SPEED: 100
}

var Items = [
    {
        id: ItemTypes.POISON,
        name: 'Rat-X Poison',
        description: 'Cheap and effective, but frowned upon by the Geneva Conventions.\nBe forewarned -- using it comes with consequences.',
        stats: ['Capacity: ' + ItemParams.POISON_CAPACITY + ' rats (any size)', 'Duration: 1 night', 'Resettable: N/A', 'Max: Unlimited'],
        cost: 10,
        minLevel: 1,
        max: -1,
        lifetime: 1,
        menuSprite: 'poison',
        menuScale: 0.8,
        create: function(info, isCurrent, x, y, level) { return new Poison(info, isCurrent, x, y, level); }
    },
    {
        id: ItemTypes.BASIC,
        name: 'Basic Wooden Trap',
        description: 'Just a humble rat trap.',
        stats: ['Capacity: 1 small rat', 'Duration: ' + ItemParams.BASIC_LIFETIME + ' nights', 'Resettable: ' + ItemParams.BASIC_RESETS + 'x / night', 'Max: Unlimited'],
        cost: 10,
        minLevel: 1,
        max: -1,
        lifetime: ItemParams.BASIC_LIFETIME,
        menuSprite: 'simpletrap',
        menuScale: 0.5,
        create: function(info, isCurrent, x, y, level) { return new BasicTrap(info, isCurrent, x, y, level); }
    },
    {
        id: ItemTypes.STRONG,
        name: 'Strong Wooden Trap',
        description: 'Better, faster, stronger.',
        stats: ['Capacity: 1 small/medium rat', 'Duration: ' + ItemParams.STRONG_LIFETIME + ' nights', 'Resettable: ' + ItemParams.STRONG_RESETS + 'x / night', 'Max: Unlimited'],
        cost: 20,
        minLevel: 2,
        max: -1,
        lifetime: ItemParams.STRONG_LIFETIME,
        menuSprite: 'simpletrap',
        menuScale: 0.9,
        create: function(info, isCurrent, x, y, level) { return new StrongTrap(info, isCurrent, x, y, level); }
    },
    {
        id: ItemTypes.SNAP,
        name: 'Heavy-Duty Snap Trap',
        description: 'Quick killing. 100% effective.',
        stats: ['Capacity: 1 rat (any size)', 'Duration: ' + ItemParams.SNAP_LIFETIME + ' nights', 'Resettable: ' + ItemParams.SNAP_RESETS + 'x / night', 'Max: Unlimited'],
        cost: 25,
        minLevel: 4,
        max: -1,
        lifetime: ItemParams.SNAP_LIFETIME,
        menuSprite: 'snaptrap',
        menuScale: 1,
        create: function(info, isCurrent, x, y, level) { return new SnapTrap(info, isCurrent, x, y, level); }
    },
    {
        id: ItemTypes.HUMANE,
        name: '"Catch \'em Alive" Trap',
        description: 'This "humane" trap is non-lethal -- you\'ll have to finish the job.',
        stats: ['Capacity: ' + ItemParams.HUMANE_CAPACITY + ' rats (any size)', 'Duration: ' + ItemParams.HUMANE_LIFETIME + ' nights', 'Resettable: ' + ItemParams.HUMANE_RESETS + 'x / night (when full)', 'Max: Unlimited'],
        cost: 50,
        minLevel: 5,
        max: -1,
        lifetime: ItemParams.HUMANE_LIFETIME,
        menuSprite: 'humanetrap',
        menuScale: 0.5,
        create: function(info, isCurrent, x, y, level) { return new HumaneTrap(info, isCurrent, x, y, level); }
    },
    {
        id: ItemTypes.CAT,
        name: 'Cat',
        description: 'Nature\'s own rat repellent.\nRats will avoid cats at all costs.',
        stats: ['Duration: Permanent', 'Max: 2', 'Force Field: Yes'],
        cost: 50,
        minLevel: 6,
        max: 2,
        lifetime: -1,
        menuSprite: 'cat00',
        menuScale: 1,
        create: function(info, isCurrent, x, y, level) { return new Cat(info, isCurrent, x, y, level); }
    },
    {
        id: ItemTypes.JOHN,
        name: 'John',
        description: 'The Tonto to your Lone Ranger, the Robin to your Batman.\nJohn will "take care" of any rats he encounters.',
        stats: ['Duration: Permanent', 'Max: 1', 'Finna Be: Lit'],
        cost: 100,
        minLevel: 7,
        max: 1,
        lifetime: -1,
        menuSprite: 'john',
        menuScale: 1,
        create: function(info, isCurrent, x, y, level) { return new John(info, isCurrent, x, y, level); }
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
        this.quantityLabels = [];
        this.placedItems = [];
        this.itemAddedCallbacks = [];
        
        this.setupStoreMenu();

        this.addExistingItems(existingItems);

        this.updateItemLabels();

        this.currItem = null;

        this.setupInput();

        this.remainingTime = game.time.now + (1000 * 20);

        this.nameLabel = game.add.bitmapText(145, 10, 'blackOpsOne', '', 28);
        this.descriptionLabel = game.add.bitmapText(145, 38, 'blackOpsOne', '', 24);
        this.instructionsLabel = game.add.bitmapText(game.world.centerX, game.world.height - 40, 'blackOpsOne', 'Purchase Items', 34);
        this.instructionsLabel.anchor.setTo(0.5, 0.5);

        this.statsLabels = [];

        game.audio.playMusic(MusicEvents.STORE_STARTING, this.level);
    }
}

Store.prototype.setupStoreMenu = function() {
    var menuX = 50;

    this.selection = game.add.graphics(menuX - 24, this.getIndexY(0));
    this.selection.lineStyle(2, 0xffd900, 1);
    this.selection.drawRect(0, 0, 48, 48);
    this.selection.visible = false;

    function addItem(info, that) {
        var index = that.availableItems.length;
        var y = that.getIndexY(index);
        var t = game.add.sprite(menuX, y, info.menuSprite);
        t.scale.setTo(info.menuScale);
        t.anchor.setTo(0.5, 0);

        var l = game.add.bitmapText(menuX + 28, y + 14, 'blackOpsOne', '$' + info.cost, 18);
        l.itemId = info.id;
        l.anchor.setTo(0, 0.5);
        
        var q = game.add.bitmapText(menuX + 28, y + 28, 'blackOpsOne', '', 18);
        q.itemId = info.id;
        q.anchor.setTo(0, 0.5);

        if (info.max == -1) {
            l.y = y + 28;
        }

        t.inputEnabled = true;
        t.events.onInputDown.add(function() {
            that.selectItem(index);
        }, this);

        that.availableItems.push(t);
        that.itemLabels.push(l);
        that.quantityLabels.push(q);
    }

    for (var i = 0; i < Items.length; i++) {
        if (this.level >= Items[i].minLevel) {
            addItem(Items[i], this);
        }
    }

    this.cancelLabel = GameUtil.drawTextButton(game, menuX - 10, this.getIndexY(this.availableItems.length) + 30, 'Cancel', this.cancel, this);
    this.cancelLabel.text = '';
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
    var currentLevel = this.level;

    existingItems = _.filter((existingItems || []), function(i) { 
        var info = Items[i.id];

        if (info.lifetime == -1) {
            return true;
        }
        
        var age = currentLevel - i.level;

        return age < info.lifetime;
    });
    
    for (var i = 0; i < existingItems.length; i++) {
        var info = Items[existingItems[i].id];
        var x = existingItems[i].x;
        var y = existingItems[i].y;
        var level = existingItems[i].level;
        
        var existingItem = info.create(info, false, x, y, level);

        if (info.lifetime == -1) {
            existingItem.resaleValue = Math.floor(info.cost * 0.5);
        } else {
            var age = currentLevel - existingItems[i].level;
            var remaining = info.lifetime - age;

            existingItem.resaleValue = Math.floor(info.cost * (remaining / info.lifetime));

            if (existingItem.lifetimeLabel) {
                existingItem.lifetimeLabel.text = remaining == 1 ? '1 night' : remaining + ' nights';
            }
        }

        this.placedItems.push(existingItem);
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

    if (this.currItem) {
        this.currItem.kill();
        this.currItem = null;
    }

    this.statsLabels.forEach(function(l) { l.destroy(); });

    this.selection.visible = true;

    this.selection.y = y;

    this.selectedIndex = index;

    this.nameLabel.text = info.name;
    this.descriptionLabel.text = info.description;

    var descriptionLines = (info.description.match(/\n/g)||[]).length

    for (var i = 0; i < info.stats.length; i++) {
        var row = i % 2;
        var column = Math.floor(i / 2);

        var fontSize = 22;

        var x = 145 + 300 * column;
        var y = 75 + (descriptionLines * 24) + (row * fontSize);

        var statLabel = game.add.bitmapText(x, y, 'blackOpsOne', info.stats[i], fontSize);
        this.statsLabels.push(statLabel);
    }

    if (!silent) {
        game.audio.play(AudioEvents.MENU_CLICK);
    }    

    var existingCount = _.filter(this.placedItems, function(item) { return item.info.id == info.id; }).length;
    if (info.max != -1 && existingCount >= info.max) {
        // Already placed the max quantity
        game.audio.play(AudioEvents.STORE_ERROR);
        return;
    }

    this.cancelLabel.text = 'Cancel';
    this.currItem = info.create(info, true, 0, 0, this.level);
}

Store.prototype.updateItemLabels = function() {
    var money = this.money;
    var that = this;

    this.itemLabels.forEach(function(label) { 
        var item = Items[label.itemId];
        label.tint = item['cost'] <= money ? 0xffffff : 0xff0000;
    });

    this.quantityLabels.forEach(function(label) {
        var item = Items[label.itemId];

        var existing = _.filter(that.placedItems, function(item) { return item.info.id == label.itemId; }).length;

        if (item.max == -1) {
            // noop?
        } else {
            label.text = existing + ' of ' + item.max;
        }
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

    _.each(this.quantityLabels, function(l) {
        l.kill();
    });

    _.each(this.placedItems, function(i) {
        if (i.finishSetup) {
            i.finishSetup();
        } else if (i.graphics) {
            i.graphics.destroy();
        }
    });    

    this.doneLabel.kill();
    if (this.currItem) {
        this.currItem.kill();
    }
    this.nameLabel.kill();
    this.descriptionLabel.kill();

    this.statsLabels.forEach(function(l) { l.destroy(); });

    this.instructionsLabel.kill();
    this.cancelLabel.kill();

    this.state = StoreStates.DONE;

    game.audio.play(AudioEvents.STORE_DONE);

    game.audio.playMusic(MusicEvents.STORE_ENDING, this.level);
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

    var didClick = false;
    if (game.input.activePointer.isDown) {
        this.pointerDown = true;
    } else if (this.pointerDown) {
        this.pointerDown = false;
        didClick = true;
    }


    if (!this.currItem) {
        if (didClick) {
            var cursorPosition = new Phaser.Point(game.input.x, game.input.y);

            var clickedItems = _.filter(this.placedItems, function(i) { 
                return i.sprite.getBounds().contains(cursorPosition.x, cursorPosition.y);
            });

            if (clickedItems.length == 1) {
                this.selectedItem = clickedItems[0];
                this.cancelLabel.text = 'Sell ($' + this.selectedItem.resaleValue + ')';
                game.audio.play(AudioEvents.MENU_CLICK);
                this.selection.visible = false;
            } else {
                this.selectedItem = null;
                this.cancelLabel.text = '';
            }
        }

        return;
    }

    this.currItem.move();

    if (didClick) {
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
            this.currItem = null;

            this.selection.visible = false; 

            this.updateItemLabels();

            game.audio.play(AudioEvents.PLACE_ITEM);

            this.cancelLabel.text = '';

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

Store.prototype.cancel = function() {
    if (this.currItem) {
        this.currItem.kill();
        this.selection.visible = false;
        this.currItem = null;
        
        game.audio.play(AudioEvents.MENU_CLICK);
    } else if (this.selectedItem) {
        this.selectedItem.kill();

        this.money += this.selectedItem.resaleValue;

        var selectedItem = this.selectedItem;
        this.placedItems = _.filter(this.placedItems, function(i) { return i !== selectedItem; } );

        this.selectedItem = null;

        game.audio.play(AudioEvents.SELL_ITEM);
        this.updateItemLabels();

        for (var i = 0; i < this.itemAddedCallbacks.length; i++) {
            this.itemAddedCallbacks[i]();
        }
    }

    this.pointerDown = false;
    this.cancelLabel.text = '';
}