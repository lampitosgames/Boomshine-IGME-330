"use strict";

//Init global app
let app = {};

window.onload = function() {
    app.main.init();
}

window.onblur = function() {
    app.main.paused = true;
    cancelAnimationFrame(app.main.animationID);
    app.main.update();
}

window.onfocus = function() {
    app.main.paused = false;
    cancelAnimationFrame(app.main.animationID);
    app.main.update();
}
