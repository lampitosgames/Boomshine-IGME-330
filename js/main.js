"use strict";

app.main = {
    canvas: undefined,
    ctx: undefined,
    dt: 0,
    lastTime: 0,
    particles: undefined,
    explosions: undefined,
    cursor: undefined,
    gameState: undefined,
    numCircles: undefined,
    roundScore: 0,
    totalScore: 0,
    animationID: 0,
    debug: true,
    paused: false
};
app.viewport = undefined;
//ENUMS
app.GAME_STATE = Object.freeze({
    BEGIN: 0,
    DEFAULT: 1,
    EXPLODING: 2,
    ROUND_OVER: 3,
    REPEAT_LEVEL: 4,
    END: 5
});
app.CIRCLE = Object.freeze({
    NUM_CIRCLES_START: 0,
    INCREMENT: 20,
    START_RADIUS: 10,
    MAX_RADIUS: 60,
    MIN_RADIUS: 2,
    MAX_LIFETIME: 2.5,
    MAX_SPEED: 500,
    EXPLOSION_SPEED: 90,
    IMPLOSION_SPEED: 120
});

//Script local variables (I mean, they're technically global, but globals are all stored in the app object)
let canvas, ctx, viewport;
let dt;
let particles, explosions;

//Colors for circles
let colors = ["#FD5B78", "#FF6037", "#FF9966", "#66FF66", "#50BFE6", "#FF6EFF", "EE34D2"];

/**
 * Initialization
 */
let init = app.main.init = function() {
    //Prevent additions to the app at this point
    //All properties have already been defined
    Object.seal(app);
    //Store the canvas element
    app.main.canvas = canvas = document.getElementById("canvas");
    //Set initial game state
    app.main.gameState = app.GAME_STATE.BEGIN;
    app.main.numCircles = app.CIRCLE.NUM_CIRCLES_START;

    //Create a cursor object
    app.main.cursor = new Cursor(40, "rgba(255, 255, 255, 0.75)", 5);

    //Bind the mousedown event to the canvas
    canvas.onmousedown = function() {
        //Do nothing if the game has not begun
        if (app.main.gameState == app.GAME_STATE.BEGIN) return;

        //If the game was paused, unpause but do nothing
        if (app.main.paused) {
            togglePause(false);
            return;
        }
        //If the game is already in the exploding state, do nothing
        if (app.main.gameState == app.GAME_STATE.EXPLODING) return;

        //If the round is over, start the next round
        if (app.main.gameState == app.GAME_STATE.ROUND_OVER) {
            //Only progress if the user clicks the button
            let rect = [viewport.width/2 - 300, viewport.height/2 - 25, 600, 50];
            let mouse = app.mouse;
            if (mouse[0] >= rect[0] && mouse[0] <= rect[0] + rect[2] && mouse[1] >= rect[1] && mouse[1] <= rect[1] + rect[3]) {
                app.main.reset();
            }
            return;
        }
        //Play music
        app.audio.startBGAudio();
        //Call the cursor's click logic by default
        app.main.cursor.click();
    }

    document.getElementById("startGame").onmousedown = function() {
        app.main.gameState = app.GAME_STATE.DEFAULT;
        this.style.display = "none";
        //Play music
        app.audio.startBGAudio();
    }

    //Bind keyup for pause/unpause
    window.addEventListener("keyup", function(e) {
        var char = String.fromCharCode(e.keyCode);
        if (char == "p" || char == "P"){ togglePause(!app.main.paused); }
    })

    //Bind resize, then call it as part of initialization
    window.addEventListener('resize', resize);
    resize();

    //Reset the level
    reset();
    //Start the update loop.
    update();
}

/**
 * Main update loop of the game
 */
let update = app.main.update = function() {
    //Request animation frame.  No need for .bind() since everything is written on a global scope.
    //I generally dislike relying on the 'this' keyword because it can introduce really nasty
    //bugs
    app.main.animationID = requestAnimationFrame(app.main.update);

    //Get the delta time
    app.main.dt = dt = calculateDeltaTime();

    //Override everything with a full-size background
    ctx.fillStyle = "#171717";
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    //Draw all particles
    for (var i=0; i<app.main.particles.length; i++) { particles[i].draw(); }
    //Draw all explosions
    for (var i=0; i<explosions.length; i++) { explosions[i].draw(dt); }
    //Draw the game HUD.  This function does its own game state calculations
    drawHUD();

    //If in debug mode, draw debugger things
    if (app.main.debug) {
        //Draw delta time
        app.utils.fillText("dt: " + dt.toFixed(3), viewport.width - 150, viewport.height - 10, "10pt courier", "white");
    }

    //Pause check
    if (app.main.paused) {
        drawPauseScreen();
        return;
    }
    /* UPDATES DON'T HAPPEN IF GAME IS PAUSED */
    //Update all particles
    for (var i=0; i<particles.length; i++) { particles[i].update(dt); }
    //Update all explosions
    for (var i=0; i<explosions.length; i++) { explosions[i].update(dt); }

    //If the round is over (exploding has happened and all explosions have finished)
    if (app.main.gameState == app.GAME_STATE.EXPLODING && explosions.length == 0) {
        //End the round
        app.main.gameState = app.GAME_STATE.ROUND_OVER;
        app.audio.stopBGAudio();
    }
    //If the round isn't over, the game isn't just beginning, and the game isn't exploding, update and draw the cursor
    if (app.main.gameState != app.GAME_STATE.ROUND_OVER && app.main.gameState != app.GAME_STATE.BEGIN && app.main.gameState != app.GAME_STATE.EXPLODING) {
        app.main.cursor.update();
        app.main.cursor.draw();
    }
    //CHECK FOR CHEATS
    if (app.main.gameState == app.GAME_STATE.BEGIN || app.main.gameState == app.GAME_STATE.ROUND_OVER) {
        //If keys are down
        if (app.keys.keydown[app.keys.KEYBOARD.KEY_UP] && app.keys.keydown[app.keys.KEYBOARD.KEY_SHIFT]) {
            app.main.totalScore++;
            app.audio.playEffect();
        }
    }
}

