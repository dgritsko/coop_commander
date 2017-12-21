class LevelInfo {
    constructor(level) {
        this.level = level;
        this.rats = [];
    }
}

LevelInfo.prototype.add = function(toAdd, speed) {
    var items = [];

    if (typeof(toAdd) == 'string') {
        items = items.concat(GameLevels.splitCsv(toAdd));
    } else if (Array.isArray(toAdd)) {
        items = items.concat(toAdd);
    } else {
        console.error('LevelInfo.add: parameter not supported:', toAdd);
    }

    var parsedItems = GameLevels.parseLevel(items);

    if (typeof(speed) == 'undefined') {
        GameLevels.setSpeeds(parsedItems, this.level)
    } else {
        parsedItems.forEach(function(i) { 
            i.speed = speed;
        });
    }

    this.rats = this.rats.concat(parsedItems);

    return this;
}


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

    static random(types, startTime, interval, total) {
        var result = [];
        
        for (var i = 0; i < total; i++) {
            var t = startTime + interval * i;

            var type = Phaser.ArrayUtils.getRandomItem(types);

            result.push(type +  ':' + t);
        }

        return result;
    }

    static vFormation(types, startY, size, startTime, interval, total) {
        return _.flatten([
            GameLevels.linearWave(types, startY, startY - size, startTime, interval, total / 2),
            GameLevels.linearWave(types, startY, startY + size, startTime, interval, total / 2)
        ]);
    }

    static create(level) {
        var small = ['1s', '2s', '3s'];
        var medium = ['1m', '2m', '3m'];
        var large = ['1l', '2l', '3l'];
        var class1 = ['1s', '1m', '1l'];
        var class2 = ['2s', '2m', '2l'];
        var class3 = ['3s', '3m', '3l'];
        var all = _.flatten([small, medium, large]);

        // Example of linear wave:
        //return GameLevels.parseLevel(GameLevels.linearWave(['3s'], 0.5, 0, 1, 0.1, 10));

        // Example of sine wave:
        //return GameLevels.parseLevel(GameLevels.sineWave(['1l'], 0.5, 0.3, 1, 0.2, 100));

        // Example of cluster:
        //return GameLevels.parseLevel(GameLevels.cluster(['1s', '2s'], 0.7, 0.1, 1, 0.1, 10));

        // Example of stream:
        //return GameLevels.parseLevel(GameLevels.stream(['2s'], 0.5, 0.5, 1, 0.1, 50));

        // Example of random:
        //return GameLevels.parseLevel(GameLevels.random(['2s'], 1, 0.5, 10));

        // Example of "V" formation:
        //return GameLevels.parseLevel(GameLevels.vFormation(['3s'], 0.5, 0.2, 1, 0.1, 10));

        var levelInfo = new LevelInfo(level);

        if (level == 1) {
            levelInfo
                .add(GameLevels.cluster(['1s'], Math.random(), 0.1, 1, 0.25, 10))
                .add(GameLevels.cluster(['1m'], Math.random(), 0.1, 7, 0.25, 10))
                .add(GameLevels.cluster(['1s'], Math.random(), 0.1, 10, 0.2, 10))
                .add(GameLevels.random(['1l'], 12, 0.5, 5), 2)
        } else if (level == 2) {
            levelInfo
                .add(GameLevels.random(['1s'], 1, 0.25, 15))
                .add(GameLevels.random(['1m'], 7, 0.25, 10))
                .add(GameLevels.stream(['1l'], 0.5, 0.3, 5, 0.5, 10), 2.1)
        } else if (level == 3) { 
            levelInfo
                .add(GameLevels.vFormation(['1s'], 0.5, 0.5, 1, 1, 20))
                .add(GameLevels.vFormation(['1m'], 0.5, 0.25, 7, 0.5, 10))
                .add('1l:10:0.5')
        } else if (level == 4) {
            levelInfo  
                .add(GameLevels.linearWave(class1, 0, 1, 1, 0.15, 20))
                .add(GameLevels.cluster(['2s'], Math.random(), 0.1, 5, 0.4, 10), 1.8)
                .add(GameLevels.cluster(['2m'], Math.random(), 0.1, 7, 0.3, 5), 2.3)
                .add('2l:10', 2.5)
        } else if (level == 5) {
            levelInfo
                .add(GameLevels.random(class1, 1, 0.5, 30))
                .add(GameLevels.random(['2s'], 5, 1, 10))
                .add(GameLevels.random(['2m'], 11, 0.7, 10), 2.2)
                .add(GameLevels.random(['2l'], 14, 0.5, 5), 2.6)
        } else if (level == 6) {
            levelInfo
                .add(GameLevels.random(['3s'], 5, .8, 20), 2.5)
                .add(GameLevels.random(['3m'], 10, 1.4, 10), 2.7)
                .add(GameLevels.random(['3l'], 14, 1.2, 10), 3.1)
        } else if (level == 7) {
            levelInfo
                .add(GameLevels.sineWave(['2m'], 0.2, 0.2, 1, 0.25, 20))
                .add(GameLevels.sineWave(['2m'], 0.8, 0.2, 1, 0.25, 20))
                .add(GameLevels.linearWave(['1s'], 1, 0, 5, 0.5, 10))
                .add(GameLevels.linearWave(['1s'], 0, 1, 5, 0.5, 10))
                .add(GameLevels.stream(large, 0.5, 0.5, 10, 0.5, 10), 3.2)
        } else {
            levelInfo
                .add(GameLevels.cluster(all, 0.5, 0.5, 0.5, 0.5, level * 5));
        }

        return levelInfo;
    }

    static setSpeeds(results, level) {
        results.forEach(function(r) {
            r.speed = GameLevels.getSpeed(r.class, r.size, level);
        });
    }

    static getSpeed(ratClass, ratSize, level) {
        var baseSpeed = 0.5;
        
        var levelSpeed = level / 3;

        var classSpeed = 0;

        switch (ratClass) {
            case 1:
                classSpeed = 0.1;
                break;
            case 2:
                classSpeed = 0.2;
                break;
            case 3:
                classSpeed = 0.3;
                break;
        }

        var sizeSpeed = 0;

        switch (ratSize) {
            case 'small':
                sizeSpeed = 0.05;
                break;
            case 'medium':
                sizeSpeed = 0.1;
                break;
            case 'large':
                sizeSpeed = 0.15;
                break;
        }

        return baseSpeed + levelSpeed + classSpeed + sizeSpeed;
    }
}