let data = "Results: \n"
// =============================================================================
// Sprites
// =============================================================================

//
// Hero
//

function Hero(game, x, y) {
    // call Phaser.Sprite constructor
    Phaser.Sprite.call(this, game, x, y, 'hero');

    // anchor
    this.anchor.set(0.5, 0.5);
    // physics properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    // animations
    this.animations.add('stop', [0]);
    this.animations.add('run', [1, 2], 8, true); // 8fps looped
    this.animations.add('jump', [3]);
    this.animations.add('fall', [4]);
    this.animations.add('die', [5, 6, 5, 6, 5, 6, 5, 6], 12); // 12fps no loop
    // starting animation
    this.animations.play('stop');
}

// inherit from Phaser.Sprite
Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.move = function (direction) {
    // guard
    if (this.isFrozen) { return; }

    const SPEED = 200;
    this.body.velocity.x = direction * SPEED;

    // update image flipping & animations
    if (this.body.velocity.x < 0) {
        this.scale.x = -1;
    }
    else if (this.body.velocity.x > 0) {
        this.scale.x = 1;
    }
};

Hero.prototype.jump = function () {
    const JUMP_SPEED = 400;
    let canJump = this.body.touching.down && this.alive && !this.isFrozen;

    if (canJump || this.isBoosting) {
        this.body.velocity.y = -JUMP_SPEED;
        this.isBoosting = true;
    }

    return canJump;
};

Hero.prototype.stopJumpBoost = function () {
    this.isBoosting = false;
};

Hero.prototype.bounce = function () {
    const BOUNCE_SPEED = 200;
    this.body.velocity.y = -BOUNCE_SPEED;
};

Hero.prototype.update = function () {
    // update sprite animation, if it needs changing
    let animationName = this._getAnimationName();
    if (this.animations.name !== animationName) {
        this.animations.play(animationName);
    }
};

Hero.prototype.freeze = function () {
    this.body.enable = false;
    this.isFrozen = true;
};

Hero.prototype.die = function () {
    this.alive = false;
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

// returns the animation name that should be playing depending on
// current circumstances
Hero.prototype._getAnimationName = function () {
    let name = 'stop'; // default animation

    // dying
    if (!this.alive) {
        name = 'die';
    }
    // frozen & not dying
    else if (this.isFrozen) {
        name = 'stop';
    }
    // jumping
    else if (this.body.velocity.y < 0) {
        name = 'jump';
    }
    // falling
    else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
        name = 'fall';
    }
    else if (this.body.velocity.x !== 0 && this.body.touching.down) {
        name = 'run';
    }

    return name;
};

// Startscreen Text
var startText = "The Jungle View";

var startStyle = { font: "Impact", fontSize: "65px", fill: "#ffa200", stroke: "black", strokeThickness: "1", align: "center" };

//First Mini game text
var firstText = "Vous vous retrouvez face ?? un choix.\nChoisissez la cl?? qui correspond aux ronds que vous percevez les plus noirs.\nPrenez les deux cl??s si vous ne voyez pas de diff??rence.";
var firstStyle = { font: "Impact", fontSize: "19px", fill: "#ffa200", align: "center", backgroundColor: "rgba(0,0,0,0.7)", wordWrapWidth: "200" };

//Second Mini game text
var secondText = "La porte est ferm??e!\nTrouvez le bon code pour obtenir la cl??!.";
var secondStyle = { font: "Impact", fontSize: "25px", fill: "#ffa200", align: "center", backgroundColor: "rgba(0,0,0,0.7)", wordWrapWidth: "200" };

//Alex
var lastText = "F??licitations, vous avez trouv?? le tr??sor !\n Voici vos r??sultats :\n Score : 340 \n Vous avez choisi la cl?? verte, cela peut ??tre un probl??me de myopie, \n aller conntacter votre ophtalmologue. \n Vous avez trouv?? tous les num??ros du test de daltonisme, f??licitations. \n N'h??sitez pas ?? prendre rendez-vous chez un sp??cialiste afin de confirmer ces resultats.\n Pour plus d'information, vous pouvez consult?? le site d'Essilor. \n N'h??sitez ?? partager votre score avec vos amis";
var lastStyle = { font: "Impact", fontSize: "19px", fill: "#ffa200", align: "center", backgroundColor: "rgba(0,0,0,0.7)", wordWrapWidth: "200" };

//
// Spider (enemy)
//

