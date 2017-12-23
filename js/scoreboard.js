(function() {
    function preload() {
        Util.preloadState(game);
    }

    function create() {
        game.stage.backgroundColor = '#000000';

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


        var highScoreLabels = showHighScores();

        $.getJSON('http://gritsko.com/coop_defender/api/scores', function(scores) { 
            highScoreLabels.destroy();
            showHighScores(scores);
        });
    }

    function showHighScores(highScores) {        
        var highScoreX = 300;
        var highScoreY = 100;

        if (game.state.current != 'Scoreboard') {
            return;
        }

        var highScoreLabel = game.add.bitmapText(game.world.centerX, 50, 'blackOpsOne', 'Scoreboard', 34);
        highScoreLabel.anchor.setTo(0.5, 0.5);

        var labels = game.add.group();

        highScores = highScores || [];

        var fontSize = 28;
        
        var highScoreLabel = game.add.bitmapText(highScoreX + 300, highScoreY - fontSize, 'blackOpsOne', 'Top 10', fontSize);

        var nameOffset = 40;
        var scoreOffset = 400;
        var levelOffset = 550;
        var killsOffset = 650;

        var nameHeaderLabel = game.add.bitmapText(highScoreX + nameOffset, highScoreY, 'blackOpsOne', 'Name', fontSize);
        var scoreHeaderLabel = game.add.bitmapText(highScoreX + scoreOffset, highScoreY, 'blackOpsOne', 'Score', fontSize);
        var levelHeaderLabel = game.add.bitmapText(highScoreX + levelOffset, highScoreY, 'blackOpsOne', 'Level', fontSize);
        var killsHeaderLabel = game.add.bitmapText(highScoreX + killsOffset, highScoreY, 'blackOpsOne', 'Kills', fontSize);

        labels.add(nameHeaderLabel);
        labels.add(scoreHeaderLabel);
        labels.add(levelHeaderLabel);
        labels.add(killsHeaderLabel);

        for (var i = 0; i < 10; i++) {
            var x = highScoreX;
            var y = highScoreY + (i + 1) * fontSize;

            var maxLength = 26;

            var name = '---';
            var score = '--';
            var level = '--';
            var kills = '--';

            if (i < highScores.length) {
                name = highScores[i].name.length > maxLength ? highScores[i].name.slice(0, maxLength) + '...' : highScores[i].name
                score = highScores[i].score;
                level = highScores[i].level;
                kills = highScores[i].kills;
            }

            var prefixLabel = game.add.bitmapText(x, y, 'blackOpsOne', (i + 1) + '.', fontSize);
            var nameLabel = game.add.bitmapText(x + nameOffset, y, 'blackOpsOne', name, fontSize);
            var scoreLabel = game.add.bitmapText(x + scoreOffset, y, 'blackOpsOne', score, fontSize);
            var levelLabel = game.add.bitmapText(x + levelOffset, y, 'blackOpsOne', level, fontSize);
            var killsLabel = game.add.bitmapText(x + killsOffset, y, 'blackOpsOne', kills, fontSize);

            labels.add(prefixLabel);
            labels.add(nameLabel);
            labels.add(scoreLabel);
            labels.add(levelLabel);
            labels.add(killsLabel);
        }

        return labels;
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

    CoopDefender.Scoreboard = {preload: preload, create: create, update: update, shutdown: shutdown};
})();