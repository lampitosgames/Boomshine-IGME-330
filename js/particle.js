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
}