function Spider(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'spider');

    // anchor
    this.anchor.set(0.5);
    // animation
    this.animations.add('crawl', [0, 1, 2], 8, true);
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
    this.animations.play('crawl');

    // physic properties
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
    this.body.velocity.x = Spider.SPEED;
}

Spider.SPEED = 100;

// inherit from Phaser.Sprite
Spider.prototype = Object.create(Phaser.Sprite.prototype);
Spider.prototype.constructor = Spider;

Spider.prototype.update = function () {
    // check against walls and reverse direction if necessary
    if (this.body.touching.right || this.body.blocked.right) {
        this.body.velocity.x = -Spider.SPEED; // turn left
    }
    else if (this.body.touching.left || this.body.blocked.left) {
        this.body.velocity.x = Spider.SPEED; // turn right
    }
};

Spider.prototype.die = function () {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
        this.kill();
    }, this);
};

// =============================================================================
// Loading state
// =============================================================================

LoadingState = {};

LoadingState.init = function () {
    // keep crispy-looking pixels
    this.game.renderer.renderSession.roundPixels = true;
};

LoadingState.preload = function () {
    this.game.load.json('level:0', 'data/level00.json');
    this.game.load.json('level:1', 'data/level01.json');
    this.game.load.json('level:2', 'data/level02.json');
    this.game.load.json('level:3', 'data/level03.json');
    this.game.load.json('level:4', 'data/level04.json');
    this.game.load.json('level:5', 'data/level05.json');



    this.game.load.image('font:numbers', 'images/numbers.png');

    this.game.load.image('icon:coin', 'images/coin_icon.png');

    //loading backgrounds
    this.game.load.image('background0', 'images/background_0.png');
    this.game.load.image('background1', 'images/background_1.png');
    this.game.load.image('background2', 'images/background_2.png');
    this.game.load.image('background3', 'images/background_3.png');
    this.game.load.image('background4', 'images/background.png');

    //loading first game element
    this.game.load.image('game1', 'images/game_1.png');

    //loading buttons for second game element
    this.game.load.image('game2Button1-1', 'images/game_2_Button_1_1.png');
    this.game.load.image('game2Button1-2', 'images/game_2_Button_1_2.png');
    this.game.load.image('game2Button1-3', 'images/game_2_Button_1_3.png');

    this.game.load.image('game2Button2-1', 'images/game_2_Button_2_1.png');
    this.game.load.image('game2Button2-2', 'images/game_2_Button_2_2.png');
    this.game.load.image('game2Button2-3', 'images/game_2_Button_2_3.png');

    this.game.load.image('game2Button3-1', 'images/game_2_Button_3_1.png');
    this.game.load.image('game2Button3-2', 'images/game_2_Button_3_2.png');
    this.game.load.image('game2Button3-3', 'images/game_2_Button_3_3.png');

    //loading pressed buttons for second gam element

    this.game.load.image('game2Button1-1-down', 'images/game_2_Button_1_1_down.png');
    this.game.load.image('game2Button1-2-down', 'images/game_2_Button_1_2_down.png');
    this.game.load.image('game2Button1-3-down', 'images/game_2_Button_1_3_down.png');

    this.game.load.image('game2Button2-1-down', 'images/game_2_Button_2_1_down.png');
    this.game.load.image('game2Button2-2-down', 'images/game_2_Button_2_2_down.png');
    this.game.load.image('game2Button2-3-down', 'images/game_2_Button_1_3_down.png');

    this.game.load.image('game2Button3-1-down', 'images/game_2_Button_3_1_down.png');
    this.game.load.image('game2Button3-2-down', 'images/game_2_Button_2_2_down.png');
    this.game.load.image('game2Button3-3-down', 'images/game_2_Button_1_3_down.png');

    //loading images for second game element
    this.game.load.image('game2_test1', 'images/game_2_test_1.png');
    this.game.load.image('game2_test2', 'images/game_2_test_2.png');
    this.game.load.image('game2_test3', 'images/game_2_test_3.png');

    this.game.load.image('game2_background', 'images/test_background.png')


    this.game.load.image('invisible-wall', 'images/invisible_wall.png');
    this.game.load.image('ground', 'images/ground.png');
    this.game.load.image('grass:8x1', 'images/grass_8x1.png');
    this.game.load.image('grass:6x1', 'images/grass_6x1.png');
    this.game.load.image('grass:4x1', 'images/grass_4x1.png');
    this.game.load.image('grass:2x1', 'images/grass_2x1.png');
    this.game.load.image('grass:1x1', 'images/grass_1x1.png');
    this.game.load.image('key', 'images/key.png');
    this.game.load.image('key_grey', 'images/key_grey.png');

    this.game.load.image('chest-open', 'images/coffre_ouvert_resize.png', 42, 66);
    this.game.load.image('chest', 'images/coffre_ferme_resize.png', 42, 66);



    this.game.load.spritesheet('decoration', 'images/decor.png', 42, 42);
    this.game.load.spritesheet('hero', 'images/hero.png', 36, 42);
    this.game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);
    this.game.load.spritesheet('spider', 'images/spider.png', 42, 32);
    this.game.load.spritesheet('door', 'images/door.png', 42, 66);
    //this.game.load.spritesheet('chest', 'images/coffre_ouvert_resize.png', 42, 66);
    this.game.load.spritesheet('icon:key', 'images/key_icon.png', 34, 30);

    this.game.load.audio('sfx:jump', 'audio/jump.wav');
    this.game.load.audio('sfx:coin', 'audio/coin.wav');
    this.game.load.audio('sfx:key', 'audio/key.wav');
    this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
    this.game.load.audio('sfx:door', 'audio/door.wav');
    this.game.load.audio('bgm', ['audio/bgm.mp3', 'audio/bgm.ogg']);
};

