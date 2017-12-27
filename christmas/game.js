(function() {
    var pointerDown = null;
    var clickOffset = null;
    var directionChanges = 0;
    var previousPosition = new Phaser.Point(0, 0);
    var isOpeningPresent = false;

    function init() {
        game.stage.disableVisibilityChange = true;
        
        game.stage.backgroundColor = '#fff';

        game.scale.scaleMode = Phaser.ScaleManager.NONE;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        
    }

    function preload() {
        game.load.image('package', 'package.jpg');
        game.load.image('arcadecabinet', 'arcadecabinet.jpg');
        game.load.image('screenshot', 'screenshot.png');

        game.load.audio('christmas', '../assets/sound/music/christmas.mp3');
        game.load.audio('success03', 'success03.wav');
        game.load.audio('shake', 'shake.wav');
    }

    function create() {
        package = game.add.sprite(game.world.centerX, game.world.centerY, 'package');
        package.anchor.setTo(0.5);

        music = game.add.sound('christmas');
        music.loop = true;
        music.play();

        shake = game.add.sound('shake');
    }

    function update() {
        if (isOpeningPresent) {
            return;
        }

        var didClick = false;
        if (game.input.activePointer.isDown) {
            pointerDown = true;

            if (!clickOffset) {
                clickOffset = new Phaser.Point(game.input.x, game.input.y);
            }
        } else if (pointerDown) {
            pointerDown = false;
            didClick = true;
            clickOffset = null;
        }

        if (pointerDown) {
            package.x = game.input.x;
            package.y = game.input.y;

            var newPosition = new Phaser.Point(package.x - game.world.centerX, package.y - game.world.centerY);

            var didChangeDirection = (newPosition.x * previousPosition.x) < 0 || (newPosition.y * previousPosition.y) < 0;
            previousPosition = newPosition;

            if (didChangeDirection) {
                directionChanges += 1;
                shake.play();
            }

            if (directionChanges > 20) {
                openPresent();
            }
        }
    }

    function openPresent() {
        if (isOpeningPresent) {
            return;
        }

        isOpeningPresent = true;

        var success = game.add.sound('success03');
        success.play();

        var packageDelay = 2000;
        var packageDuration = 2000;
        var cabinetDuration = 4000;
        var screenshotDuration = 3000;
        var screenshotPauseDuration = 5000;
        var musicFadeDuration = 2000;
        
        game.time.events.add(packageDelay, function() {
            game.camera.fade(0xffffff, packageDuration/2);
            package.inputEnabled = false;

            game.camera.onFadeComplete.add(function() { 
                package.visible = false;
                var arcadeCabinet = game.add.sprite(game.world.centerX, game.world.centerY, 'arcadecabinet');
                arcadeCabinet.anchor.setTo(0.5);                

                game.time.events.add(cabinetDuration, function() {
                    var screenshot = game.add.sprite(game.world.centerX + 5, 0, 'screenshot');
                    screenshot.anchor.setTo(0.5, 0);
                    screenshot.scale.setTo(0.09, 0.13);
                    screenshot.angle = 22;
                    screenshot.alpha = 0.0;

                    window.screenshot = screenshot;

                    var scaleXTween = game.add.tween(screenshot.scale).to({x: 1}, screenshotDuration, Phaser.Easing.Linear.None).start();
                    var scaleYTween = game.add.tween(screenshot.scale).to({y: 1}, screenshotDuration, Phaser.Easing.Linear.None).start();
                    var alphaTween = game.add.tween(screenshot).to({alpha: 1}, screenshotDuration, Phaser.Easing.Linear.None).start();
                    var angleTween = game.add.tween(screenshot).to({angle: 0}, screenshotDuration, Phaser.Easing.Linear.None).start();

                    game.time.events.add(screenshotDuration + screenshotPauseDuration - musicFadeDuration, function() {
                        music.fadeOut(musicFadeDuration);
                    }, this);
                    
                    game.time.events.add(screenshotDuration + screenshotPauseDuration, function() {
                        window.location.href = '../index.html?fullscreen=true';
                    }, this);
                }, this);

                game.camera.flash(0xffffff, packageDuration/2);
            }, this); 
        }, this);
        
    }

    CoopDefenderChristmas.Main = {init: init, preload: preload, create: create, update, update};
})();



var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'game');

game.state.add('Main', CoopDefenderChristmas.Main);
game.state.start('Main');