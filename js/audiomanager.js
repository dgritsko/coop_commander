AudioEvents = {
    LEVEL_COMPLETE: 0,
    GARBAGE_TRUCK: 1,
    GARBAGE_TRUCK_SMASH: 2,
    BONUS_REPORT: 3,
    CHOMP: 4,
    UFO: 5,
    UFO_BEAM: 6,
    VULTURE: 7,
    FOX: 8,
    SWING_SHOVEL: 9,
    WALKING: 10,
    STOP_WALKING: 11,
    RAT_SPAWN: 12,
    RAT_HIT: 13,
    SCREAM: 14,
    RAT_EAT: 15,
    PLACE_ITEM: 16,
    SELL_ITEM: 17, 
    STORE_ERROR: 18,
    STORE_DONE: 19,
    MENU_CLICK: 20,
    FLASHLIGHT: 21,
    NO_FLASHLIGHTS: 22,
    POWERUP_SPAWN: 23,
    POWERUP_EGG_PICKUP: 24,
    POWERUP_BOOTS_PICKUP: 25,
    POWERUP_MONEY_PICKUP: 26,
    POWERUP_FLASHLIGHT_PICKUP: 27,
    CHICKEN_CLUCK: 28,
    RAT_POISONED: 29,
    WOODEN_TRAP_CLOSED: 30,
    SNAP_TRAP_CLOSED: 31,
    HUMANE_TRAP_CLOSED: 32,
    MEOW: 33,
    JOHN_KILL_RAT: 34,
    BEAR: 35,
    RACCOON: 36,
    WOODEN_TRAP_RESET: 37,
    SNAP_TRAP_RESET: 38,
    HUMANE_TRAP_RESET: 39
};

MusicEvents = {
    MAIN_MENU: 0,
    INTRO_STARTING: 1,
    GAME_STARTING: 2,
    GAME_ENDING: 3,
    LEVEL_STARTING: 4,
    LEVEL_ENDING: 5,
    CUTSCENE_STARTING: 6,
    CUTSCENE_ENDING: 7,
    SCORE_STARTING: 8,
    SCORE_ENDING: 9,
    STORE_STARTING: 10,
    STORE_ENDING: 11
}

class AudioManager {
    constructor(game) {
        this.game = game;
        this.sounds = [];

        this.setupSounds();
        this.setupMusic();
    }
}

AudioManager.prototype.setupSounds = function() {
    var setupSound = function(that, cacheName, volume) {
        var sound = that.game.add.sound(cacheName);
        if (volume) {
            sound.volume = volume;
        }
        that.sounds.push(sound);
        return sound;
    };

    this.fxWhoosh = setupSound(this, 'whoosh00');
    this.fxWhoosh.allowMultiple = true;

    this.fxClick = setupSound(this, 'click00');
    this.fxFootsteps = setupSound(this, 'footsteps00', 0.2);
    this.fxFootsteps.loop = true;

    this.fxSqueak = setupSound(this, 'squeak00');
    this.fxSquawk = setupSound(this, 'squawk00', 0.5);
    this.fxCluck = setupSound(this, 'cluck00');
    this.fxCluck.allowMultiple = false;

    this.fxEating = setupSound(this, 'eating00');
    this.fxBang = setupSound(this, 'bang00');
    this.fxBang.allowMultiple = true;

    this.fxSmack = setupSound(this, 'smack00');
    this.fxScream = setupSound(this, 'scream00');
    this.fxChomp00 = setupSound(this, 'chomp00');
    this.fxChomp01 = setupSound(this, 'chomp01', 0.5);
    this.fxSuccess = setupSound(this, 'success00');
    this.fxSuccess01 = setupSound(this, 'success01');
    this.fxSuccess02 = setupSound(this, 'success02');
    this.fxSuccess03 = setupSound(this, 'success03');
    this.fxError00 = setupSound(this, 'error00', 0.7);
    this.fxError01 = setupSound(this, 'error01');
    this.fxPop00 = setupSound(this, 'pop00');
    this.fxPop01 = setupSound(this, 'pop01');
    this.fxReload = setupSound(this, 'reload00', 0.5);
    this.fxPunch00 = setupSound(this, 'punch00', 0.7);
    this.fxPunch00.allowMultiple = true;

    this.fxPunch01 = setupSound(this, 'punch01');
    this.fxPunch02 = setupSound(this, 'punch02');
    this.fxEngine = setupSound(this, 'engine00');
    this.fxZap00 = setupSound(this, 'zap00', 0.3);
    this.fxZap01 = setupSound(this, 'zap01', 0.7);
    this.fxThrum = setupSound(this, 'thrum00');
    this.fxSmash = setupSound(this, 'smash00', 0.25);
    this.fxFoxSay = setupSound(this, 'foxsay');

    this.fxFoxSay.onPlay.add(function() {
        if (this.currentMusic) {
            this.currentMusic.sound.fadeTo(250, this.currentMusic.backgroundVolume);
        }

        this.fxFoxSay.onStop.add(function() {
            this.fxFoxSay.onStop.removeAll();
            if (this.currentMusic) {
                this.currentMusic.sound.fadeTo(250, this.currentMusic.mainVolume);
            }
        }, this);
    }, this);

    this.fxAlert = setupSound(this, 'alert00');
    this.fxBonus = setupSound(this, 'bonus00', 0.5);
    this.fxCash = setupSound(this, 'cash');
    this.fxCrunch = setupSound(this, 'crunch00');
    this.fxPowerupSpawn = setupSound(this, 'powerupspawn', 0.7);
    this.fxSnap00 = setupSound(this, 'snap00');
    this.fxSnap01 = setupSound(this, 'snap01');
    this.fxSpeedup00 = setupSound(this, 'speedup00');
    this.fxSpeedup01 = setupSound(this, 'speedup01');
    this.fxSpeedup02 = setupSound(this, 'speedup02');
    this.fxSplat00 = setupSound(this, 'splat00');
    this.fxSplat01 = setupSound(this, 'splat01', 0.7);
    this.fxMeow00 = setupSound(this, 'meow00', 0.5);
    this.fxRoar = setupSound(this, 'roar');
    this.fxRaccoon = setupSound(this, 'raccoon');

    this.fxJohn00 = setupSound(this, 'john00');
    this.fxJohn01 = setupSound(this, 'john01');
    this.fxJohn02 = setupSound(this, 'john02');
    this.fxJohn03 = setupSound(this, 'john03');
    this.fxJohn04 = setupSound(this, 'john04');
    this.fxJohn05 = setupSound(this, 'john05');
    this.fxJohn06 = setupSound(this, 'john06');
    this.fxJohn07 = setupSound(this, 'john07');
    this.fxJohn08 = setupSound(this, 'john08');
    this.fxJohn09 = setupSound(this, 'john09');
}

