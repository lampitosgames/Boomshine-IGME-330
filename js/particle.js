"use strict";

class Particle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.velx = 0;
        this.vely = 0;
        this.radius = radius;
    }
    setVel(x, y) {
        this.velx = x;
        this.vely = y;
    }
    update(dt) {
        this.x += this.velx * dt;
        this.y += this.vely * dt;
    }
}

class Circle extends Particle {
    constructor(x, y, radius, color) {
        super(x, y, radius);
        this.color = color;
    }
    update(dt) {
        this.x += this.velx * dt;
        this.y += this.vely * dt;
        app.utils.checkBoundingCollision(this);
    }
    draw() {
        app.utils.fillCircle(this.x, this.y, this.radius, this.color);
    }
    explode() {
        //remove this particle from the array
        let index = app.main.particles.indexOf(this);
        if (index > -1) { app.main.particles.splice(index, 1); }
        //Create a new exploding particle in its place
        app.main.explosions.push(new Explosion(this.x, this.y, this.radius, this.color));
    }
}

class Explosion extends Circle {
    constructor(x, y, radius, color) {
        super(x, y, radius, color);
        //How long after the explosion hits maximum radius should it stay active
        this.countdown = app.CIRCLE.MAX_LIFETIME;
        //Increase the round Score
        app.main.roundScore += 1;
        app.main.totalScore += 1;
    }
    update(dt) {
        //Collide with all active circles
        let pList = app.main.particles;
        for (var i=0; i<pList.length; i++) {
            let p = pList[i];
            if (app.utils.circleCollision(this, p)) {
                p.explode();
            }
        }

        //UPDATE RADIUS
        //If the countdown has expired, implode
        if (this.countdown <= 0) {
            //Subtract delta-multiplied implosion speed
            this.radius -= app.CIRCLE.IMPLOSION_SPEED * dt;
            //If the explosion has hit minimum radius, delete it
            if (this.radius <= app.CIRCLE.MIN_RADIUS) {
                let index = app.main.explosions.indexOf(this);
                if (index > -1) { app.main.explosions.splice(index, 1); }
            }
            //Return so other code doesn't run
            return;
        }

        //If the explosion has not reached maximum radius
        if (this.radius < app.CIRCLE.MAX_RADIUS ) {
            //Increase the radius
            this.radius += app.CIRCLE.EXPLOSION_SPEED * dt;
        //Else, increment the timer
        } else { this.countdown -= dt; }
    }
    draw() {
        app.utils.fillCircle(this.x, this.y, this.radius, this.color);
    }
}

class Cursor extends Particle {
    constructor(radius, color, lineWidth) {
        super(app.mouse[0], app.mouse[1], radius);
        this.color = color;
        this.lineWidth = lineWidth;
        this.velx = 0;
        this.vely = 0;
    }
    update(dt) {
        this.x = app.mouse[0];
        this.y = app.mouse[1];
    }
    draw() {
        app.utils.strokeCircle(this.x, this.y, this.radius, this.color, this.lineWidth)
    }
    click() {
        let pList = app.main.particles;
        for (var i=0; i<pList.length; i++) {
            let p = pList[i];
            if (app.utils.circleCollision(app.main.cursor, p)) {
                p.explode();
                app.main.gameState = app.GAME_STATE.EXPLODING;
            }
        }
    }
}