//Checks for stats (Yes we know this code is getting really disgusting. We are sorry ????)
keyGreenPicked = false;
keyRedPicked = false;

game2Q1Correct = false;
game2Q2Correct = false;
game2Q3Correct = false;

game2Q1Clicked = false;
game2Q2Clicked = false;
game2Q3Clicked = false;



LoadingState.create = function () {
    this.game.state.start('play', true, false, { level: 0 });
};

// =============================================================================
// Play state
// =============================================================================

PlayState = {};

const LEVEL_COUNT = 6;

PlayState.init = function (data) {
    this.keys = this.game.input.keyboard.addKeys({
        left: Phaser.KeyCode.LEFT,
        right: Phaser.KeyCode.RIGHT,
        up: Phaser.KeyCode.UP
    });

    this.coinPickupCount = 0;
    this.hasKey = false;
    this.level = (data.level || 0) % LEVEL_COUNT;
};

PlayState.create = function () {
    // fade in (from black)
    this.camera.flash('#000000');

    // create sound entities
    this.sfx = {
        jump: this.game.add.audio('sfx:jump'),
        coin: this.game.add.audio('sfx:coin'),
        key: this.game.add.audio('sfx:key'),
        stomp: this.game.add.audio('sfx:stomp'),
        door: this.game.add.audio('sfx:door')
    };
    this.bgm = this.game.add.audio('bgm');
    this.bgm.loopFull();

    // create level entities and decoration
    this.game.add.image(0, 0, `background${this.level}`);
    this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));
    console.log(this.level);

    // create UI score boards
    this._createHud();
};

PlayState.update = function () {
    this._handleCollisions();
    this._handleInput();

    // update scoreboards
    this.coinFont.text = `x${this.coinPickupCount}`;
    this.keyIcon.frame = this.hasKey ? 1 : 0;
};

PlayState.shutdown = function () {
    this.bgm.stop();
};

PlayState._handleCollisions = function () {
    this.game.physics.arcade.collide(this.spiders, this.platforms);
    this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
    this.game.physics.arcade.collide(this.hero, this.platforms);

    // hero vs coins (pick up)
    this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin,
        null, this);
    // hero vs key (pick up)
    if (this.level == 1 && this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey,
        null, this)) {
        data += "Key Red picked";
        console.log("Key Red picked");
        keyRedPicked = true;
    }
    if (this.level == 1 && this.game.physics.arcade.overlap(this.hero, this.key_grey, this._onHeroVsKey,
        null, this)) {
        data += "Key Green picked";
        console.log("Key Green picked");
        keyGreenPicked = true;

    }
    else {
        this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey,
            null, this);
    }

    // hero vs door (end level)
    this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
        // ignore if there is no key or the player is on air
        function (hero, door) {
            return this.hasKey && hero.body.touching.down;
        }, this);


    //Alex 
    this.game.physics.arcade.overlap(this.hero, this.chest, this._onHeroVsChest,
        // ignore if there is no key or the player is on air
        function (hero, chest) {
            return this.hasKey && hero.body.touching.down;
        }, this);

    // collision: hero vs enemies (kill or die)
    this.game.physics.arcade.overlap(this.hero, this.spiders,
        this._onHeroVsEnemy, null, this);
};

