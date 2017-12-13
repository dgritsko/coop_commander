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
    FLASHLIGHT: 20
};

MusicEvents = {
    MAIN_MENU: 0,
    GAME_START: 1
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
    this.fxEating = setupSound(this, 'eating00');
    this.fxBang = setupSound(this, 'bang00');
    this.fxBang.allowMultiple = true;

    this.fxSmack = setupSound(this, 'smack00');
    this.fxScream = setupSound(this, 'scream00');
    this.fxChomp00 = setupSound(this, 'chomp00');
    this.fxChomp01 = setupSound(this, 'chomp01', 0.5);
    this.fxSuccess = setupSound(this, 'success00');
    this.fxError00 = setupSound(this, 'error00');
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
}

AudioManager.prototype.setupMusic = function() {
    this.menuMusic = game.add.sound('music00');
    this.menuMusic.volume = 0.1;
    this.menuMusic.loop = true;
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
    }
}

AudioManager.prototype.playMusic = function(id) {
    switch (id) {
        case MusicEvents.MAIN_MENU:
            if (!this.menuMusic.isPlaying) {
                this.menuMusic.play();
            }
            break;
        case MusicEvents.GAME_START:
            this.menuMusic.stop();
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