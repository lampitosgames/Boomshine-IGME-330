"use strict";

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vel = {x: 0, y: 0};
    }

    setVel(x, y) {
        this.vel = {x: x, y: y};
    }

    update() {
        this.x += this.vel.x;
        this.y += this.vel.y;
    }
}

class Circle extends Particle {
    constructor(x, y, radius) {
        super(x, y);
        this.radius = radius;
    }

    update() {
        this.x += this.vel.x;
        this.y += this.vel.y;
        app.utils.checkBoundingCollision(this);
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI*2);
        ctx.stroke();
        ctx.fill();
    }
}
