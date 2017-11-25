(function() {
    function create() {
        game.stage.backgroundColor = '#000000';

        addText('Story', 50, 50);
        var player = game.add.sprite(-8, 60, 'player', 20);        
        addText('You are Papa G. A humble farmer, trying to make a difference in the world.\n' +
        'But rodents in the area have noticed your chicken coop and have made it\n' +
        'their goal to starve your chickens by eating all of their food.\n' +
        'These rats are a scourge. They roam the countryside, preying on the hapless\n' +
        'souls just who are just trying to enjoy some fresh eggs. \n' +
        'Unfortunately for these rats, they have finally met their match. \n' +
        'It\'s time to show them who\'s boss.' , 50, 70);

        addText('Objective', 50, 250);
        addText('Every night, you must defend the chicken coop from rats. \n' + 
        'You can deal with rats in a variety of ways.', 50, 270);


        // Shovel
        var shovel = game.add.sprite(15, 320, 'shovel');
        shovel.scale.setTo(0.75, 0.75);

        addText('Shovel\n' +
        'Nothing spells death for a rat faster than the cold \n' +
        'steel blade of your trusty shovel. Accept no substitutes.', 50, 320);

        var flashlight = game.add.sprite(15, 390, 'flashlight');
        flashlight.scale.setTo(0.25, 0.25);

        addText('Flashlight\n' + 
        'Rats are creatures of darkness and will scatter when exposed to light.\n'+
        'This can be weaponized by using your flashlight, although such great power\n' +
        'can only be harnessed with extreme difficulty.', 50, 390);
        

        // Flashlight

        // Scream

        // Powerups

        // Bonuses


        

        // Enemies
        // Food 
        // Upgrades
        // Powerups
        //

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(function() {
            showMenu();
        }, this);

        
        enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        enterKey.onDown.add(function() { 
            showMenu();
        }, this);
    }

    function update() {
    }

    function showMenu() {
        game.camera.fade('#000000', 250);
        game.camera.onFadeComplete.add(function() { 
            game.state.start('Menu');
        }, this);
    }

    function addText(text, x, y, size) {
        size = size || 20;

        game.add.bitmapText(x, y, 'blackOpsOne', text, size);
    }

    CoopCommander.Help = {create: create, update: update};
})();