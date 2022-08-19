"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pong = void 0;
const consts = require("./Consts");
class Pong {
    constructor() {
        this.pos = [consts.MAP_WIDTH / 2 - consts.PONG_DIAMETER / 2, consts.MAP_HEIGHT / 2 - consts.PONG_DIAMETER / 2];
        this.diameter = consts.PONG_DIAMETER;
        this.value = 1;
        let side = Math.random() < 0.5 ? "left" : "right";
        this.relaunchPong(side);
    }
    calculateNewPos(game, server) {
        this.pos[0] += this.velocity[0];
        this.pos[1] += this.velocity[1];
        return game.checkCollisions(server);
    }
    relaunchPong(loser_side) {
        this.pos = [consts.MAP_WIDTH / 2 - consts.PONG_DIAMETER / 2, consts.MAP_HEIGHT / 2 - consts.PONG_DIAMETER / 2];
        this.speed = consts.PONG_BASE_SPEED;
        let random_y = Math.random() < 0.5 ? -1 : 1;
        if (loser_side === "left")
            this.velocity = [-this.speed, random_y];
        else if (loser_side === "right")
            this.velocity = [this.speed, random_y];
    }
    leftUp() {
        return [this.pos[0], this.pos[1]];
    }
    leftDown() {
        return [this.pos[0], this.pos[1] + this.diameter];
    }
    rightUp() {
        return [this.pos[0] + this.diameter, this.pos[1]];
    }
    rightDown() {
        return [this.pos[0] + this.diameter, this.pos[1] + this.diameter];
    }
    left() {
        return [this.pos[0], this.cY()];
    }
    right() {
        return [this.pos[0] + this.diameter, this.cY()];
    }
    up() {
        return [this.cX(), this.pos[1]];
    }
    down() {
        return [this.cX(), this.pos[1] + this.diameter];
    }
    ballMoves(pos) {
        return [pos[0] + this.velocity[0], pos[1] + this.velocity[1]];
    }
    cX() {
        return this.pos[0] + this.diameter / 2;
    }
    cY() {
        return this.pos[1] + this.diameter / 2;
    }
    center() {
        return [this.cX(), this.cY()];
    }
    centerNextFrame() {
        return [this.cX() + this.velocity[0], this.cY() + this.velocity[1]];
    }
}
exports.Pong = Pong;
;
//# sourceMappingURL=Pong.js.map