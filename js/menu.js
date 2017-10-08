

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
}

function highlightIndex(index) {
    menuArrow.y = 200 + index * 24 + 12;
}

function addMenuItem(text, items, callback) {
    var fontSize = 24;

    var label = game.add.text(200, 200 + items.children.length * fontSize, text, { font: fontSize + 'px Arial', fill: '#fff'})
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

CoopCommander.Menu = {init: init, preload: preload, create: create};