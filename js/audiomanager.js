AudioEvents = {
    LEVEL_COMPLETE: 0,
    GARBAGE_TRUCK: 1,
    GARBAGE_TRUCK_SMASH: 2,
    BONUS_REPORT: 3,
    CHOMP: 4,
    UFO: 5,
    UFO_BEAM: 6,
    VULTURE: 7,
    FOX: 8
};

class AudioManager {
    constructor(game) {
        this.game = game;
        this.muted = false;

        this.setupSounds();
    }
}

AudioManager.prototype.setupSounds = function() {
    var setupSound = function(that, cacheName, volume) {
        var sound = that.game.add.sound(cacheName);
        if (volume) {
            sound.volume = volume;
        }
        return sound;
    };

    this.fxWhoosh = setupSound(this, 'whoosh00');
    this.fxClick = setupSound(this, 'click00');
    this.fxFootsteps = setupSound(this, 'footsteps00');
    this.fxSqueak = setupSound(this, 'squeak00');
    this.fxSquawk = setupSound(this, 'squawk00', 0.5);
    this.fxCluck = setupSound(this, 'cluck00');
    this.fxEating = setupSound(this, 'eating00');
    this.fxBang = setupSound(this, 'bang00');
    this.fxSmack = setupSound(this, 'smack00');
    this.fxScream = setupSound(this, 'scream00');
    this.fxChomp00 = setupSound(this, 'chomp00');
    this.fxChomp01 = setupSound(this, 'chomp01', 0.5);
    this.fxSuccess = setupSound(this, 'success00');
    this.fxError00 = setupSound(this, 'error00');
    this.fxError01 = setupSound(this, 'error01');
    this.fxPop00 = setupSound(this, 'pop00');
    this.fxPop01 = setupSound(this, 'pop01');
    this.fxReload = setupSound(this, 'reload00');
    this.fxPunch00 = setupSound(this, 'punch00');
    this.fxPunch00.allowMultiple = true;

    this.fxPunch01 = setupSound(this, 'punch01');
    this.fxPunch02 = setupSound(this, 'punch02');
    this.fxEngine = setupSound(this, 'engine00');
    this.fxZap00 = setupSound(this, 'zap00', 0.3);
    this.fxZap01 = setupSound(this, 'zap01');
    this.fxThrum = setupSound(this, 'thrum00');
    this.fxSmash = setupSound(this, 'smash00', 0.5);
    this.fxFoxSay = setupSound(this, 'foxsay');
}

AudioManager.prototype.toggleMute = function() {
    this.muted = !this.muted;

    console.log('muted:', this.muted);
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
    }
}