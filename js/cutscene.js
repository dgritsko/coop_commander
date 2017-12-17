(function() {
    var gameState = {};
    var updateCallbacks = [];
    var predator = undefined;

    var scoreAdjustmentDuration = 350;

    function init(args) {
        updateCallbacks = [];
        gameState = args;
    }

    function preload() {
        game.time.advancedTiming = true;

        Util.preloadState(game);
    }

    function create() {
        var scoreAdjustments = createScoreAdjustments(gameState);

        updateGameState(gameState);

        game.stage.backgroundColor = '#000000';

        Util.drawClouds(game);

        sun = game.add.sprite(500, 500, 'sun');
        sun.anchor.setTo(0.5, 0.5);

        Util.drawSunrise(sun, game);

        levelComplete(scoreAdjustments);

        ground = Util.drawGrass(game);

        var extraDelay = scoreAdjustmentDuration * scoreAdjustments.length;

        var deadRats = _.where(gameState.currentRatInfo, { isDead: true }).length;

        if (deadRats > 0) {
            drawRats(gameState.currentRatInfo);

            game.time.events.add(extraDelay + 1500, drawPredator, this)

            game.time.events.add(extraDelay + 6000, function() { Util.drawSunset(sun, game); }, this);

            game.time.events.add(extraDelay + 8000, nextLevel, this);
        } else {
            game.time.events.add(extraDelay + 1000, function() { Util.drawSunset(sun, game); }, this);
            
            game.time.events.add(extraDelay + 3000, nextLevel, this);
        }
    }

    function update() {
        for (var i = 0; i < updateCallbacks.length; i++) {
            updateCallbacks[i]();
        }
    }

    function updateGameState(state) {
        state.level += 1;

        var currentDeadRats = _.where(state.currentRatInfo, { isDead: true });

        var currentDeadRatCount = currentDeadRats.length;

        state.allDeadRats = (state.allDeadRats || []).concat(currentDeadRats);

        // TODO: Scale this better?
        state.money += currentDeadRatCount;

        state.initialFoodCount = state.foodCount;
        state.initialMoney = state.money;        
    }

    function nextLevel() {
        game.camera.fade('#000000', 250);
        game.camera.onFadeComplete.add(function() {
            game.state.start('Game', true, false, { previousState: gameState });
        }, this);
    }

    function createScoreAdjustments(gameState) {
        var result = [];

        var scoreAdjustment = 0;
        var foodAdjustment = 0;

        // Add stat line for the money earned
        var totalKills = _.filter(gameState.inactiveRats, function(r) { return r.isDead(); }).length;
        if (totalKills > 0) {
            result.push({ text: totalKills + ' Killed', value: '+$' + totalKills });
        } else {
            var pacifistBonus = 500;
            scoreAdjustment += pacifistBonus;

            result.push({ text: 'Pacifist', value: pacifistBonus });
        }

        if (gameState.level % 10 == 0) {
            foodAdjustment += 1;
            result.push({ text: 'Bonus Chicken', value: 'Yes'});
        }

        // -50 points for every rat escaped
        var escaped = _.filter(gameState.inactiveRats, function(r) { return r.state == RatStates.ESCAPED; }).length;
        if (escaped > 0) {
            var escapedPenalty = escaped * -50;
            scoreAdjustment += escapedPenalty;

            result.push({ text: escaped + ' Escaped', value: escapedPenalty, valueTint: 0xff0000 });
        }

        // -100 points for every rat poisoned
        var poisonKills = _.filter(gameState.inactiveRats, function(r) { return r.state == RatStates.KILLED_BY_POISON; }).length;
        if (poisonKills > 0) {
            var poisonedPenalty = poisonKills * -100;
            scoreAdjustment += poisonedPenalty;

            result.push({ text: poisonKills + ' Poisoned', value: poisonedPenalty, valueTint: 0xff0000 });
        }

        // +500 for not losing any food
        if (gameState.foodCount >= gameState.initialFoodCount) {
            var cleanBonus = 250;
            scoreAdjustment += cleanBonus; 

            result.push({ text: 'Coop Defender', value: '+' + cleanBonus });
        }

        if (gameState.money >= gameState.initialMoney && gameState.initialMoney > 0) {
            var investingBonus = 50;
            scoreAdjustment += investingBonus; 

            result.push({ text: 'A Penny Saved', value: '+' + investingBonus });
        }

        // +200 for every 10 rats killed
        var bonusTier = Math.floor(totalKills / 10);
        if (bonusTier > 0) {
            var tierBonus = bonusTier * 200;
            scoreAdjustment += tierBonus;

            result.push({ text: 'Kill Bonus', value: '+' + tierBonus });
        }

        // +25 per rat for only using the shovel
        var shovelKills = _.filter(gameState.inactiveRats, function(r) { return r.state == RatStates.KILLED_BY_SHOVEL; }).length;
        if (totalKills > 0 && shovelKills == totalKills) {
            var shovelBonus = shovelKills * 25;
            scoreAdjustment += shovelBonus;

            result.push({ text: 'School of Hard Knocks', value: '+' + shovelBonus });
        }

        // +10 per rat for only using the flashlight
        var flashlightKills = _.filter(gameState.inactiveRats, function(r) { return r.state == RatStates.KILLED_BY_FLASHLIGHT; }).length;
        if (totalKills > 0 && flashlightKills == totalKills) {
            var flashlightBonus = flashlightKills * 10;
            scoreAdjustment += flashlightBonus;

            result.push({ text: 'Blinding Light', value: '+' + flashlightBonus });
        }

        // +50 per rat for only using traps
        if (escaped == 0 && shovelKills == 0 && flashlightKills == 0) {
            var trapBonus = totalKills * 50;
            scoreAdjustment += trapBonus;

            result.push({ text: 'Impenetrable Fortress', value: '+' + trapBonus });
        }

        gameState.score += scoreAdjustment;
        gameState.foodCount += foodAdjustment;

        return result;
    }

    function levelComplete(scoreAdjustments) {
        game.audio.play(AudioEvents.LEVEL_COMPLETE);

        var label = game.add.bitmapText(game.world.centerX, 150, 'blackOpsOne', 'Level ' + gameState.level + ' Complete', 28);
        label.anchor.setTo(0.5, 0.5);
        label.alpha = 0;

        var tween = game.add.tween(label).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None);
        tween.delay(500);

        tween.onComplete.add(function() {
            drawScoreAdjustments(scoreAdjustments);
        });        

        tween.start();
    }

    function drawScoreAdjustments(scoreAdjustments) {
        var fontSize = 24;
        var margin = 2;

        scoreAdjustments.forEach(function(scoreAdjustment, index) {
            game.time.events.add(scoreAdjustmentDuration * (index + 1), function () {
                game.audio.play(AudioEvents.BONUS_REPORT);

                var titleLabel = game.add.bitmapText(game.world.centerX - 150, 180 + (fontSize + margin) * index, 'blackOpsOne', scoreAdjustment.text, fontSize);
                titleLabel.anchor.setTo(0, 0.5);

                var valueLabel = game.add.bitmapText(game.world.centerX + 150, 180 + (fontSize + margin) * index, 'blackOpsOne', scoreAdjustment.value + '', fontSize);
                valueLabel.anchor.setTo(0, 0.5);

                if (scoreAdjustment.valueTint) {
                    valueLabel.tint = scoreAdjustment.valueTint;
                }

                var title_t1 = game.add.tween(titleLabel.scale).to({ x : 2, y : 2}, 150, Phaser.Easing.Cubic.Out);
                var title_t2 = game.add.tween(titleLabel.scale).to({ x : 1, y : 1}, 150, Phaser.Easing.Cubic.In);
                title_t1.chain(title_t2);
                title_t1.start();

                var value_t1 = game.add.tween(valueLabel.scale).to({ x : 2, y : 2}, 150, Phaser.Easing.Cubic.Out);
                var value_t2 = game.add.tween(valueLabel.scale).to({ x : 1, y : 1}, 150, Phaser.Easing.Cubic.In);
                value_t1.chain(value_t2);
                value_t1.start();
            });
        });
    }

    function drawPredator() {
        var duration = 5000;
        
        var predators = [
            drawVulture,
            drawFox,
            drawGarbageTruck,
             drawAliens
            //drawOldLady,
            //drawBear
        ];

        predators[Math.floor(Math.random() * predators.length)](duration);
    }

    function drawVulture(duration) {
        predator = game.add.sprite(-50, 150, 'vulture00');

        predator.anchor.setTo(0.5, 0.5);
        predator.scale.setTo(2, 2);
        
        predator.animations.add('down', [0, 1, 2], 10, true);
        predator.animations.add('left', [3, 4, 5], 10, true);
        predator.animations.add('right', [6, 7, 8], 10, true);
        predator.animations.add('up', [9, 10, 11], 10, true);

        var hasPlayedChomp = false;
        updateCallbacks.push(function() {
            predator.animations.play('right');

            rats.children.forEach(function(r) {
                if (predator.x >= r.x && r.alpha > 0) {
                    r.alpha = 0;
                }
            });

            if (predator.x >= game.world.centerX && !hasPlayedChomp) {
                hasPlayedChomp = true;
                game.audio.play(AudioEvents.CHOMP);
            }
        });

        var t1 = game.add.tween(predator).to({ x : game.world.width + 50 }, duration, Phaser.Easing.Cubic.InOut);
        var t2 = game.add.tween(predator).to({ y : 525 }, duration/2, Phaser.Easing.Linear.None)
        var t3 = game.add.tween(predator).to({ y : -100 }, duration/2, Phaser.Easing.Cubic.InOut);

        t2.chain(t3);
        t1.start();
        t2.start();

        game.audio.play(AudioEvents.VULTURE);
    }

    function drawGarbageTruck(duration) {
        predator = game.add.sprite(-150, 535, 'garbagetruck00');
        predator.anchor.setTo(0.5, 0.5);
        
        predator.animations.add('right', [0, 1, 2, 3], 10, true);
        
        updateCallbacks.push(function() {
            predator.animations.play('right');
        });

        var t1 = game.add.tween(predator).to({ x : game.world.width / 2 + 150 }, duration/2, Phaser.Easing.Cubic.Out);
        
        t1.onComplete.add(function() {
            game.audio.play(AudioEvents.GARBAGE_TRUCK_SMASH);

            for (var i = 0; i < rats.children.length; i++) {
                var rat = rats.children[i];
                rat.body.moves = false;
                game.add.tween(rat).to({x : game.world.width / 2 + 150}, 800, Phaser.Easing.Cubic.Out).start();
                game.add.tween(rat).to({y : 535}, 800, Phaser.Easing.Cubic.Out).start();
                game.add.tween(rat).to({alpha : 0}, 800, Phaser.Easing.Linear.None).start();
            }
        });

        var t2 = game.add.tween(predator).to({ x : game.world.width + 150 }, duration/2, Phaser.Easing.Cubic.In)

        t1.chain(t2);
        t1.start();

        game.audio.play(AudioEvents.GARBAGE_TRUCK);
    }

    function drawAliens(duration) {
        predator = game.add.sprite(-150, 350, 'ufo00');

        predator.anchor.setTo(0.5, 0.5);
        predator.scale.setTo(0.25, 0.25);

        var t1 = game.add.tween(predator).to({ x : game.world.width / 2 }, duration/2, Phaser.Easing.Cubic.Out);
        var t2 = game.add.tween(predator).to({ x : game.world.width + 150 }, duration/2, Phaser.Easing.Cubic.In)

        t1.chain(t2);

        game.time.events.add(duration/2-250, function() {
            var beam = game.add.sprite(game.world.width/2, 370, 'beam00');
            beam.scale.setTo(1.0, 2.0);
            beam.anchor.setTo(0.5, 0);
            predator.bringToTop();
            game.time.events.add(800, function() {
                beam.alpha = 0;
            }, this);

            updateCallbacks.push(function() {
                beam.x = predator.x;
            });
        });

        t1.onComplete.add(function() {
            game.audio.play(AudioEvents.UFO_BEAM);

            for (var i = 0; i < rats.children.length; i++) {
                var rat = rats.children[i];
                rat.body.moves = false;
                game.add.tween(rat).to({y : rat.y - 200}, 800, Phaser.Easing.Cubic.Out).start();
                game.add.tween(rat).to({alpha : 0}, 800, Phaser.Easing.Cubic.Out).start();
            }
        });

        t1.start();

        game.audio.play(AudioEvents.UFO);
    }

    function drawFox(duration) {
        game.audio.play(AudioEvents.FOX);

        predator = game.add.sprite(-50, 535, 'fox00');

        predator.anchor.setTo(0.5, 0.5);
        predator.scale.setTo(2.5, 2.5);

        predator.animations.add('down', [0, 1, 2, 3], 10, true);
        predator.animations.add('left', [4, 5, 6, 7], 10, true);
        predator.animations.add('right', [8, 9, 10, 11], 10, true);
        predator.animations.add('up', [12, 13, 14, 15], 10, true);

        var hasPlayedChomp = false;
        updateCallbacks.push(function() {
            predator.animations.play('right');

            rats.children.forEach(function(r) {
                if (predator.x >= r.x && r.alpha > 0) {
                    r.alpha = 0;
                }
            });

            if (predator.x >= game.world.centerX && !hasPlayedChomp) {
                hasPlayedChomp = true;
                game.audio.play(AudioEvents.CHOMP);
            }
        });

        var t1 = game.add.tween(predator).to({ x : game.world.width + 50 }, duration, Phaser.Easing.Linear.None);
        t1.start();
    }

    function drawRats(ratInfos) {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        rats = game.add.group();

        var addRat = function(ratInfo) {
            var rat = game.add.sprite(game.world.centerX, 500, ratInfo.spriteName, Math.floor(Math.random() * 12));
            game.physics.arcade.enable(rat);
            rat.anchor.setTo(0.5, 0.5);
            var scale = ratInfo.scale.x;
            rat.scale.setTo(scale, scale);
            rat.body.bounce.setTo(0.5, 0.5);
            rat.body.gravity.setTo(0, 400);
            var bodySize = 10 * scale;
            rat.body.setSize(bodySize, bodySize, bodySize, bodySize);
            rat.body.velocity.x = (Math.random() * 100) - 50;
            rat.body.velocity.y = (Math.random() * 200) - 150;
            rat.angle = (Math.random() * 180) - 90;
            rat.body.drag = new Phaser.Point(20, 200);

            if (ratInfo.state == RatStates.KILLED_BY_POISON) {
                rat.tint = 0x008000;
            }

            rats.add(rat);
        };

        ratInfos.forEach(function(r) { 
            if (r.isDead) {
                addRat(r); 
            }
        });

        var minVelocity = 0.05;

        updateCallbacks.push(function() {
            game.physics.arcade.collide(rats, ground, function(a, b) {
                a.body.velocity.y = 0;
            });
        });
    }

    function shutdown() {
        if (predator) {
            predator.destroy();
            predator = null;
        }

        Util.shutdownState(game);
    }

    function render() {
        //game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");   
    }

    CoopDefender.Cutscene = {init: init, preload: preload, create: create, update: update, shutdown: shutdown, render: render};
})();