(function() {
    function init(args) {
        CoopDefender.Score.args = args;
    }

    function preload() {
        Util.preloadState(game);
    }

    var playerName;
    var playerNameText;
    var maxLength = 100;
    var doneLabel;

    var remainingTime;
    var isDone = false;

    function create() {
        isDone = false;
        game.stage.backgroundColor = 0x001933;

        var args = CoopDefender.Score.args;

        var gameOverText = game.add.bitmapText(game.world.centerX, game.world.centerY - 130, 'blackOpsOne', 'Game Over', 34);
        gameOverText.anchor.setTo(0.5, 0.5);

        var scoreText = game.add.bitmapText(game.world.centerX, game.world.centerY - 90, 'blackOpsOne', 'Score: ' + args.score + '         Level: ' + args.level, 24);
        scoreText.anchor.setTo(0.5, 0.5);

        enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        enterKey.onDown.add(function() { 
            showMenu();
        }, this);

        escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        escKey.onDown.add(function() { 
            showMenu();
        }, this);

        var clouds = Util.drawClouds(game);
        
        Util.drawGrass(game);

        game.camera.flash('#000000', 250);

        playerName = '';
        playerNameText = game.add.bitmapText(game.world.centerX, game.world.centerY + 40, 'blackOpsOne', '', 28);
        playerNameText.anchor.setTo(0.5, 0.5);
        
        playerNameTextDescription = game.add.bitmapText(game.world.centerX, game.world.centerY, 'blackOpsOne', 'Enter Your Name', 28);
        playerNameTextDescription.anchor.setTo(0.5, 0.5);

        getInput();

        remainingTime = game.time.now + (1000 * 20);

        doneLabel = GameUtil.drawTextButton(game, game.world.width - 170, 20, 'Done', function() {
            showMenu();
        }, this);

        var margin = 10;
        doneLabel.hitArea = new Phaser.Rectangle(-margin, -margin, doneLabel.width + margin * 8, doneLabel.height + margin * 2); 

        drawStats(args.allDeadRats || []);
    }

    function drawStats(rats) {
        var i = 0;
        var j = 0;

        var y = 500;
        var x = 340;

        var statsTitle = game.add.bitmapText(game.world.centerX, y - 28, 'blackOpsOne', 'Kill Stats', 28);
        statsTitle.anchor.setTo(0.5);

        function drawStat(name, value) {
            var xOffset = i * 380;
            var yOffset = j * 25;
            var nameText = game.add.bitmapText(x + xOffset, y + yOffset, 'blackOpsOne', name, 23);
            nameText.anchor.setTo(0, 0.5);

            var valueText = game.add.bitmapText(x + xOffset + 210, y + yOffset, 'blackOpsOne', value || '0', 23);
            valueText.anchor.setTo(0, 0.5);

            j += 1;
        }

        function newColumn() {
            i += 1;
            j = 0;
        }

        var killedByShovel = _.filter(rats, function(r) { return r.state == RatStates.KILLED_BY_SHOVEL; }).length;
        drawStat('Shovel', killedByShovel);

        var killedByFlashlight = _.filter(rats, function(r) { return r.state == RatStates.KILLED_BY_FLASHLIGHT; }).length;
        drawStat('Flashlight', killedByFlashlight);

        var killedByPoison = _.filter(rats, function(r) { return r.state == RatStates.KILLED_BY_POISON; }).length;
        drawStat('Poison', killedByPoison);

        var killedByBasicTrap = _.filter(rats, function(r) { return r.state == RatStates.KILLED_BY_BASIC_TRAP; }).length;
        drawStat('Basic Trap', killedByBasicTrap);


        var killedByStrongTrap = _.filter(rats, function(r) { return r.state == RatStates.KILLED_BY_STRONG_TRAP; }).length;
        drawStat('Strong Trap', killedByStrongTrap);

        var killedBySnapTrap = _.filter(rats, function(r) { return r.state == RatStates.KILLED_BY_SNAP_TRAP; }).length;
        drawStat('Snap Trap', killedBySnapTrap);

        var killedInHumaneTrap = _.filter(rats, function(r) { return r.state == RatStates.KILLED_IN_HUMANE_TRAP; }).length;
        drawStat('"Humane" Trap', killedInHumaneTrap);

        var killedByJohn = _.filter(rats, function(r) { return r.state == RatStates.KILLED_BY_JOHN; }).length;
        drawStat('John', killedByJohn);

        drawStat('Total', rats.length);

        newColumn();
            
        var class1Small = _.filter(rats, function(r) { return r.class == 1 && r.size == 'small'; }).length;
        drawStat('Class 1 Small', class1Small);

        var class1Medium = _.filter(rats, function(r) { return r.class == 1 && r.size == 'medium'; }).length;
        drawStat('Class 1 Medium', class1Medium);

        var class1Large = _.filter(rats, function(r) { return r.class == 1 && r.size == 'large'; }).length;
        drawStat('Class 1 Large', class1Large);

        var class2Small = _.filter(rats, function(r) { return r.class == 2 && r.size == 'small'; }).length;
        drawStat('Class 2 Small', class2Small);

        var class2Medium = _.filter(rats, function(r) { return r.class == 2 && r.size == 'medium'; }).length;
        drawStat('Class 2 Medium', class2Medium);

        var class2Large = _.filter(rats, function(r) { return r.class == 2 && r.size == 'large'; }).length;
        drawStat('Class 2 Large', class2Large);

        var class3Small = _.filter(rats, function(r) { return r.class == 3 && r.size == 'small'; }).length;
        drawStat('Class 3 Small', class3Small);

        var class3Medium = _.filter(rats, function(r) { return r.class == 3 && r.size == 'medium'; }).length;
        drawStat('Class 3 Medium', class3Medium);

        var class3Large = _.filter(rats, function(r) { return r.class == 3 && r.size == 'large'; }).length;
        drawStat('Class 3 Large', class3Large);
    }

    function update() {
        playerNameText.text = playerName + '_';

        var remainingSeconds = Math.floor((remainingTime - game.time.now) / 1000);

        if (remainingSeconds <= 0) {
            showMenu();
        }

        doneLabel.text = 'Done (' + remainingSeconds + ')';
    }

    function shutdown() {
        Util.shutdownState(game); 
    }

    function showMenu() {
        // Make sure this doesn't get called multiple times...
        if (isDone) {
            return;
        }

        isDone = true;
        
        var score = CoopDefender.Score.args.score || 0;
        var level = CoopDefender.Score.args.level || 0;

        $.post('http://gritsko.com/coop_defender/api/scores?name=' + playerName + '&score=' + score + '&level=' + level).always(function() {
            game.camera.fade('#000000', 250);
            game.camera.onFadeComplete.add(function() { 
                game.state.start('Menu');
            }, this);
        });
    }

    function getInput() {
        game.input.keyboard.addCallbacks(this, null, function(evt) { 
            // var char = String.fromCharCode(evt.keyCode).toString();
            // var pattern = /[A-Za-z0-9 ]/;
            // if (pattern.test(char)) {

            if (evt.key.length == 1 && playerName.length < maxLength) {
                playerName += evt.key;
            } else if (evt.keyCode === 8) {
                evt.preventDefault();
                playerName = playerName.length > 0 ? playerName.slice(0, playerName.length - 1) : '';
            }
        }, null);
    }

    CoopDefender.Score = {init: init, preload: preload, create: create, update: update, shutdown: shutdown};
})();