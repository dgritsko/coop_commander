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

    static parseLevel(raw) {
        var components = raw.split(/,| /);

        var result = _.filter(components, function(e) { return e.trim(); });

        var parsed = _.map(result, function(p) {
            var parts = p.split(':');

            var c = p[0];
            var s = p[1];
            var t = parts[1];

            return {
                'class': parseInt(c, 10),
                'size': GameLevels.parseSize(s),
                'spawn': parseFloat(t)
            };
        });

        return parsed;
    }

    static level(num) {
        var levelIndex = num - 1;

        var initialLevels = [
            '1s:1, 1s:1.2, 1s:3',
            '1s:1, 1s:1, 1m:3, 1m:3, 1s:3, 1m:7, 1s:8'
        ];

        if (levelIndex <= initialLevels.length) {
            return GameLevels.parseLevel(initialLevels[levelIndex]);
        }

        
    }
}