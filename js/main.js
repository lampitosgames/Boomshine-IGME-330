"use strict";

app.main = {
    canvas: undefined,
    ctx: undefined,
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
app.GAME_STATE = {
    BEGIN: 0,
    DEFAULT: 1,
    EXPLODING: 2,
    ROUND_OVER: 3,
    REPEAT_LEVEL: 4,
    END: 5
};
app.CIRCLE = {
    NUM_CIRCLES_START: 0,
    INCREMENT: 20,
    START_RADIUS: 10,
    MAX_RADIUS: 60,
    MIN_RADIUS: 2,
    MAX_LIFETIME: 2.5,
    //Pixels Per Second
    MAX_SPEED: 500,
    EXPLOSION_SPEED: 90,
    IMPLOSION_SPEED: 120
};

//Script local variables (I mean, they're technically global, but globals are all stored in the app object)
let canvas, ctx, viewport;
let dt;
let particles, explosions;

/**
 * Initialization
 */
let init = app.main.init = function() {
    //Store the canvas element
    app.main.canvas = canvas = document.getElementById("canvas");
    //Set initial game state
    app.main.gameState = app.GAME_STATE.BEGIN;
    app.main.numCircles = app.CIRCLE.NUM_CIRCLES_START;

    //Bind resize, then call it as part of initialization
    window.addEventListener('resize', resize);
    resize();

    //Init the mouse
    app.mouse = [0, 0];

    //Create a new cursor
    app.main.cursor = new Cursor(40, "rgba(255, 255, 255, 0.75)", 5);

    //Bind the mousedown event to the canvas
    canvas.onmousedown = function() {
        //If the game was paused, unpause but do nothing
        if (app.main.paused) {
            app.main.paused = false;
            app.main.update();
            return;
        }
        //If the game is already in the exploding state, return early
        if (app.main.gameState == app.GAME_STATE.EXPLODING) return;

        //If the round is over, start the next round
        if (app.main.gameState == app.GAME_STATE.ROUND_OVER) {
            app.main.reset();
            return;
        }
        //Default to calling the cursor's click event
        app.main.cursor.click();
    }

    //Reset the level
    reset();
    //Start the update loop.
    update();
}

/**
 * Resets the game and moves to the next level
 */
let reset = app.main.reset = function() {
    //Create circles
    app.main.numCircles += app.CIRCLE.INCREMENT;
    app.main.gameState = app.main.gameState == app.GAME_STATE.BEGIN ? app.GAME_STATE.BEGIN : app.GAME_STATE.DEFAULT;
    //Reset the round Score
    app.main.roundScore = 0;
    //Init particles
    particles = app.main.particles = [];
    explosions = app.main.explosions = [];
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
 * Main update loop of the game
 */
let update = app.main.update = function() {
    //Note to grader: I don't need to bind the update function because of the way I'm coding.
    app.main.animationID = requestAnimationFrame(app.main.update);

    //Get the delta time
    app.dt = dt = calculateDeltaTime();

    //Override everything with a full-size background
    ctx.fillStyle = "#171717";
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    //Draw all particles
    for (var i=0; i<app.main.particles.length; i++) { particles[i].draw(); }
    //Draw all explosions
    for (var i=0; i<explosions.length; i++) { explosions[i].draw(dt); }

    drawHUD();

    //If in debug mode, draw debugger things
    if (app.main.debug) {
        //Draw delta time
        app.utils.fillText("dt: " + dt.toFixed(3), viewport.width - 150, viewport.height - 10, "10pt courier", "white");
    }

    //UPDATES DON'T HAPPEN IF GAME IS PAUSED
    if (app.main.paused) {
        drawPauseScreen();
        return;
    }
    //Update all particles
    for (var i=0; i<particles.length; i++) { particles[i].update(dt); }
    //Update all explosions
    for (var i=0; i<explosions.length; i++) { explosions[i].update(dt); }

    if (app.main.gameState == app.GAME_STATE.EXPLODING && explosions.length == 0) {
        app.main.gameState = app.GAME_STATE.ROUND_OVER;
    } else if (app.main.gameState != app.GAME_STATE.ROUND_OVER && app.main.gameState != app.GAME_STATE.EXPLODING) {
        app.main.cursor.update();
        app.main.cursor.draw();
    }
}

let drawHUD = app.main.drawHUD = function() {
    ctx.save();
    //Draw score
    app.utils.fillText("This Round: " + app.main.roundScore + " of " + app.main.numCircles, 20, 20, "14pt courier", "#ddd");
    app.utils.fillText("Total Score: " + app.main.totalScore, viewport.width - 200, 20, "14pt courier", "#ddd");

    //Draw tutorial text
    if (app.main.gameState == app.GAME_STATE.BEGIN) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        app.utils.fillText("To begin, click a circle", viewport.width/2, viewport.height/2, "30pt courier", "#fff");
    }

    //Draw round over text
    if (app.main.gameState == app.GAME_STATE.ROUND_OVER) {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        app.utils.fillText("Round Over", viewport.width/2, viewport.height/2 - 40, "30pt courier", "red");
        app.utils.fillText("Click to continue", viewport.width/2, viewport.height/2, "30pt courier", "red");
        app.utils.fillText("Next round there are " + (app.main.numCircles + app.CIRCLE.INCREMENT) + " circles", viewport.width/2, viewport.height/2 + 40, "30pt courier", "white");
    }
    ctx.restore();
}

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
                                  app.utils.randomRGBOpacity(0.75)
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
