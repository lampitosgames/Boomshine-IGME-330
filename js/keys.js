"use strict";

app = app || {};

//Keys module
app.keys = (function() {
    let keydown = [];
    let KEYBOARD = Object.freeze({
    	"KEY_LEFT": 37,
    	"KEY_UP": 38,
    	"KEY_RIGHT": 39,
    	"KEY_DOWN": 40,
    	"KEY_SPACE": 32,
    	"KEY_SHIFT": 16
    });

    function init() {// event listeners
        window.addEventListener("keydown",function(e){
        	keydown[e.keyCode] = true;
        });

        window.addEventListener("keyup",function(e){
        	keydown[e.keyCode] = false;
            var char = String.fromCharCode(e.keyCode);
            if (char == "p" || char == "P"){ app.main.togglePause(!app.main.paused); }
            if (char == "d" || char == "D"){ app.main.debug = !app.main.debug; }
        });
    }

    return {
        keydown: keydown,
        KEYBOARD: KEYBOARD,
        init: init
    }
}());
