(function() {
    function init() {
        game.stage.backgroundColor = '#fff';

        game.scale.scaleMode = Phaser.ScaleManager.NONE;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        
    }

    function preload() {
        game.load.image('package', 'package.jpg');
        game.load.image('arcadecabinet', 'arcadecabinet.jpg');
        game.load.image('screenshot', 'screenshot.png');

        // TODO: Sounds/music?
    }

    function create() {
        package = game.add.sprite(game.world.centerX, game.world.centerY, 'package');
        package.anchor.setTo(0.5);

        // TODO: Snowflake particles?

        var packageDuration = 2000;
        var cabinetDuration = 2000;
        var screenshotDuration = 1000;
        var screenshotPauseDuration = 1000;
        
        package.inputEnabled = true;
        package.events.onInputUp.add(function() {
            game.camera.fade(0xffffff, packageDuration/2);
            package.inputEnabled = false;

            game.camera.onFadeComplete.add(function() { 
                package.visible = false;
                var arcadeCabinet = game.add.sprite(game.world.centerX, game.world.centerY, 'arcadecabinet');
                arcadeCabinet.anchor.setTo(0.5);                

                game.time.events.add(cabinetDuration, function() {
                    var screenshot = game.add.sprite(game.world.centerX + 5, game.world.centerY - 80, 'screenshot');
                    screenshot.anchor.setTo(0.5, 0.0);
                    screenshot.scale.setTo(0.09, 0.13);
                    screenshot.angle = 22;
                    screenshot.alpha = 0.0;

                    window.screenshot = screenshot;

                    var scaleXTween = game.add.tween(screenshot.scale).to({x: 1}, screenshotDuration, Phaser.Easing.Linear.None).start();
                    var scaleYTween = game.add.tween(screenshot.scale).to({y: 1}, screenshotDuration, Phaser.Easing.Linear.None).start();
                    var alphaTween = game.add.tween(screenshot).to({alpha: 1}, screenshotDuration, Phaser.Easing.Linear.None).start();
                    var angleTween = game.add.tween(screenshot).to({angle: 0}, screenshotDuration, Phaser.Easing.Linear.None).start();

                    game.time.events.add(screenshotDuration + screenshotPauseDuration, function() {
                        window.location.href = '../index.html';
                    });
                });

                game.camera.flash(0xffffff, packageDuration/2);
            }, this); 
        }, this);
    }

    function update() {

    }

    CoopDefenderChristmas.Main = {init: init, preload: preload, create: create, update, update};
})();



var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'game');

game.state.add('Main', CoopDefenderChristmas.Main);
game.state.start('Main');