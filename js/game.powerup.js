PowerupTypes = [
    { 
        id: 0,
        name: 'Extra Food'
    },
    {
        id: 1,
        name: 'Super Speed'
    },
    {
        id: 2,
        name: '$$$'
    }
];

class Powerup {
    constructor(game, id, x, y) {
        this.isActive = true;
        this.id = typeof(id) == 'number' ? id : Math.floor(Math.random() * PowerupTypes.length);

        var x = x || game.rnd.integerInRange(100, game.world.width - 450);
        var y = y || game.rnd.integerInRange(100, game.world.height - 100);

        this.sprite = game.add.sprite(x, y, 'powerups', this.id);
        this.sprite.anchor.setTo(0.5, 0.5);
    }
}

Powerup.prototype.kill = function() {
    if (this.isActive) {
        this.sprite.destroy();
        this.isActive = false;
    }
}