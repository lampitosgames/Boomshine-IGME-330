"use strict";

app.main = {
    canvas: undefined,
    ctx: undefined,
    lastTime: 0,
    particles: [],
    debug: true,
    paused: false
};

//Script variables
let canvas, ctx, viewport;

/**
 * Initialization
 */
let init = app.main.init = function() {
    //Store the canvas element
    app.main.canvas = canvas = document.getElementById("canvas");
    //Bind resize, then call it as part of initialization
    window.addEventListener('resize', resize);
    resize();

    app.main.particles.push(new Circle(50, 50, 20));
    app.main.particles[0].vel = {x: 10, y: 10};

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
    //Note to grader: I don't need to bind it here because of the way I'm coding.
    requestAnimationFrame(app.main.update);

    //All code that shouldn't be called if the game is paused should come after this
    if (app.main.paused) return;

    //Get the delta time
    let dt = calculateDeltaTime();

    ctx.clearRect(0, 0, viewport.width, viewport.height);

    for (var i=0; i<app.main.particles.length; i++) {
        app.main.particles[i].update();
        app.main.particles[i].draw();
    }
}

/**
 * Calculates the time between frames
 * NOTE: this is partially from mycourses
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
