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

document.onmousemove = function(e) {
    app.mouse = app.getMouse(e);
}

document.onmousedown = function() {
    let pList = app.main.particles;
    for (var i=0; i<pList.length; i++) {
        let p = pList[i];
        if (app.utils.circleCollision(app.main.cursor, p)) {
            p.setVel(0, 0);
            p.color = "red";
        }
    }
}
