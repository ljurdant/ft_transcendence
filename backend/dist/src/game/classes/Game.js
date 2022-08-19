"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const consts = require("./Consts");
const Player_1 = require("./Player");
const Pong_1 = require("./Pong");
const utils = require("./../utils");
const top_bound = 10;
const bot_bound = consts.MAP_HEIGHT - 10;
const left_bound = 0;
const right_bound = consts.MAP_WIDTH;
class Game {
    constructor(room_id) {
        this.room_id = room_id;
        this.state = 'waiting-player';
        this.players = [];
        this.spectators = [];
        this.score = [0, 0];
        this.score_limit = 10;
        this.pong = new Pong_1.Pong();
        this.map = consts.original_map;
        this.frames_since_point = 0;
        this.publicity = "public";
        this.invert = false;
        this.polling = false;
    }
    spaceAvailable(username) {
        for (let player of this.players)
            if (player.real_name === username)
                return false;
        return (this.players.length <= 1);
    }
    kickPlayer(server, id) {
        for (let player of this.players) {
            if (player.id === id) {
                server.to(this.room_id).emit("player-disconnect", this.players.indexOf(player));
                this.players.splice(this.players.indexOf(player), 1);
                this.reset();
            }
        }
    }
    reset() {
        for (let player of this.players)
            player.reset(this.players.length);
        this.state = "waiting-player";
        this.score = [0, 0];
        this.score_limit = 10;
        this.map = consts.original_map;
        delete this.pong;
        this.pong = new Pong_1.Pong();
        this.frames_since_point = 0;
        this.publicity = "public";
        this.invert = false;
        this.polling = false;
    }
    addSpectator(id) {
        this.spectators.push(id);
    }
    addPlayer(id, user) {
        for (let player of this.players)
            if (player.id === id)
                return;
        if (this.players.length === 0)
            this.players.push(new Player_1.Player("white", 1, id, user));
        else if (this.players.length === 1)
            this.players.push(new Player_1.Player("white", 2, id, user));
    }
    setNewValue() {
        if (this.map.name !== "casino")
            return;
        let rand = Math.floor(Math.random() * 11);
        if (rand === 0)
            this.pong.value = -1;
        else if (rand <= 4)
            this.pong.value = 1;
        else if (rand <= 7)
            this.pong.value = 2;
        else if (rand <= 9)
            this.pong.value = 3;
        else if (rand === 10)
            this.pong.value = 4;
    }
    increment_score() {
        if (!this.invert) {
            if (this.pong.value === -1 && this.score[1] > 0)
                this.score[1]--;
            else if (this.pong.value !== -1)
                this.score[0] += this.pong.value;
        }
        else {
            if (this.pong.value === -1 && this.score[0] > 0)
                this.score[0]--;
            else if (this.pong.value !== -1)
                this.score[1] += this.pong.value;
        }
    }
    over() {
        if (this.score[0] >= this.score_limit || this.score[1] >= this.score_limit)
            return true;
        return false;
    }
    scorePoint() {
        if (!this.invert)
            this.pong.relaunchPong("right");
        else
            this.pong.relaunchPong("left");
        this.setNewValue();
        this.frames_since_point = 0;
        return "relaunch";
    }
    checkCollisions(server) {
        if (this.frames_since_point === 0)
            this.pong.speed = consts.PONG_BASE_SPEED;
        else if (this.pong.speed < consts.PONG_MAX_SPEED) {
            if (this.pong.velocity[0] > 0)
                this.pong.velocity[0] += consts.PONG_ACCELERATION;
            else
                this.pong.velocity[0] -= consts.PONG_ACCELERATION;
            if (this.pong.velocity[1] > 0)
                this.pong.velocity[1] += consts.PONG_ACCELERATION;
            else
                this.pong.velocity[1] -= consts.PONG_ACCELERATION;
            this.pong.speed += consts.PONG_ACCELERATION * 2;
        }
        this.frames_since_point++;
        if (this.map.name === "city") {
            if (this.map.bumpers[0].checkCollision(this.pong)) {
                server.to(this.room_id).emit("bumper-hit", 0);
                return "none";
            }
            else if (this.map.bumpers[1].checkCollision(this.pong)) {
                server.to(this.room_id).emit("bumper-hit", 1);
                return "none";
            }
        }
        if (this.pong.pos[1] < consts.TOP_BOUND || this.pong.pos[1] + this.pong.diameter > consts.BOT_BOUND) {
            if (this.pong.pos[1] < consts.TOP_BOUND) {
                this.pong.pos[1] = consts.TOP_BOUND + consts.MAP_HEIGHT * 0.005;
            }
            else if (this.pong.pos[1] + this.pong.diameter > consts.BOT_BOUND) {
                this.pong.pos[1] = consts.BOT_BOUND - this.pong.diameter - consts.MAP_HEIGHT * 0.005;
            }
            this.pong.velocity[1] *= -1;
            server.to(this.room_id).emit("wall-hit");
        }
        if (this.pong.velocity[0] > 0 && this.pong.pos[0] + this.pong.diameter > right_bound) {
            this.invert = false;
            return "relaunch";
        }
        else if (this.pong.velocity[0] < 0 && this.pong.pos[0] < left_bound) {
            this.invert = true;
            return "relaunch";
        }
        let player = (this.pong.pos[0] < consts.MAP_WIDTH / 2 ? this.players[0] : this.players[1]);
        let ball_points = [this.pong.up(), this.pong.right(), this.pong.down(), this.pong.left()];
        for (let i = 0; i < 4; i++) {
            let angle = 0;
            let intersection_point = [[-1, -1, "side"]];
            angle = this.collisionPaddle(player, intersection_point, ball_points[i]);
            if (intersection_point[0][0] !== -1) {
                server.to(this.room_id).emit("player-hit");
                let max_angle_percentage = Math.abs(angle) / (Math.PI * 3 / 12);
                if (intersection_point[0][2] === "top" || intersection_point[0][2] === "bot") {
                    if (intersection_point[0][2] === "top")
                        this.pong.velocity[1] = (1 + consts.PONG_ACCELERATION_ACUTE_ANGLE * max_angle_percentage) * this.pong.speed * -Math.cos(angle);
                    else if (intersection_point[0][2] === "bot")
                        this.pong.velocity[1] = (1 + consts.PONG_ACCELERATION_ACUTE_ANGLE * max_angle_percentage) * this.pong.speed * Math.cos(angle);
                    this.pong.velocity[0] = (1 + consts.PONG_ACCELERATION_ACUTE_ANGLE * max_angle_percentage) * this.pong.speed * -Math.sin(angle);
                }
                else if (intersection_point[0][2] === "side") {
                    if (this.pong.pos[0] < this.map.width / 2)
                        this.pong.velocity[0] = (1 + consts.PONG_ACCELERATION_ACUTE_ANGLE * max_angle_percentage) * this.pong.speed * Math.cos(angle);
                    else
                        this.pong.velocity[0] = (1 + consts.PONG_ACCELERATION_ACUTE_ANGLE * max_angle_percentage) * this.pong.speed * -Math.cos(angle);
                    this.pong.velocity[1] = (1 + consts.PONG_ACCELERATION_ACUTE_ANGLE * max_angle_percentage) * this.pong.speed * -Math.sin(angle);
                }
            }
            return "none";
        }
        return "none";
    }
    collisionPaddle(player, intersection_point, ball_point) {
        let paddle_side_hit = player.index === 1 ?
            [player.rightUp(), player.rightDown()] : [player.leftUp(), player.leftDown()];
        let paddle_bot_hit = [player.leftDown(), player.rightDown()];
        let paddle_top_hit = [player.leftUp(), player.rightUp()];
        intersection_point[0] = utils.getLineIntersection(ball_point, this.pong.ballMoves(ball_point), paddle_side_hit[0], paddle_side_hit[1]);
        intersection_point[0][2] = "side";
        if (intersection_point[0][0] !== -1)
            return utils.relativeIntersection(intersection_point[0], paddle_side_hit[0], paddle_side_hit[1]);
        intersection_point[0] = utils.getLineIntersection(ball_point, this.pong.ballMoves(ball_point), paddle_bot_hit[0], paddle_bot_hit[1]);
        intersection_point[0][2] = "bot";
        if (intersection_point[0][0] !== -1)
            return utils.relativeIntersection(intersection_point[0], paddle_bot_hit[0], paddle_bot_hit[1]);
        intersection_point[0] = utils.getLineIntersection(ball_point, this.pong.ballMoves(ball_point), paddle_top_hit[0], paddle_top_hit[1]);
        intersection_point[0][2] = "top";
        if (intersection_point[0][0] !== -1)
            return utils.relativeIntersection(intersection_point[0], paddle_top_hit[0], paddle_top_hit[1]);
        return 0;
    }
}
exports.Game = Game;
//# sourceMappingURL=Game.js.map