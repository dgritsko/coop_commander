class Util {
    static drawGrass(game) {
        var ground = game.add.group();

        var grassSprite = 'grass01';

        var grassSize = game.cache.getImage(grassSprite).width;
        
        var scale = 0.15;
        var maxScale = 1.5;
        var scaleIncrement = 0.15;
        
        var index = 0;
        for (var y = 450; y < game.height; y += ((grassSize * scale) / 2)) {
            index++;
            scale = Math.min(maxScale, scale + scaleIncrement);

            for (var x = 0; x < game.width; x += (grassSize * scale)) {
                var g = game.add.sprite(x, y, grassSprite);

                g.scale.setTo(scale, scale);
                
                if (y >= 550) {
                    game.physics.arcade.enable(g);
                    g.body.moves = false;
                    ground.add(g);
                }
            }
        }

        return ground;
    }

    static moveAlongArc(sprite, startAngle, endAngle, radius, duration, easing, game) {
        startAngle = startAngle / (180 / Math.PI);
        endAngle = endAngle / (180 / Math.PI);

        var centerX = sprite.x;
        var centerY = sprite.y;

        sprite.x = centerX + Math.sin(startAngle) * radius;
        sprite.y = centerY + Math.cos(startAngle) * radius;

        var rotationState = { angle: startAngle };

        var tween = game.add.tween(rotationState).to({ angle: endAngle }, duration, easing);
        tween.onUpdateCallback(function() {
            var newX = Math.sin(rotationState.angle) * radius;
            var newY = Math.cos(rotationState.angle) * radius;

            sprite.x = centerX + newX;
            sprite.y = centerY + newY;
        }, this);

        return tween;
    }
}