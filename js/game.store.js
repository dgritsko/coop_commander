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
    }
];

StoreStates = {
    ACTIVE: 0,
    DONE: 1
};

class Store {
    constructor() {
        this.state = StoreStates.ACTIVE;
        var baseY = 200;
        
        this.selection = game.add.graphics(50, baseY);
        
        this.selection.lineStyle(2, 0xffd900, 1);

        this.selection.drawRect(0, 0, 48, 48);

        this.availableItems = [];
        this.itemLabels = [];
        this.placedItems = [];

        function addItem(info, that) {
            var y = baseY + (50 * that.availableItems.length);
            var t = game.add.sprite(50, y, info['spriteName']);

            var l = game.add.bitmapText(50 + 20, y + 28, 'blackOpsOne', '$' + info['cost'], 18);

            t.inputEnabled = true;
            t.events.onInputDown.add(function() {
                that.currItem.kill();
                that.currItem = new Trap(info);
                that.selection.y = y;
            }, this);

            that.availableItems.push(t);
            that.itemLabels.push(l);
        }

        for (var i = 0; i < Items.length; i++) {
            addItem(Items[i], this);
        }

        this.currItem = new Trap(Items[0]);
        
        var doneLabelY = baseY + (50 * Items.length) + 20;
        this.doneLabel = game.add.bitmapText(50, doneLabelY, 'blackOpsOne', 'Done', 28);

        this.doneLabel.inputEnabled = true;
        this.doneLabel.events.onInputUp.add(function() {
            this.done();
        }, this);
    }
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
}

Store.prototype.update = function() {
    this.currItem.update();

    // if (game.input.activePointer.isDown) {
    //     currTrap.isCurrent = false;

    //     currTrap = new Trap();
    // }

    // // TODO: Place traps...
    // currTrap.update();
}