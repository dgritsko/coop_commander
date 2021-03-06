(function() {
    var menuMinX = 300;
    var menuMinY = 230;
    var quoteX = 150;
    var quoteY = 525;
    var highScoreX = 700;
    var highScoreY = 130;

    var isStarting = false;

    function init(args) {
        args = args || {};

        CoopDefender.Menu.args = args;
        
        args.nextRatSpawn = game.time.now;
    }

    function preload() {
        Util.preloadState(game);
    }

    function create() {
        game.audio.playMusic(MusicEvents.MAIN_MENU);

        isStarting = false;

        game.camera.flash('#000000', 250);
        
        game.stage.backgroundColor = 0xa7d9ff;

        sun = game.add.sprite(500, 500, 'sun');
        sun.anchor.setTo(0.5, 0.5);

        clouds = Util.drawClouds(game);

        Util.drawSunrise(sun, game);

        Util.drawGrass(game);
        
        rats = game.add.group();

        var args = CoopDefender.Menu.args;

        var titleLabel = game.add.bitmapText(game.world.centerX, 60, 'blackOpsOne', 'Coop Defender', 64);
        titleLabel.anchor.setTo(0.5, 0.5);

        var papaGLabel = game.add.bitmapText(game.world.centerX - titleLabel.width / 2, 20, 'blackOpsOne', 'Papa G\'s', 20);
        papaGLabel.anchor.setTo(0, 0.5);
        
        var subtitleLabel = game.add.bitmapText(game.world.centerX, 100, 'blackOpsOne', 'Inspired by true events', 24);
        subtitleLabel.anchor.setTo(0.5, 0.5);

        menuItems = game.add.group();

        addMenuItem('Start', menuItems, function() {
            game.audio.play(AudioEvents.MENU_CLICK);
            startGame();
        });

        addMenuItem('Intro', menuItems, function() {
            game.audio.play(AudioEvents.MENU_CLICK);
            showIntro();
        });

        addMenuItem('How to Play', menuItems, function() {
            game.audio.play(AudioEvents.MENU_CLICK);
            showHelp();
        });

        addMenuItem('Scoreboard', menuItems, function() {
            game.audio.play(AudioEvents.MENU_CLICK);
            showScoreboard();
        });

        menuArrow = game.add.sprite(menuMinX - 16, 0, 'menu_arrow');
        menuArrow.scale.setTo(0.5, 0.5);
        menuArrow.anchor.setTo(0.5, 0.5);

        selectedIndex = 0

        upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        upKey.onDown.add(function() { 
            selectedIndex = selectedIndex == 0 ? menuItems.children.length - 1 : selectedIndex-1;
            highlightIndex(selectedIndex);
            game.audio.play(AudioEvents.MENU_CLICK);
        }, this);

        downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        downKey.onDown.add(function() { 
            selectedIndex = selectedIndex < menuItems.children.length - 1 ? selectedIndex+1 : 0;
            highlightIndex(selectedIndex);
            game.audio.play(AudioEvents.MENU_CLICK);
        }, this);

        enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        enterKey.onDown.add(function() { 
            menuItems.children[selectedIndex].events.onInputUp.dispatch();
        }, this);

        spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(function() { 
            menuItems.children[selectedIndex].events.onInputUp.dispatch();
        }, this);

        quoteDisplay = game.add.bitmapText(quoteX, quoteY, 'blackOpsOne', '', 28);
        showQuote();

        qKey = game.input.keyboard.addKey(Phaser.Keyboard.Q);
        qKey.onDown.add(function() { 
            showQuote();
        }, this);

        highlightIndex(selectedIndex);

        var highScoreLabels = showHighScores();

        $.getJSON('http://gritsko.com/coop_defender/api/scores', function(scores) { 
            highScoreLabels.destroy();
            showHighScores(scores);
        });
    }

    function update() {
        updateBackgroundRats();

        for (var i = 0; i < clouds.children.length; i++) {
            var cloud = clouds.children[i];

            if (cloud.x >= game.world.width) {
                cloud.x = -300;
            }
        }
    }

    function highlightIndex(index) {
        menuArrow.y = menuItems.children[index].centerY + 3;
    }

    function addMenuItem(text, items, callback) {
        var fontSize = 28;

        var y = menuMinY + items.children.length * (fontSize + 12);

        var label = GameUtil.drawTextButton(game, menuMinX, y, text, callback, this);

        items.add(label);
    }

    function startGame() {
        if (isStarting) {
            return;
        }
        isStarting = true;

        Util.drawSunset(sun, game, new Phaser.Point(500, 500), function() {
            game.audio.playMusic(MusicEvents.GAME_STARTING);
            
            game.camera.fade('#000000', 250);
            game.camera.onFadeComplete.add(function() { 
                game.state.start('Game');
            }, this);
        })
    }

    function showIntro() {
        if (isStarting) {
            return;
        }
        isStarting = true;

        Util.drawSunset(sun, game, new Phaser.Point(500, 500), function() {
            game.camera.fade('#000000', 250);
            game.camera.onFadeComplete.add(function() { 
                game.state.start('Intro');
            }, this);
        })
    }

    function showHelp() {
        game.camera.fade('#000000', 250);
        game.camera.onFadeComplete.add(function() { 
            game.state.start('Help');
        }, this);
    }

    function showScoreboard() {
        game.camera.fade('#000000', 250);
        game.camera.onFadeComplete.add(function() { 
            game.state.start('Scoreboard');
        }, this);
    }

    function showQuote(index) {
        var quoteTexts = [
            'You all know I run traps all the time to try to keep the rodents down around the chickens.',
            'I tried a new strategy last night. Guess how many rodents we caught?',
            'When I was young, and even into adulthood, the critter I most feared was a rat.',
            'My fear of rats was pretty high. I saw them from time to time in a stream behind \nour house as a child - and they freaked me out.',
            'Well. Like batman over coming his greatest fear. I overcame mine. \nAnd although they are a huge nuisance they no longer freak me out.',
            'I learned a few years ago that mammals, like raccoons, skunks, etc. live where \nthere is water, food and shelter. They also learn where food is as each season changes.',
            'We created my science experiment because the cat food kept getting left out on the \nporch and so I started trapping and moving possums, raccoons, etc. far away. \nThat said, we had several generations of critters that kept looking for food on our porch.',
            'The rats are the same. They need food water and shelter - and \nwe kind of have the perfect thing for them in the duck and chicken pen.',
            'Although rats are everywhere. You rarely see them. You all have them also. \nBut back to here.',
            'We only started to notice them a little over 2 years ago. But for sure we had them all \nalong but weren\'t realizing it.',
            'So I started trapping them. Started doing a much better job with the food, etc. But \n that said. We were way behind the 8 ball.',
            'It took me really like a year or two to learn not just to trap, but how to trap, \nwhich traps worked better, where to put a trap. It took time to learn all this.',
            'Just so you know. You could think of the driveway as like a forcefield. The rats \nhave never crossed it to my knowledge. And that is because of the cats. \nThey are deadly effective on rats.',
            'Last night I tried a new method. We caught 23',
            'I will try the new method again tonight. I was shocked to see how well it worked. \nNormally bigger rats are really smart. But they were not smart at all last night',
            'I think we did serious damage to them last night.',
            'A friend of mine who is kind of "Bill Nye the Science Guy"-ish said that an acre usually \nsupports 35 rodents on average.',
            'Just also to those weak at heart. They are nocturnal. You really don\'t see them- almost\n never in the day.',
            'Always. And I mean always. I put the dead rats in a certain spot in the yard. \nAnd they always disappear.',
            'Pardon my analogy but rats are like Starbucks in the animal world.',
            'Many larger mammals and birds of prey feed on them. At 9 am there were 23. \nGuess how many are already gone. My guess is to hawks or vultures.',
            'I won\'t get into how they went from being alive to dead.',
            'I\'ll update more later. I am leading a tour at 10am. Pray it goes well. \nTell Cait I\'ll get back on her email today',
            'Good news is that there seem to be very few rats at the moment.',
            'In the coming days, count on more updates from RNN.',
            'It\'s a battle. If you have chickens, you gotta fight.'
        ];

        // TODO: Dynamic message that lists how many were caught during the previous night?

        if (typeof(index) === 'undefined') {
            index = Math.floor(Math.random() * quoteTexts.length);
        }

        var quoteText = quoteTexts[index];

        quoteText = '"' + quoteText + '"\n         - Papa G';

        quoteDisplay.text = quoteText;
    }

    function showHighScores(highScores) {
        if (game.state.current != 'Menu') {
            return;
        }

        var labels = game.add.group();

        highScores = highScores || [];

        var fontSize = 28;
        
        var highScoreLabel = game.add.bitmapText(highScoreX + 144, highScoreY, 'blackOpsOne', 'High Scores', fontSize);

        for (var i = 0; i < 10; i++) {
            var x = highScoreX;
            var y = highScoreY + (i + 1) * fontSize;

            var maxLength = 26;

            var name = '---';
            var score = '--';
            if (i < highScores.length) {
                name = highScores[i].name.length > maxLength ? highScores[i].name.slice(0, maxLength) + '...' : highScores[i].name
                score = highScores[i].score;
            }

            var prefixLabel = game.add.bitmapText(x, y, 'blackOpsOne', (i + 1) + '.', fontSize);
            var nameLabel = game.add.bitmapText(x + 40, y, 'blackOpsOne', name, fontSize);
            var scoreLabel = game.add.bitmapText(x + 400, y, 'blackOpsOne', score, fontSize);

            labels.add(prefixLabel);
            labels.add(nameLabel);
            labels.add(scoreLabel);
        }

        return labels;
    }

    function updateBackgroundRats() {
        if (CoopDefender.Menu.args.nextRatSpawn < game.time.now) {
            CoopDefender.Menu.args.nextRatSpawn = game.time.now + 1000 + Math.random() * 2000;

            var distance = 0.5 + Math.random() * 2;

            var y = 400 + 100 * distance;

            var spriteName = ['rat00', 'rat01', 'rat02'][Math.floor(Math.random() * 3)]

            var r = game.add.sprite(0, y, spriteName);

            r.scale.setTo(distance, distance);

            game.physics.arcade.enable(r);
            game.physics.arcade.moveToXY(r, game.world.width, y);

            r.animations.add('right', [6, 7, 8], 10, true);
            
            var speed = 2 * distance;

            r.body.velocity.x *= speed;
            r.body.velocity.y *= speed;

            rats.add(r);
        }
        
        for (var i = 0; i < rats.children.length; i++) {
            var rat = rats.children[i];
            rat.animations.play('right');
        }

        for (var i = 0; i < rats.children.length; i++) {
            var rat = rats.children[i];
            if (!rat.inCamera) {
                rat.kill();
                rats.remove(rat);
            }
        }
    }

    function shutdown() {
        Util.shutdownState(game);     
    }

    function render() {
        // for (var i = 0; i < menuItems.children.length; i++) {
        //     var l = menuItems.children[i];

        //     var rect = new Phaser.Rectangle();
        //     rect.copyFrom(l.hitArea);
        //     rect.offset(l.x, l.y);

        //     game.debug.geom(rect, 'rgba(255, 0, 0, 1)')
        // }
    }

    CoopDefender.Menu = {init: init, preload: preload, create: create, update: update, shutdown: shutdown, render: render};
})();