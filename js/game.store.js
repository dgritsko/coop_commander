var Items = [
    {
        'name': 'Basic Trap',
        'spriteName': 'trap00',
        'cost': 2,
        'radius': 200
    },
    {
        'name': 'Rat Poison',
        'spriteName': 'trap01',
        'cost': 1,
        'radius': 100
    },
    {
        'name': 'Rat Poison',
        'spriteName': 'trap01',
        'cost': 1,
        'radius': 75
    }
];

StoreStates = {
    ACTIVE: 0,
    DONE: 1
};

class Store {
    constructor(money) {
        this.state = StoreStates.ACTIVE;

        this.money = money;

        this.selectedIndex = 0;
        
        this.selection = game.add.graphics(50, this.getIndexY(0));
        
        this.selection.lineStyle(2, 0xffd900, 1);

        this.selection.drawRect(0, 0, 48, 48);

        this.availableItems = [];
        this.itemLabels = [];
        this.placedItems = [];

        function addItem(info, that) {
            var index = that.availableItems.length;
            var y = that.getIndexY(index);
            var t = game.add.sprite(50, y, info['spriteName']);

            var l = game.add.bitmapText(50 + 20, y + 28, 'blackOpsOne', '$' + info['cost'], 18);

            t.inputEnabled = true;
            t.events.onInputDown.add(function() {
                that.selectItem(index);
            }, this);

            that.availableItems.push(t);
            that.itemLabels.push(l);
        }

        for (var i = 0; i < Items.length; i++) {
            addItem(Items[i], this);
        }

        this.updatePriceLabels();

        this.currItem = new Trap(Items[this.selectedIndex]);
        
        var doneLabelY = this.getIndexY(Items.length) + 20;//baseY + (50 * Items.length) + 20;
        this.doneLabel = game.add.bitmapText(50, doneLabelY, 'blackOpsOne', 'Done', 28);

        this.doneLabel.inputEnabled = true;
        this.doneLabel.events.onInputUp.add(function() {
            this.done();
        }, this);


        var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        upKey.onDown.add(function() { 
            if (this.state == StoreStates.ACTIVE) {
                var newIndex = this.selectedIndex > 0 ? this.selectedIndex - 1 : Items.length - 1;
                this.selectItem(newIndex);
            }
        }, this);

        var downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        downKey.onDown.add(function() { 
            if (this.state == StoreStates.ACTIVE) {
                var newIndex = this.selectedIndex < Items.length - 1 ? this.selectedIndex + 1 : 0;
                this.selectItem(newIndex);
            } 
        }, this);
    }
}

Store.prototype.getIndexY = function(index) {
    var baseY = 200;
    var y = baseY + (50 * index);
    return y;    
}

Store.prototype.selectItem = function(index) {
    var info = Items[index];
    var y = this.getIndexY(index);

    this.currItem.kill();
    this.currItem = new Trap(info);
    this.selection.y = y;

    this.selectedIndex = index;

    fxClick.play();    
}

Store.prototype.updatePriceLabels = function() {
    var money = this.money;
    _.each(_.zip(Items, this.itemLabels), function(x) {
        var item = x[0];
        var label = x[1];

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
    
    this.state = StoreStates.DONE;

    fxReload.play();
}

Store.prototype.update = function() {
    this.currItem.update();

    if (game.input.activePointer.isDown) {
        this.pointerDown = true;
    } else if (this.pointerDown) {
        this.pointerDown = false;

        if (!this.currItem.canPlace()) {
            return;
        }

        if (this.currItem.info['cost'] <= this.money) {
            this.currItem.isCurrent = false;   

            this.money -= this.currItem.info['cost'];

            this.currItem = new Trap(Items[this.selectedIndex]);

            this.updatePriceLabels();

            fxPop.play();
        } else {
            console.log('TODO: Can\'t place trap, not enough funds');

            fxError.play();
        }
    }
}