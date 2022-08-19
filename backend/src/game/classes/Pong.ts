import { ConsoleLogger } from "@nestjs/common";
import * as consts from "./Consts"
import { Game } from "./Game"
import { Server } from "socket.io"

export class Pong {
	pos : [number, number]
	velocity : [number, number];
	diameter : number;
	speed : number;
	value : number;
	constructor() {
		this.pos = [consts.MAP_WIDTH / 2 - consts.PONG_DIAMETER / 2, consts.MAP_HEIGHT / 2 - consts.PONG_DIAMETER / 2];
		this.diameter = consts.PONG_DIAMETER;
		this.value = 1;

		let side = Math.random() < 0.5 ? "left" : "right";
		this.relaunchPong(side);
	}

	calculateNewPos(game : Game, server : Server) : string {
		this.pos[0] += this.velocity[0];
		this.pos[1] += this.velocity[1];
		return game.checkCollisions(server);
	}

	relaunchPong(loser_side : string) {
		this.pos = [consts.MAP_WIDTH / 2 - consts.PONG_DIAMETER / 2, consts.MAP_HEIGHT / 2 - consts.PONG_DIAMETER / 2];
		this.speed = consts.PONG_BASE_SPEED;
		let random_y = Math.random() < 0.5 ? -1 : 1;

		// ? Comment allows for testing horizontal collisions
		// this.pos = random_y === 1 ? [consts.MAP_WIDTH / 12 + consts.PLAYER_WIDTH / 2, 50] : [consts.MAP_WIDTH / 12 + consts.PLAYER_WIDTH / 2, 50];
		// this.velocity = random_y === 1 ? [0, -this.speed] : [0, this.speed];
		if (loser_side === "left")
			this.velocity = [-this.speed, random_y];
		else if (loser_side === "right")
			this.velocity = [this.speed, random_y];
	}

	leftUp() : [number, number] {
		return [this.pos[0], this.pos[1]];
	}

	leftDown() : [number, number] {
		return [this.pos[0], this.pos[1] + this.diameter]
	}

	rightUp() : [number, number] {
		return [this.pos[0] + this.diameter, this.pos[1]];
	}

	rightDown() : [number, number] {
		return [this.pos[0] + this.diameter, this.pos[1] + this.diameter];
	}

	left() : [number, number] {
		return [this.pos[0], this.cY()];
	}

	right() : [number, number] {
		return [this.pos[0] + this.diameter, this.cY()];
	}

	up() : [number, number] {
		return [this.cX(), this.pos[1]];
	}

	down() : [number, number] {
		return [this.cX(), this.pos[1] + this.diameter];
	}

	ballMoves(pos : [number, number]) : [number, number] {
		return [pos[0] + this.velocity[0], pos[1] + this.velocity[1]];
	}
	
	cX() : number {
		return this.pos[0] + this.diameter / 2 ;
	}

	cY() : number {
		return this.pos[1] + this.diameter / 2;
	}

	center() : [number, number] {
		return [this.cX(), this.cY()];
	}

	centerNextFrame() : [number, number] {
		return [this.cX() + this.velocity[0], this.cY() + this.velocity[1]];
	}

};

