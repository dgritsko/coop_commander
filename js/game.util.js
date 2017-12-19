class GameUtil {
    static drawGrass(game) {
        var grassSprite = 'grass01';

        var grassSize = game.cache.getImage(grassSprite).width;
        
        for (var x = 0; x < game.width; x += grassSize) {
            for (var y = 0; y < game.height; y += grassSize) {
                game.add.sprite(x, y, grassSprite);
            }
        }
    }

    static drawDirt(game, rect) {
        var spriteSize = 48;
        var width = rect.width / spriteSize;
        var height = rect.height / spriteSize;

        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                var spriteIndex = 4;

                if (j == 0) {
                    if (i == 0) {
                        spriteIndex = 0; 
                    } else if (i == (width - 1)) {
                        spriteIndex = 2;
                    } else {
                        spriteIndex = 1;
                    }
                } else if (j == (height - 1)) {
                    if (i == 0) {
                        spriteIndex = 6;
                    } else if (i == (width - 1)) {
                        spriteIndex = 8;
                    } else {
                        spriteIndex = 7;
                    }
                } else {
                    if (i == 0) {
                        spriteIndex = 3;
                    } else if (i == (width - 1)) {
                        spriteIndex = 5;
                    } else {
                        spriteIndex = 4;
                    }
                }

                var dirt = game.add.sprite(rect.x + (i * spriteSize), rect.y + (j * spriteSize), 'dirt01', spriteIndex);
                
                dirt.anchor.setTo(0.5, 0.5);
            }
        }
    }

    static drawFence(game, rect, group) {
        var spriteSize = 48;
        var width = rect.width / spriteSize;
        var height = rect.height / spriteSize;

        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                if (i == 0 || j == 0 || i == (width - 1) || j == (height - 1)) {
                    var spriteIndex = 0;
                    if (i == 0 && j == 0) {
                        spriteIndex = 6;
                    } else if (j == 0 && i == (width - 1)) {
                        spriteIndex = 9;
                    } else if (i == 0 && j == (height - 1)) {
                        spriteIndex = 7;
                    } else if (i == (width - 1) && j == (height - 1)) {
                        spriteIndex = 10;
                    } else if (i == 0 || i == (width - 1)) {
                        spriteIndex = j % 2 == 0 ? 2 : 3;
                    } else if (j == 0 || j == (height - 1)) {
                        spriteIndex = i % 2 == 0 ? 0 : 1;
                    } 

                    var f = game.add.sprite(rect.x + (i * spriteSize), rect.y + (j * spriteSize), 'fence00', spriteIndex);

                    f.anchor.setTo(0.5, 0.5);

                    game.physics.arcade.enable(f);

                    f.body.moves = false;

                    group.add(f);
                }
            }
        }
    }

    static drawCoop(game, rect) {
        var coop = game.add.sprite(rect.x + rect.width - 230, rect.y - 30, 'shed');
        coop.scale.setTo(1.5, 1.5);
        return coop;
    }

    static drawKey(game, x, y, width, height, label, onInputDown) {
        var radius = 4;
        var borderWidth = 2;
        var borderColor = 0xE7D296;
        var keyColor = 0xF8EFC8;
        var keyLabelColor = '#70665B';

        var g = game.add.graphics(x, y);

        g.beginFill(borderColor);
        g.drawRoundedRect(0, 0, width, height, radius);
        g.endFill();

        g.beginFill(keyColor);
        g.drawRoundedRect(borderWidth, borderWidth, width - borderWidth * 2, height - borderWidth * 2, radius);
        g.endFill();

        if (label) {
            var t = game.add.text(0, 0, label, { 'fill': keyLabelColor });
            t.anchor.setTo(0.5, 0.5);
            t.x = width / 2;
            t.y = height / 2;
            g.addChild(t);
        }

        if (onInputDown) {
            g.inputEnabled = true;
            g.events.onInputDown.add(onInputDown, this);
        }

        return g;
    }

    static drawTextButton(game, x, y, label, onInputUp, that) {
        var t = game.add.bitmapText(x, y, 'blackOpsOne', label, 28);
        if (onInputUp) {
            var margin = 10;

            t.hitArea = new Phaser.Rectangle(-margin, -margin, t.width + margin * 2, t.height + margin * 2);                
            t.inputEnabled = true;
            t.events.onInputUp.add(onInputUp, that);             
        }

        return t;
    }

    static getRatInfos(rats) {
        return _.map(rats, function(r) { return { 
                level: r.level, 
                state: r.state, 
                rank: r.type.rank, 
                class: r.type.class, 
                size: r.type.size, 
                spriteName: r.sprite.key, 
                scale: r.sprite.scale,
                isDead: r.isDead()
            }; 
        });
    }


    static setupHints(game) {
        var hints = game.add.group();
        var items = [];

        function clearHints() {
            items.forEach(function (i) { i.kill(); });
            items = [];
        }

        var keySize = 45;

        var keySeparator = 3;
        var keyX = game.world.centerX - keySize * 1.5 - 2;
        var keyY = 550;
        var firstRowY = keyY - 30;

        var interval = 3000;
        var displayInterval = 2000;        

        game.time.events.add(interval, function() {    
            var upKey = GameUtil.drawKey(game, keyX + keySize + keySeparator, keyY, keySize, keySize, '↑');
            items.push(upKey);

            var downKey = GameUtil.drawKey(game, keyX + keySize + keySeparator, keyY + keySeparator + keySize, keySize, keySize, '↓');
            items.push(downKey);

            var leftKey = GameUtil.drawKey(game, keyX, keyY + keySeparator + keySize, keySize, keySize, '←');
            items.push(leftKey);

            var rightKey = GameUtil.drawKey(game, keyX + keySize * 2 + keySeparator * 2, keyY + keySeparator + keySize, keySize, keySize, '→');
            items.push(rightKey);

            var movementLabel = game.add.bitmapText(keyX + 68, keyY + 108, 'blackOpsOne', 'Move', 28);
            movementLabel.anchor.setTo(0.5, 0.5);
            items.push(movementLabel);
        });

        game.time.events.add(interval + displayInterval, function() {
            clearHints();
        });

        game.time.events.add(interval * 2, function() {
            var spaceKey = GameUtil.drawKey(game, game.world.centerX - keySize * 2.5, keyY + keySize + keySeparator, keySize * 5, keySize);
            items.push(spaceKey);

            var attackLabel = game.add.bitmapText(keyX + 68, keyY + 108, 'blackOpsOne', 'Attack/Reset Trap', 28);
            attackLabel.anchor.setTo(0.5, 0.5);
            items.push(attackLabel);
        });

        game.time.events.add(interval * 2 + displayInterval, function() {
            clearHints();
        });

        game.time.events.add(interval * 3, function() {
            var flashlightKey = GameUtil.drawKey(game, game.world.centerX - keySize * .5, keyY + keySize + keySeparator, keySize, keySize, 'F');
            items.push(flashlightKey);

            var flashlightLabel = game.add.bitmapText(keyX + 68, keyY + 108, 'blackOpsOne', 'Flashlight', 28);
            flashlightLabel.anchor.setTo(0.5, 0.5);
            items.push(flashlightLabel);
        });

        game.time.events.add(interval * 3 + displayInterval, function() {
            clearHints();
        });
    }
}