AudioManager.prototype.setupMusic = function() {
    this.menuMusic = [
        new Track('music00', 0.1, 0.1, true)
    ];
    this.introMusic = [
        new Track('sandman', 0.5, 0.2)
    ];
    this.gameMusic = [
        new Track('africa', 1, 0.5),
        new Track('radioactive', 1, 0.5)
    ];
}

AudioManager.prototype.toggleMute = function() {
    game.sound.mute = !game.sound.mute;
}

AudioManager.prototype.play = function(id) {
    switch (id) {
        case AudioEvents.LEVEL_COMPLETE:
            this.fxSuccess.play();
            break;
        case AudioEvents.GARBAGE_TRUCK:
            this.fxEngine.play();
            break;
        case AudioEvents.GARBAGE_TRUCK_SMASH:
            this.fxSmash.play();
            break;
        case AudioEvents.BONUS_REPORT:
            this.fxPunch00.play();
            break;
        case AudioEvents.CHOMP:
            this.fxChomp01.play();
            break;
        case AudioEvents.UFO:
            this.fxThrum.play();
            break;
        case AudioEvents.UFO_BEAM:
            this.fxZap00.play();
            break;
        case AudioEvents.VULTURE:
            this.fxSquawk.play();
            break;
        case AudioEvents.FOX:
            this.fxFoxSay.play();
            break;
        case AudioEvents.SWING_SHOVEL:
            this.fxWhoosh.play();
            break;
        case AudioEvents.WALKING:
            if (!this.fxFootsteps.isPlaying) {
                this.fxFootsteps.play();
            }
            break;
        case AudioEvents.STOP_WALKING:
            this.fxFootsteps.stop();
            break;
        case AudioEvents.RAT_SPAWN:
            this.fxSqueak.play();
            break;
        case AudioEvents.RAT_HIT:
            //this.fxBang.play();
            this.fxSplat01.play();
            break;
        case AudioEvents.SCREAM:
            this.fxScream.play();
            break;
        case AudioEvents.RAT_EAT:
            this.fxChomp00.play();
            break;
        case AudioEvents.PLACE_ITEM:
            this.fxPop00.play();
            break;
        case AudioEvents.SELL_ITEM:
            this.fxCash.play();
            break;    
        case AudioEvents.STORE_ERROR:
            this.fxError01.play();
            break;
        case AudioEvents.STORE_DONE:
            this.fxReload.play();
            break;
        case AudioEvents.MENU_CLICK:
            this.fxClick.play();
            break;
        case AudioEvents.FLASHLIGHT:
            this.fxZap01.play();
            break;
        case AudioEvents.NO_FLASHLIGHTS:
            this.fxError01.play();
            break;
        case AudioEvents.POWERUP_SPAWN:
            this.fxPowerupSpawn.play();
            break;
        case AudioEvents.POWERUP_EGG_PICKUP:
            this.fxCluck.play();
            break;
        case AudioEvents.POWERUP_BOOTS_PICKUP:
            this.fxSpeedup02.play();
            break;
        case AudioEvents.POWERUP_MONEY_PICKUP:
            this.fxCash.play();
            break;
        case AudioEvents.POWERUP_FLASHLIGHT_PICKUP:
            this.fxBonus.play();
            break;
        case AudioEvents.CHICKEN_CLUCK:
            this.fxCluck.play();
            break;
        case AudioEvents.RAT_POISONED:
            this.fxSplat00.play();
            break;
        case AudioEvents.WOODEN_TRAP_CLOSED:
            this.fxCrunch.play();
            break;
        case AudioEvents.SNAP_TRAP_CLOSED:
            this.fxSnap00.play();
            break;
        case AudioEvents.HUMANE_TRAP_CLOSED:
            this.fxSnap01.play();
            break;
        case AudioEvents.MEOW:
            this.fxMeow00.play();
            break;
        case AudioEvents.JOHN_KILL_RAT:
            Phaser.ArrayUtils.getRandomItem([
                this.fxJohn00,
                this.fxJohn01,
                this.fxJohn02,
                this.fxJohn03,
                this.fxJohn04,
                this.fxJohn05,
                this.fxJohn06,
                this.fxJohn07,
                this.fxJohn08,
                this.fxJohn09
            ]).play();
            this.fxSplat01.play();
            break;
        case AudioEvents.BEAR:
            this.fxRoar.play();
            break;
        case AudioEvents.RACCOON:
            this.fxRaccoon.play();
            break;
        case AudioEvents.WOODEN_TRAP_RESET:
            //this.fxCrunch.play();
            this.fxPop00.play();
            // TODO: Play more appropriate sound here?
            break;
        case AudioEvents.SNAP_TRAP_RESET:
            //this.fxSnap00.play();
            this.fxPop00.play();
            // TODO: Play more appropriate sound here?
            break;
        case AudioEvents.HUMANE_TRAP_RESET:
            //this.fxSnap01.play();
            this.fxPop00.play();
            // TODO: Play more appropriate sound here?
            break;
    }
}

