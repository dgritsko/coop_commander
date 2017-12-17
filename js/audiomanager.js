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
    STORE_ERROR: 17,
    STORE_DONE: 18,
    MENU_CLICK: 19,
    FLASHLIGHT: 20,
    NO_FLASHLIGHTS: 21,
    POWERUP_SPAWN: 22,
    POWERUP_EGG_PICKUP: 23,
    POWERUP_BOOTS_PICKUP: 24,
    POWERUP_MONEY_PICKUP: 25,
    POWERUP_FLASHLIGHT_PICKUP: 26,
    CHICKEN_CLUCK: 27,
    RAT_POISONED: 28,
    WOODEN_TRAP_CLOSED: 29,
    SNAP_TRAP_CLOSED: 30,
    HUMANE_TRAP_CLOSED: 31,
    MEOW: 32,
    JOHN_KILL_RAT: 33
};

MusicEvents = {
    MAIN_MENU: 0,
    GAME_START: 1,
    INTRO_START: 2
}

class AudioManager {
    constructor(game) {
        this.game = game;
        this.sounds = [];
        this.music = [];

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
    this.fxPunch00 = setupSound(this, 'punch00');
    this.fxPunch00.allowMultiple = true;

    this.fxPunch01 = setupSound(this, 'punch01');
    this.fxPunch02 = setupSound(this, 'punch02');
    this.fxEngine = setupSound(this, 'engine00');
    this.fxZap00 = setupSound(this, 'zap00', 0.3);
    this.fxZap01 = setupSound(this, 'zap01', 0.7);
    this.fxThrum = setupSound(this, 'thrum00');
    this.fxSmash = setupSound(this, 'smash00', 0.5);
    this.fxFoxSay = setupSound(this, 'foxsay');

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
    this.fxSplat01 = setupSound(this, 'splat01');
    this.fxMeow00 = setupSound(this, 'meow00', 0.5);
}

AudioManager.prototype.setupMusic = function() {
    this.menuMusic = game.add.sound('music00');
    this.menuMusic.volume = 0.1;
    this.menuMusic.loop = true;

    this.musicSandman = game.add.sound('sandman');
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
            this.fxBang.play();
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
            this.fxSplat01.play();
            break;
    }
}

AudioManager.prototype.playMusic = function(id) {
    switch (id) {
        case MusicEvents.MAIN_MENU:
            this.musicSandman.stop();
            if (!this.menuMusic.isPlaying) {
                this.menuMusic.play();
            }

            this.currentMusic = this.menuMusic;
            break;
        case MusicEvents.GAME_START:
            this.menuMusic.stop();

            break;
        case MusicEvents.INTRO_START:
            this.menuMusic.stop();
            if (!this.musicSandman.isPlaying) {
                this.musicSandman.play();
            }     
            break;
    }
}

AudioManager.prototype.stopSounds = function() {
    this.sounds.forEach(function(s) {
        s.stop();
    });
}

AudioManager.prototype.stopMusic = function() {
    this.music.forEach(function(m) {
        m.stop();
    });
}