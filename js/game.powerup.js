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
    constructor(game) {
        this.id = Math.floor(Math.random() * PowerupTypes.length);

        // TODO: Restrict the area in which powerups can spawn a little more than just "anywhere"

        var x = Math.random() * game.world.width;
        var y = Math.random() * game.world.height;

        this.sprite = game.add.sprite(x, y, 'powerups', this.id);
        this.sprite.anchor.setTo(0.5, 0.5);
    }
}

Powerup.prototype.pickup = function() {
    // TODO: Affect the game state based on the powerup's type
}