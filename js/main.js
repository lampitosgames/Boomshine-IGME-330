"use strict";

app.main = {
    canvas: undefined,
    ctx: undefined,
    lastTime: 0,
    particles: undefined,
    cursor: undefined,
    animationID: 0,
    debug: true,
    paused: false
};

//Script local variables (I mean, they're technically global, but globals are all stored in the app object)
let canvas, ctx, viewport;
let dt;
let particles;

/**
 * Initialization
 */
let init = app.main.init = function() {
    //Store the canvas element
    app.main.canvas = canvas = document.getElementById("canvas");
    //Bind resize, then call it as part of initialization
    window.addEventListener('resize', resize);
    resize();

    //Init the mouse
    app.mouse = [0, 0];
    //Init particles
    particles = app.main.particles = [];
    //Create a bunch of new particles
    for (var i = 0; i<10; i++) {
        let radius = 20;
        let speed = 300;
        particles.push(new Circle(app.utils.randomInt(radius*2, viewport.width-radius*2),
                                  app.utils.randomInt(radius*2, viewport.height-radius*2),
                                  radius,
                                  app.utils.randomRGBOpacity(0.75)
                                 ));
        let circleVec = app.utils.randomVec();
        particles[i].setVel(circleVec[0]*speed, circleVec[1]*speed);
    }
    app.main.cursor = new Cursor(40, "rgba(255, 255, 255, 0.75)", 5);

    //Start the update loop.
    update();
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
    for (var i=0; i<app.main.particles.length; i++) {
        particles[i].draw();
    }

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
    for (var i=0; i<particles.length; i++) {
        particles[i].update(dt);
    }
    //Update and draw the cursor
    app.main.cursor.update();
    app.main.cursor.draw();
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
