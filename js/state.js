"use strict";
//The state module contains state for all other modules, providing easy data access and modification from anywhere in the app
app.state = (function() {
    let a = app;

    //Enum values for all the state.  Keys must be unique
    let e = {
        //GAME STATES
        //Given unique values
        BEGIN: 1000,
        DEFAULT: 2000,
        EXPLODING: 3000,
        ROUND_OVER: 4000,
        REPEAT_LEVEL: 5000,
        END: 6000,

        NUM_CIRCLES_START: 0,
        INCREMENT: 20,
        START_RADIUS: 10,
        MAX_RADIUS: 60,
        MIN_RADIUS: 2,
        MAX_LIFETIME: 2.5,
        MAX_SPEED: 500,
        EXPLOSION_SPEED: 90,
        IMPLOSION_SPEED: 120
    };

    //Main module state
    let main = {
        //ID of the animation being used
        animationID: 0,
        //All derived from the particle class.  Game objects, basically
        numCircles: undefined,
        particles: undefined,
        explosions: undefined,
        cursor: undefined,

        gameState: undefined,
        roundScore: 0,
        totalScore: 0,

        debug: false,
        paused: false
    };

    //Time module state
    let time = {
        //Delta time
        dt: 0,
        //Total time the app has been running
        runTime: 0,
        //Timestamp of the last update loop
        lastTime: 0,
        //Current frames per second
        fps: 0
    };

    let colors = ["#FD5B78", "#FF6037", "#FF9966", "#66FF66", "#50BFE6", "#FF6EFF", "#EE34D2"];

    //Expose all state variables to the app
    return {
        e: e,
        main: main,
        time: time,
        colors: colors
    };
}());