PlayState._handleInput = function () {
    if (this.keys.left.isDown) { // move hero left
        this.hero.move(-1);
    }
    else if (this.keys.right.isDown) { // move hero right
        this.hero.move(1);
    }
    else { // stop
        this.hero.move(0);
    }

    // handle jump
    const JUMP_HOLD = 200; // ms
    if (this.keys.up.downDuration(JUMP_HOLD)) {
        let didJump = this.hero.jump();
        if (didJump) { this.sfx.jump.play(); }
    }
    else {
        this.hero.stopJumpBoost();
    }
};

PlayState._onHeroVsKey = function (hero, key) {
    this.sfx.key.play();
    key.kill();
    this.hasKey = true;
};

PlayState._onHeroVsCoin = function (hero, coin) {
    this.sfx.coin.play();
    coin.kill();
    this.coinPickupCount++;
};

PlayState._onHeroVsEnemy = function (hero, enemy) {
    // the hero can kill enemies when is falling (after a jump, or a fall)
    if (hero.body.velocity.y > 0) {
        enemy.die();
        hero.bounce();
        this.sfx.stomp.play();
    }
    else { // game over -> play dying animation and restart the game
        hero.die();
        this.sfx.stomp.play();
        hero.events.onKilled.addOnce(function () {
            this.game.state.restart(true, false, { level: this.level });
        }, this);

        // NOTE: bug in phaser in which it modifies 'touching' when
        // checking for overlaps. This undoes that change so spiders don't
        // 'bounce' agains the hero
        enemy.body.touching = enemy.body.wasTouching;
    }
};

PlayState._onHeroVsDoor = function (hero, door) {
    // 'open' the door by changing its graphic and playing a sfx
    door.frame = 1;
    this.sfx.door.play();

    // play 'enter door' animation and change to the next level when it ends
    hero.freeze();
    this.game.add.tween(hero)
        .to({ x: this.door.x, alpha: 0 }, 500, null, true)
        .onComplete.addOnce(this._goToNextLevel, this);
};

//Alex
PlayState._onHeroVsChest = function (hero, chest) {
    // 'open' the chest by changing its graphic and playing a sfx
    //chest.frame = 1;
    chest.loadTexture('chest-open');

    // play 'enter door' animation and change to the next level when it ends
    hero.freeze();
    this.game.add.tween(hero)
        .to({ x: this.chest.x, alpha: 0 }, 500, null, true)
        .onComplete.addOnce(this._goToNextLevel, this);
};

PlayState._goToNextLevel = function () {
    this.camera.fade('#000000');
    this.camera.onFadeComplete.addOnce(function () {
        // change to next level
        this.game.state.restart(true, false, {
            level: this.level + 1
        });
    }, this);
};

