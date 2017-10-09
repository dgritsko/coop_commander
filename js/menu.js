

function init(args) {
    CoopCommander.Menu.args = args;
}

function preload() {
   
}

function create() {
    game.camera.flash(0x000000, 250);

    var args = CoopCommander.Menu.args;

    menuItems = game.add.group();

    addMenuItem('Start', menuItems, function() {
        startGame();
    });

    addMenuItem('Help', menuItems, function() {

    });

    menuArrow = game.add.sprite(200 - 24, 0, 'menu_arrow');
    menuArrow.anchor.setTo(0.5, 0.5);

    selectedIndex = 0

    upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    upKey.onDown.add(function() { 
        selectedIndex = selectedIndex == 0 ? menuItems.children.length - 1 : selectedIndex-1;
        highlightIndex(selectedIndex) 
    }, this);

    downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    downKey.onDown.add(function() { 
        selectedIndex = selectedIndex < menuItems.children.length - 1 ? selectedIndex+1 : 0;
        highlightIndex(selectedIndex) 
    }, this);

    enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    enterKey.onDown.add(function() { 
        menuItems.children[selectedIndex].events.onInputUp.dispatch();
    }, this);

    highlightIndex(selectedIndex);

    showQuote();
}

function highlightIndex(index) {
    menuArrow.y = 200 + index * 24 + 12;
}

function addMenuItem(text, items, callback) {
    var fontSize = 28;

    var label = game.add.bitmapText(200, 200 + items.children.length * fontSize, 'blackOpsOne', text, 28);

    label.inputEnabled = true;
    label.events.onInputUp.add(callback);

    items.add(label);
}

function startGame() {
    //game.music.stop();    
    game.camera.fade('#000000', 250);
    game.camera.onFadeComplete.add(function() { 
        game.state.start('Game');//, true, false, {});        
    }, this);
}

function showQuote() {
    var quoteTexts = [
        'You all know I run traps all the time to try to keep the rodents down around the chickens.',
        'I tried a new strategy last night. Guess how many rodents we caught?',
        'When I was young, and even into adulthood, the critter I most feared was a rat.',
        'My fear of rats was pretty high. I saw them from time to time in a stream behind \nour house as a child - and they freaked me out.',
        'Well. Like batman over coming his greatest fear. I overcame mine. \nAnd although they are a huge nuisance they no longer freak me out.',
        'I learned a few years ago that mammals, like raccoons, skunks, etc. live where \nthere is water, food and shelter. They also learn where food is as each season changes.',
        'We created my science experiment because the cat food kept getting left out on the \nporch and so I started trapping and moving possums, raccoons, etc. far away. \nThat said, we had several generations of critters that kept looking for food on our porch.',
        'The rats are the same. They need food water and shelter - and \nwe kind of have the perfect thing for them in the duck and chicken pen.',
        'Although rats are everywhere. You rarely see them. You all have them also. But back to here.',
        'We only started to notice them a little over 2 years ago. But for sure we had them all \nalong but weren\'t realizing it.',
        'So I started trapping them. Started doing a much better job with the food, etc. But \n that said. We were way behind the 8 ball.',
        'It took me really like a year or two to learn not just to trap, but how to trap, \nwhich traps worked better, where to put a trap. It took time to learn all this.',
        'Just so you know. You could think of the driveway as like a forcefield. The rats \nhave never crossed it to my knowledge. And that is because of the cats. \nThey are deadly effective on rats.',
        'Last night I tried a new method. We caught 23',
        'I will try the new method again tonight. I was shocked to see how well it worked. \nNormally bigger rats are really smart. But they were not smart at all last night',
        'I think we did serious damage to them last night.',
        'A friend of mine who is kind of "Bill Nye the Science Guy"-ish said that an acre usually \nsupports 35 rodents on average.',
        'Just also to those weak at heart. They are nocturnal. You really don\'t see them- almost\n never in the day.',
        'Always. And I mean always. I put the dead rats in a certain spot in the yard. \nAnd they always disappear.',
        'Pardon my analogy but rats are like Starbucks in the animal world.',
        'Many larger mammals and birds of prey feed on them. At 9 am there were 23. \nGuess how many are already gone. My guess is to hawks or vultures.',
        'I won\'t get into how they went from being alive to dead.',
        'I\'ll update more later. I am leading a tour at 10am. Pray it goes well. \nTell Cait I\'ll get back on her email today'
    ];

    // TODO: Dynamic message that lists how many were caught during the previous night?

    var index = Math.floor(Math.random() * quoteTexts.length);

    var quoteText = quoteTexts[index];

    quoteText = '"' + quoteText + '"\n         - Papa G';
    
    game.add.bitmapText(150, 450, 'blackOpsOne', quoteText, 28);
}

CoopCommander.Menu = {init: init, preload: preload, create: create};