/**
 * Resets the game and moves to the next level
 */
let reset = app.main.reset = function() {
    //Increment the number of circles in the level
    app.main.numCircles += app.CIRCLE.INCREMENT;
    //Determine game state
    app.main.gameState = app.main.gameState == app.GAME_STATE.BEGIN ? app.GAME_STATE.BEGIN : app.GAME_STATE.DEFAULT;
    //Reset the round Score
    app.main.roundScore = 0;
    //Init particles
    particles = app.main.particles = [];
    explosions = app.main.explosions = [];
    //Create circles
    makeCircles(app.main.numCircles);
}

/**
 * Called when the window resize event is fired
 */
let resize = app.main.resize = function() {
    //Get new viewport variables
    app.viewport = viewport = app.getViewport();
    //Resize the canvas to be 100vwX100vh
    canvas.setAttribute("width", viewport.width);
    canvas.setAttribute("height", viewport.height);
    //Replace the old context with the newer, resized version
    app.main.ctx = ctx = canvas.getContext('2d');
}

/**
 * Sets the pause state based on a boolean.
 * Plays/pauses audio accordingly
 */
let togglePause = app.main.togglePause = function(value) {
    app.main.paused = value;
    if (value) {
        app.audio.stopBGAudio();
    } else {
        app.audio.startBGAudio();
    }
    cancelAnimationFrame(app.main.animationID);
    update();
}

/**
 * Draws text on the screen based on the game state
 */
let drawHUD = app.main.drawHUD = function() {
    ctx.save();
    //Draw score
    app.utils.fillText("This Round: " + app.main.roundScore + " of " + app.main.numCircles, 20, 20, "14pt courier", "#ddd");
    app.utils.fillText("Total Score: " + app.main.totalScore, viewport.width - 200, 20, "14pt courier", "#ddd");

    //Draw tutorial text
    if (app.main.gameState == app.GAME_STATE.BEGIN) {
        document.getElementById("startGame").style.display = "inline";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        app.utils.fillText("Click a circle, watch the reaction!", viewport.width/2, viewport.height/2, "30pt courier", "#fff");
    }

    //Draw round over text
    if (app.main.gameState == app.GAME_STATE.ROUND_OVER) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        app.utils.fillText("Round Over", viewport.width/2, viewport.height/2 - 60, "30pt courier", "red");
        ctx.fillStyle = "yellow";
        ctx.fillRect(viewport.width/2 - 300, viewport.height/2 - 25, 600, 50);
        app.utils.fillText("Click here to continue", viewport.width/2, viewport.height/2, "30pt courier", "red");
        app.utils.fillText("Next round there are " + (app.main.numCircles + app.CIRCLE.INCREMENT) + " circles", viewport.width/2, viewport.height/2 + 60, "30pt courier", "white");
    }
    ctx.restore();
}

/**
 * Draw the pause text overlay
 */
let drawPauseScreen = app.main.drawPauseScreen = function() {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    app.utils.fillText("... PAUSED ...", viewport.width/2, viewport.height/2, "40pt courier", "#fff");
    ctx.restore();
}

/**
 * Create a number of circle objects with random colors, randomly placed, and going in random directions
 */
let makeCircles = app.main.makeCircles = function(count) {
    for (var i = 0; i<count; i++) {
        let radius = app.CIRCLE.START_RADIUS;
        let speed = app.CIRCLE.MAX_SPEED;
        particles.push(new Circle(app.utils.randomInt(radius*2, viewport.width-radius*2),
                                  app.utils.randomInt(radius*2, viewport.height-radius*2),
                                  radius,
                                  colors[i % colors.length]
                                 ));
        let circleVec = app.utils.randomVec();
        particles[i].setVel(circleVec[0]*speed, circleVec[1]*speed);
    }
}

/**
 * Calculates the time between frames
 * NOTE: this is partially from Boomshine-ICE-start
 */
let calculateDeltaTime = app.main.calculateDeltaTime = function() {
	let now,fps;
    //Get time in ms
    now = performance.now();
    //Get capped instant FPS (from last frame to this frame)
	fps = app.utils.clamp(1000 / (now - app.main.lastTime), 12, 60);
    //Store this frame time
    app.main.lastTime = now;
    //Return the last frame's time (delta time) in seconds
	return 1/fps;
}