PlayState._loadLevel = function (data) {
    //First game element (needs to be first to be in the background)
    if (this.level == 1) { this.game.add.image(245, 80, 'game1') }

    // create all the groups/layers that we need
    this.bgDecoration = this.game.add.group();
    this.platforms = this.game.add.group();
    this.coins = this.game.add.group();
    this.spiders = this.game.add.group();
    this.enemyWalls = this.game.add.group();
    this.enemyWalls.visible = false;

    //Level 3 render
    if (this.level == 3) {
        //test 1 buttons
        button11 = this.game.add.button(235, 300, 'game2Button1-1', buttonClick(), this);
        button11.onInputDown.add(() => down(1, 1, button11, data, this), this);
        button12 = this.game.add.button(285, 300, 'game2Button1-2', buttonClick(), this);
        button12.onInputDown.add(() => down(1, 2, button12, data, this), this);
        button13 = this.game.add.button(335, 300, 'game2Button1-3', buttonClick(), this);
        button13.onInputDown.add(() => down(1, 3, button13, data, this), this);

        //test 2 buttons
        button21 = this.game.add.button(435, 300, 'game2Button2-1', buttonClick(), this);
        button21.onInputDown.add(() => down(2, 1, button21, data, this), this);
        button22 = this.game.add.button(485, 300, 'game2Button2-2', buttonClick(), this);
        button22.onInputDown.add(() => down(2, 2, button22, data, this), this);
        button23 = this.game.add.button(535, 300, 'game2Button2-3', buttonClick(), this);
        button23.onInputDown.add(() => down(2, 3, button23, data, this), this);

        //test 3 buttons
        button31 = this.game.add.button(635, 300, 'game2Button3-1', buttonClick(), this);
        button31.onInputDown.add(() => down(3, 1, button31, data, this), this);
        button32 = this.game.add.button(685, 300, 'game2Button3-2', buttonClick(), this);
        button32.onInputDown.add(() => down(3, 2, button32, data, this), this);
        button33 = this.game.add.button(735, 300, 'game2Button3-3', buttonClick(), this);
        button33.onInputDown.add(() => down(3, 3, button33, data, this), this);

        //background
        this.game.add.image(210, 110, 'game2_background');
        this.game.add.image(410, 110, 'game2_background');
        this.game.add.image(610, 110, 'game2_background');

        //tests
        this.game.add.image(200, 100, 'game2_test1');
        this.game.add.image(400, 100, 'game2_test2');
        this.game.add.image(600, 100, 'game2_test3');




    }

    //Welcome text on first level
    if (this.level == 0) { this.startText = this.game.add.text(270, 50, startText, startStyle); }

    //Text on first Minigame
    if (this.level == 1) { this.firstText = this.game.add.text(200, 0, firstText, firstStyle); }

    //Text on second minigame
    if(this.level == 3) { this.secondText = this.game.add.text(300,20, secondText, secondStyle);}

    // spawn hero and enemies
    this._spawnCharacters({ hero: data.hero, spiders: data.spiders });

    // spawn level decoration
    data.decoration.forEach(function (deco) {
        this.bgDecoration.add(
            this.game.add.image(deco.x, deco.y, 'decoration', deco.frame));
    }, this);

    // spawn platforms
    data.platforms.forEach(this._spawnPlatform, this);

    // spawn important objects
    data.coins.forEach(this._spawnCoin, this);
    if (this.level == 1) {
        this._spawnKey(data.key.x, data.key.y, 'key_grey');
        this._spawnKey2(data.key_grey.x, data.key_grey.y, 'key_grey');
    } else {
        if (this.level != 3) {
            this._spawnKey(data.key.x, data.key.y, 'key'); ``
        }
    }


    //Alex
    if (this.level == 4) {
        this._spawnChest(data.chest.x, data.chest.y);
    } else {
        this._spawnDoor(data.door.x, data.door.y);
    }

    if (this.level == 5) {
        var textcouleur = "";
        var textDalt = "";
        var score = 0;

        if (keyGreenPicked && !keyRedPicked) {
            textcouleur = "Vous avez choisi la cl?? verte, cela peut ??tre un probl??me de myopie, \n aller conntacter votre ophtalmologue.";
        } else if (!keyGreenPicked && keyRedPicked) {
            textcouleur = "Vous avez choisi la cl?? rouge, cela peut ??tre un probl??me de myopie, \n aller conntacter votre ophtalmologue.";
        } else if (keyGreenPicked && keyRedPicked) {
            score += 50;
            textcouleur = "Bravo ! Vous avez vu qu'il n'y avait pas de diff??rence dans les cercles noirs.";
        }
        if (game2Q1Correct && game2Q2Correct && game2Q3Correct) {
            score += 50;
            textDalt = "Vous avez trouv?? tous les num??ros du test de daltonisme, f??licitations.";
        }
        else {

            textDalt = "Vous n'avez pas trouv?? tous les num??ros du test de daltonisme, \nrapprochez-vous d'un sp??cialiste pour plus d'informations..";
        }
        lastText = "F??licitations, vous avez trouv?? le tr??sor !\n Voici vos r??sultats :\n Score : " + score + " \n " + textcouleur + " \n " + textDalt + "\n N'h??sitez pas ?? prendre rendez-vous chez un sp??cialiste afin de confirmer ces resultats.\n Pour plus d'information, vous pouvez consult?? le site d'Essilor. \n N'h??sitez ?? partager votre score avec vos amis";


        this.lastText = this.game.add.text(150, 150, lastText, lastStyle);
    }



    // enable gravity
    const GRAVITY = 1200;
    this.game.physics.arcade.gravity.y = GRAVITY;
};

PlayState._spawnCharacters = function (data) {
    // spawn spiders
    data.spiders.forEach(function (spider) {
        let sprite = new Spider(this.game, spider.x, spider.y);
        this.spiders.add(sprite);
    }, this);

    // spawn hero
    this.hero = new Hero(this.game, data.hero.x, data.hero.y);
    this.game.add.existing(this.hero);
};