AudioManager.prototype.playMusic = function(id, level) {
    var that = this;
    function stopCurrentMusic() {
        if (that.currentMusic) {
            var previousMusic = that.currentMusic;
            previousMusic.sound.fadeOut(250);
        }
    }

    function startCurrentMusic(music) {
        if (that.currentMusic == music && that.currentMusic.sound.isPlaying) {
            return;
        }

        that.currentMusic = music;
        that.currentMusic.sound.play();
    }

    switch (id) {
        case MusicEvents.MAIN_MENU:
            stopCurrentMusic();
            startCurrentMusic(Phaser.ArrayUtils.getRandomItem(this.menuMusic));
            break;
        case MusicEvents.INTRO_STARTING:
            stopCurrentMusic();
            startCurrentMusic(Phaser.ArrayUtils.getRandomItem(this.introMusic));
            break;
        case MusicEvents.GAME_STARTING:
            stopCurrentMusic();
            game.time.events.add(250, function() {
                startCurrentMusic(Phaser.ArrayUtils.getRandomItem(this.gameMusic));
            }, this);
            break;
        case MusicEvents.GAME_ENDING:
            if (this.currentMusic) {
                this.currentMusic.sound.fadeOut(250);
            }
            break;
        case MusicEvents.LEVEL_STARTING:
            break;
        case MusicEvents.LEVEL_ENDING:
            break;
        case MusicEvents.CUTSCENE_STARTING: 
            this.currentMusic.sound.fadeTo(250, this.currentMusic.backgroundVolume);
            break;
        case MusicEvents.CUTSCENE_ENDING:
            this.currentMusic.sound.fadeTo(250, this.currentMusic.mainVolume);
            break;
        case MusicEvents.SCORE_STARTING:
            // TODO: Start death music
            break;
        case MusicEvents.SCORE_ENDING:
            // TODO: End death music?
            break;
        case MusicEvents.STORE_STARTING: 
            break;
        case MusicEvents.STORE_ENDING:
            break;
    }
}

AudioManager.prototype.stopSounds = function() {
    this.sounds.forEach(function(s) {
        s.stop();
    });
}

class Track {
    constructor(key, mainVolume, backgroundVolume, loop) {
        this.key = key;
        this.sound = game.add.sound(key);
        this.sound.loop = loop || false;
        this.sound.volume = mainVolume;
        this.mainVolume = mainVolume;
        this.backgroundVolume = backgroundVolume;
        //this.playUntil = playUntil || -1;
    }
}