//Onload, init
window.onload = init;

//SCRIPT GLOBALS
let canvas, ctx;
let viewport;

//FUNCTIONS
/**
 * Initialization
 */
function init() {
    //Store the canvas element
    app.canvas = canvas = document.getElementById("canvas");
    //Bind resize, then call it as part of initialization
    window.addEventListener('resize', resize);
    resize();
}

/**
 * Called when the window resize event is fired
 */
function resize() {
    //Get new viewport variables
    viewport = app.viewport();
    //Resize the canvas to be 100vwX100vh
    canvas.setAttribute("width", viewport.width);
    canvas.setAttribute("height", viewport.height);
    //Replace the old context with the newer, resized version
    app.ctx = ctx = canvas.getContext('2d');
}