PlayState._spawnPlatform = function (platform) {
    let sprite = this.platforms.create(
        platform.x, platform.y, platform.image);

    // physics for platform sprites
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;
    sprite.body.immovable = true;

    // spawn invisible walls at each side, only detectable by enemies
    this._spawnEnemyWall(platform.x, platform.y, 'left');
    this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};

PlayState._spawnEnemyWall = function (x, y, side) {
    let sprite = this.enemyWalls.create(x, y, 'invisible-wall');
    // anchor and y displacement
    sprite.anchor.set(side === 'left' ? 1 : 0, 1);
    // physic properties
    this.game.physics.enable(sprite);
    sprite.body.immovable = true;
    sprite.body.allowGravity = false;
};

PlayState._spawnCoin = function (coin) {
    let sprite = this.coins.create(coin.x, coin.y, 'coin');
    sprite.anchor.set(0.5, 0.5);

    // physics (so we can detect overlap with the hero)
    this.game.physics.enable(sprite);
    sprite.body.allowGravity = false;

    // animations
    sprite.animations.add('rotate', [0, 1, 2, 1], 6, true); // 6fps, looped
    sprite.animations.play('rotate');
};

PlayState._spawnKey = function (x, y, keyImage) {
    this.key = this.bgDecoration.create(x, y, keyImage);
    this.key.anchor.set(0.5, 0.5);
    // enable physics to detect collisions, so the hero can pick the key up
    this.game.physics.enable(this.key);
    this.key.body.allowGravity = false;

    // add a small 'up & down' animation via a tween
    this.key.y -= 3;
    this.game.add.tween(this.key)
        .to({ y: this.key.y + 6 }, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();
};
PlayState._spawnKey2 = function (x, y, keyImage) {
    this.key_grey = this.bgDecoration.create(x, y, keyImage);
    this.key_grey.anchor.set(0.5, 0.5);
    // enable physics to detect collisions, so the hero can pick the key up
    this.game.physics.enable(this.key_grey);
    this.key_grey.body.allowGravity = false;

    // add a small 'up & down' animation via a tween
    this.key_grey.y -= 3;
    this.game.add.tween(this.key_grey)
        .to({ y: this.key_grey.y + 6 }, 800, Phaser.Easing.Sinusoidal.InOut)
        .yoyo(true)
        .loop()
        .start();
};

PlayState._spawnDoor = function (x, y) {
    this.door = this.bgDecoration.create(x, y, 'door');
    this.door.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.door);
    this.door.body.allowGravity = false;
};

PlayState._spawnChest = function (x, y) {
    this.chest = this.bgDecoration.create(x, y, 'chest');
    this.chest.anchor.setTo(0.5, 1);
    this.game.physics.enable(this.chest);
    this.chest.body.allowGravity = false;
};

PlayState._createHud = function () {
    const NUMBERS_STR = '0123456789X ';
    this.coinFont = this.game.add.retroFont('font:numbers', 20, 26,
        NUMBERS_STR, 6);

    this.keyIcon = this.game.make.image(0, 19, 'icon:key');
    this.keyIcon.anchor.set(0, 0.5);

    let coinIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:coin');
    let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width,
        coinIcon.height / 2, this.coinFont);
    coinScoreImg.anchor.set(0, 0.5);

    this.hud = this.game.add.group();
    this.hud.add(coinIcon);
    this.hud.add(coinScoreImg);
    this.hud.add(this.keyIcon);
    this.hud.position.set(10, 10);
};

//Function is called on button click on lvl 3
//To-Do define correct buttons
function buttonClick() {

}

function down(test, button, buttonObject, data, playstateInstance) {
    buttonObject.loadTexture(`game2Button${test}-${button}-down`);

    if (test == 1) {
        if (button == 2) {
            game2Q1Correct = true;
            console.log("Correct");
        }
        game2Q1Clicked = true;
    }
    else if (test == 2) {
        if (button == 1) {
            game2Q2Correct = true;
            console.log("Correct");

        }
        game2Q2Clicked = true;
    }
    else if (test == 3) {
        if (button == 1) {
            game2Q3Correct = true;
            console.log("Correct");

        }
        game2Q3Clicked = true;
    }
    else {
        console.log("Wait! This is illegal?! ????");
    }

    if (game2Q1Clicked == true && game2Q2Clicked == true && game2Q3Clicked == true) {
        playstateInstance._spawnKey(data.key.x, data.key.y, 'key');
    }
}

// =============================================================================
// entry point
// =============================================================================

window.onload = function () {
    let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
    game.state.add('play', PlayState);
    game.state.add('loading', LoadingState);
    game.state.start('loading');
};
