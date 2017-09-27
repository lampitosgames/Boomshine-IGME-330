"use strict";

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velx = 0;
        this.vely = 0;
    }

    setVel(x, y) {
        this.velx = x;
        this.vely = y;
    }

    update() {
        this.x += this.velx;
        this.y += this.vely;
    }
}

class Circle extends Particle {
    constructor(x, y, radius) {
        super(x, y);
        this.radius = radius;
    }

    update() {
        this.x += this.velx;
        this.y += this.vely;
        app.utils.checkBoundingCollision(this);
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.stroke();
        ctx.fill();
    }
}
