class GameLevels {
    static parseSize(s) {
        if (s == 'm') {
            return 'medium';
        } 

        if (s == 'l') {
            return 'large';
        }

        return 'small';
    }

    static splitCsv(raw) {
        var components = raw.split(/,| /);
        
        var result = _.filter(components, function(e) { return e.trim(); });
        
        return result;
    }

    static parseLevel(items) {
        if (typeof(items) == 'string') {
            items = [items];
        }

        var parsed = _.map(items, function(p) {
            var parts = p.toLowerCase().split(':');

            var ratClass = p[0];
            var ratSize = p[1];
            var spawnTime = parts[1];
            var x = game.camera.bounds.x - 10;
            var y = Math.random() * game.world.height;
            if (parts.length == 3) {
                y = parseFloat(parts[2]) * game.world.height;
            }

            // Make sure our spawns don't get too crazy
            y = Phaser.Math.clamp(y, 0, game.world.height);

            return {
                class: parseInt(ratClass, 10),
                size: GameLevels.parseSize(ratSize),
                spawn: parseFloat(spawnTime),
                x: x,
                y: y
            };
        });

        return parsed;
    }

    static linearWave(types, startY, endY, startTime, interval, total) {
        var result = [];

        for (var i = 0; i < total; i++) {
            var y = startY + (endY - startY) * (i / total);
            var t = startTime + interval * i;
            
            var type = Phaser.ArrayUtils.getRandomItem(types);
            
            result.push(type +  ':' + t + ':' + y);
        }

        return result;
    }

    static sineWave(types, startY, amplitude, startTime, interval, total) {
        var result = [];

        for (var i = 0; i < total; i++) {
            var y = startY + Math.sin(i / Math.PI) * amplitude * 0.5;
            var t = startTime + interval * i;

            var type = Phaser.ArrayUtils.getRandomItem(types);

            result.push(type +  ':' + t + ':' + y);
        }

        return result;
    }

    static cluster(types, startY, variance, startTime, interval, total) {
        var result = [];
        
        for (var i = 0; i < total; i++) {
            var y = game.rnd.realInRange(startY - variance, startY + variance);
            var t = startTime + interval * i;

            var type = Phaser.ArrayUtils.getRandomItem(types);

            result.push(type +  ':' + t + ':' + y);
        }

        return result;
    }

    static stream(types, startY, endVariance, startTime, interval, total) {
        var result = [];
        
        for (var i = 0; i < total; i++) {
            var variance = endVariance * (i / total);
            var y = game.rnd.realInRange(startY - variance, startY + variance);
            var t = startTime + interval * i;

            var type = Phaser.ArrayUtils.getRandomItem(types);

            result.push(type +  ':' + t + ':' + y);
        }

        return result;
    }

    static level(num) {
        var levelIndex = num - 1;

        // Example of linear wave:
        //return GameLevels.parseLevel(GameLevels.linearWave(['3s'], 0.5, 0, 1, 0.1, 10));

        // Example of sine wave:
        //return GameLevels.parseLevel(GameLevels.sineWave(['1l'], 0.5, 0.3, 1, 0.2, 100));

        // Example of cluster:
        //return GameLevels.parseLevel(GameLevels.cluster(['1s', '2s'], 0.7, 0.1, 1, 0.1, 10));

        // Example of stream:
        //return GameLevels.parseLevel(GameLevels.stream(['2s'], 0.5, 0.5, 1, 0.1, 50));

        // return GameLevels.parseLevel(GameLevels.splitCsv('1s:0:0.5, 2s:0:0.5, 3s:0:0.5'));
        // //return GameLevels.parseLevel(GameLevels.splitCsv('3s:0:0.9, 3m:0:0.7, 3l:0:0.5,  3l:40:0.5, 3m:0:0.7, 3l:0:0.5,  3l:40:0.5, 3m:0:0.7, 3l:0:0.5,  3l:40:0.5, 3m:0:0.7, 3l:0:0.5,  3l:40:0.5, 3m:0:0.7, 3l:0:0.5,  3l:40:0.5, 3m:0:0.7, 3l:0:0.5,  3l:40:0.5, 3m:0:0.7, 3l:0:0.5,  3l:40:0.5'));

        // //return GameLevels.parseLevel(GameLevels.splitCsv('3s:0:0.9, , 3l:0:0.5, 3l:0:10'));
        // return GameLevels.parseLevel(GameLevels.splitCsv('3l:0, 3s:0, 3l:0, 3l:0, 3l:0.1, 3l:0.1, 3l:0.1, 3l:0.5, 3l:0.5, 3l:0.5, 3l:1, 3l:1, 3l:1.5, 3l:2, 3l:2, 3l:3'));

        // var initialLevels = [
        //     GameLevels.splitCsv('1s:1, 2m:1.2, 3l:3'),
        //     GameLevels.splitCsv('1s:1, 1s:1, 1m:3, 1m:3, 1s:3, 1m:7, 1s:8')
        // ];

        // if (levelIndex < initialLevels.length) {
        //     return GameLevels.parseLevel(initialLevels[levelIndex]);
        // }

        // return GameLevels.parseLevel('3l:0, 3l:0, 3s:0, 3l:0, 3l:0.1, 3l:0.1, 3l:0.1, 3l:0.5, 3l:0.5, 3l:0.5, 3l:1, 3l:1, 3l:1.5, 3l:2, 3l:2, 3l:3');
    }
}