(function() {
    function preload() {
        Util.preloadState(game);
    }

    var player;

    function create() {
        game.stage.backgroundColor = '#000000';

        var title = addText('How to Play', game.world.centerX, 34, 34);
        centerAnchor(title);

        player = game.add.sprite(160, 120, 'player', 20);        
        player.scale.setTo(1.5);
        centerAnchor(player);

        var playerTitle = addText('Papa G', player.centerX, player.y + player.height - 30);
        var playerSubtitle = addText('Defender of the Coop', player.centerX, playerTitle.y + playerTitle.height + 6);
        centerAnchor(playerTitle);
        centerAnchor(playerSubtitle);

        var flashlight = game.add.sprite(160, 260, 'flashlight');
        flashlight.scale.setTo(0.5, 0.5);
        centerAnchor(flashlight);
        var flashlightTitle = addText('Flashlight', flashlight.centerX, flashlight.y + flashlight.height);
        var flashlightSubtitle = addText('Clears the screen of all living rats.\nLimited usage.\nCan be replenished with powerups.', flashlight.centerX + 20, flashlightTitle.y + flashlightTitle.height + 30);
        centerAnchor(flashlightTitle);
        centerAnchor(flashlightSubtitle);


        var shovel = game.add.sprite(160, 430, 'shovel');
        centerAnchor(shovel);
        var shovelTitle = addText('Shovel', shovel.centerX, shovel.y + shovel.height - 20);
        var shovelSubtitle = addText('Kills any rat on contact. Unlimited usage.\nWhen you absolutely, positively, need to kill\nevery rat in the coop, accept no substitutes.', shovel.centerX + 40, shovelTitle.y + shovelTitle.height + 30);
        centerAnchor(shovelTitle);
        centerAnchor(shovelSubtitle);

        drawRats();

        drawPowerups();
        
        drawChickensAndFood();

        drawItems();

        drawControls();
        
        // Items
        // Various items can be purchased with your hard-earned cash. Buy items before the start of each night.
        
        // Controls
        // Separate section for controls. Similar to that found on the pause screen.

        var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(function() {
            showMenu();
        }, this);
        
        enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        enterKey.onDown.add(function() { 
            showMenu();
        }, this);

        escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        escKey.onDown.add(function() { 
            showMenu();
        }, this);
    }

    function drawRats() {
        var rats = game.add.group();
        var cellSize = 90;

        var ratGridX = 500;
        var ratGridY = 140;

        var ratTitle = addText('Rats', ratGridX + cellSize, ratGridY - 60);
        centerAnchor(ratTitle);


        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                var index = i * 3 + j;
                var type = RatTypes[index];
                
                var ratX = ratGridX + cellSize * i;
                var ratY = ratGridY + cellSize * j;

                var rat = new Rat(rats, type, 0, ratX, ratY);

                var scoreText = addText(type.score + ' pts', ratX - 3, ratY + 30, 20);
                centerAnchor(scoreText);
            }

            var c = 'Class 1';
            switch (i) {
                case 1:
                    c = 'Class 2';
                    break;
                case 2:
                    c = 'Class 3';
                    break;
            }

            var s = 'Small';
            switch (i) {
                case 1:
                    s = 'Medium';
                    break;
                case 2: 
                    s = 'Large';
                    break;
            }

            var classText = addText(c, ratGridX + i * cellSize, ratGridY - 40);
            centerAnchor(classText);

            var sizeText = addText(s, ratGridX - 80, ratGridY + i * cellSize);
            centerAnchor(sizeText);
        }
    }

    function drawPowerups() {
        var title = addText('Powerups', 1000, 85);
        centerAnchor(title);

        var moneyPowerup = game.add.sprite(1000, 130, 'powerups', 2);
        var moneyPowerupText = addText('Gives you $$$', moneyPowerup.centerX, moneyPowerup.y + moneyPowerup.height);
        centerAnchor(moneyPowerup);
        centerAnchor(moneyPowerupText);

        var bootsPowerup = game.add.sprite(1000, 200, 'powerups', 1);
        var bootsPowerupText = addText('Move faster for the rest of the level', bootsPowerup.centerX, bootsPowerup.y + bootsPowerup.height);
        centerAnchor(bootsPowerup);
        centerAnchor(bootsPowerupText);

        var eggPowerup = game.add.sprite(1000, 270, 'powerups', 0);
        var eggPowerupText = addText('Adds a chicken to your flock', eggPowerup.centerX, eggPowerup.y + eggPowerup.height);
        centerAnchor(eggPowerup);
        centerAnchor(eggPowerupText);

        var flashlightPowerup = game.add.sprite(1000, 340, 'powerups', 3);
        var flashlightPowerupText = addText('Gives you an additional flashlight', flashlightPowerup.centerX, flashlightPowerup.y + flashlightPowerup.height);
        centerAnchor(flashlightPowerup);
        centerAnchor(flashlightPowerupText);
    }

    function drawChickensAndFood() {
        // TODO
        var chicken = game.add.sprite(900, 420, 'chicken00');
        chicken.scale.setTo(1.5);
        centerAnchor(chicken);
        var chickenTitle = addText('Chicken', chicken.centerX, chicken.y + chicken.height - 20);
        centerAnchor(chickenTitle);

        var foodIndexes = [12,13,14];

        for (var i = 0; i < foodIndexes.length; i++) {
            var food = game.add.sprite(chicken.x + 100 + i * 40, chicken.y + 20, 'food', foodIndexes[i]);
            food.scale.setTo(2);
            centerAnchor(food);
        }

        var foodTitle = addText('Food', chicken.x + 140, chicken.y + chicken.height - 20);
        centerAnchor(foodTitle);

        var description = addText('Chickens will die if there\'s not enough food.\nIf you run out of food, you lose.', chicken.x + 100, chicken.y + 90);
        centerAnchor(description);
    }

    function drawItems() {
        // TODO
    }

    function drawControls() {
        var keySeparator = 3;
        var keyX = 670;
        var keyY = 600;
        
        var keySize = 45;
        var firstRowY = 570;

        var spaceKey = GameUtil.drawKey(game, 350, keyY + keySize + keySeparator, keySize * 5, keySize);
        
        var flashlightKey = GameUtil.drawKey(game, 390, firstRowY, keySize, keySize, 'F');

        var pauseKey = GameUtil.drawKey(game, 500, firstRowY, keySize, keySize, 'P');

        var upKey = GameUtil.drawKey(game, keyX + keySize + keySeparator, keyY, keySize, keySize, '↑');

        var downKey = GameUtil.drawKey(game, keyX + keySize + keySeparator, keyY + keySeparator + keySize, keySize, keySize, '↓');
        
        var leftKey = GameUtil.drawKey(game, keyX, keyY + keySeparator + keySize, keySize, keySize, '←');
        
        var rightKey = GameUtil.drawKey(game, keyX + keySize * 2 + keySeparator * 2, keyY + keySeparator + keySize, keySize, keySize, '→');
        
        var attackLabel = addText('Attack', spaceKey.centerX, spaceKey.y + spaceKey.height + 16);
        centerAnchor(attackLabel);        

        var moveLabel = addText('Move', downKey.centerX, downKey.y + downKey.height + 16);
        centerAnchor(moveLabel);

        var pauseLabel = addText('Pause', pauseKey.centerX, pauseKey.y + pauseKey.height + 16);
        centerAnchor(pauseLabel);

        var flashlightLabel = addText('Flashlight', flashlightKey.centerX, flashlightKey.y + flashlightKey.height + 16);
        centerAnchor(flashlightLabel);
    }



    function update() {
        if (game.input.activePointer.isDown) {
            this.pointerDown = true;
        } else if (this.pointerDown) {
            this.pointerDown = false;
            showMenu();
        }
    }

    function shutdown() {
        Util.shutdownState(game); 
    }
    
    function showMenu() {
        game.camera.fade('#000000', 250);
        game.camera.onFadeComplete.add(function() { 
            game.state.start('Menu');
        }, this);
    }

    function addText(text, x, y, size) {
        size = size || 20;

        return game.add.bitmapText(x, y, 'blackOpsOne', text, size);
    }

    function centerAnchor(thing) {
        thing.anchor.setTo(0.5, 0.5);
    }

    CoopDefender.Help = {preload: preload, create: create, update: update, shutdown: shutdown};
})();