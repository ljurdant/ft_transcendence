import * as consts from "./Consts"
import { Server } from "socket.io"
import { Player } from "./Player";
import { Pong } from "./Pong";
import { GameMap } from "./GameMap";
import * as utils from "./../utils";

const top_bound : number = 10;
const bot_bound : number = consts.MAP_HEIGHT - 10;
const left_bound : number = 0;
const right_bound : number = consts.MAP_WIDTH;

export class Game {
	room_id : string;
	state : string;
	score : [number, number];
	score_limit : number;
	players : Player[];
	spectators : string[];
	pong : Pong;
	map : GameMap;
	frames_since_point : number;
	publicity : string;
	update_interval : any;
	countdown_timeout : any;

	invert : boolean;
	polling : boolean;

	constructor(room_id: any) {
		this.room_id = room_id;
		this.state = 'waiting-player';
		this.players = [];
		this.spectators = [];
		this.score = [0, 0];
		this.score_limit = 10;
		this.pong = new Pong();
		this.map = consts.original_map;
		this.frames_since_point = 0;
		this.publicity = "public";
		this.invert = false;
		this.polling = false;
	}

	spaceAvailable(username : string) {
		for (let player of this.players)
			if (player.real_name === username)
				return false;
		return (this.players.length <= 1);
	}

	kickPlayer(server : Server, id: any) {
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
		this.pong = new Pong();
		this.frames_since_point = 0;
		this.publicity = "public";
		this.invert = false;
		this.polling = false;
	}

	addSpectator(id : any) {
		this.spectators.push(id);
	}

	addPlayer(id: any, user : [string, string, boolean]) {
		for (let player of this.players)
			if (player.id === id)
				return ;
		if (this.players.length === 0)
			this.players.push(new Player("white", 1, id, user));
		else if (this.players.length === 1)
			this.players.push(new Player("white", 2, id, user));
	}

	setNewValue() {
		if (this.map.name !== "casino")
			return ;
		let rand : number = Math.floor(Math.random() * 11);
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

	over() : boolean {
		if (this.score[0] >= this.score_limit || this.score[1] >= this.score_limit)
			return true;
		return false;
	}

	scorePoint() : string {
		if (!this.invert)
			this.pong.relaunchPong("right");
		else
			this.pong.relaunchPong("left");
		this.setNewValue();
		this.frames_since_point = 0;
		return "relaunch";
	}

	checkCollisions(server : Server) : string {
		// Implement acceleration here
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
			else if (this.map.bumpers[1].checkCollision(this.pong))  {
				server.to(this.room_id).emit("bumper-hit", 1);
				return "none";
			}
		}

		// ? collision with bounds
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
		let ball_points : [[number, number], [number, number], [number, number], [number, number]] = 
		[this.pong.up(), this.pong.right(), this.pong.down(), this.pong.left()];

		// ? collision with paddles
		for (let i = 0; i < 4; i++) {
			let angle : number = 0;
			let intersection_point : [number, number, string][] = [[-1, -1, "side"]]; // array of one element so that the variable is referenced in functions
			angle = this.collisionPaddle(player, intersection_point, ball_points[i]);
			
			if (intersection_point[0][0] !== -1) {
				server.to(this.room_id).emit("player-hit");
				let max_angle_percentage : number = Math.abs(angle) / (Math.PI * 3 / 12); // ? number that lets me add speed to acute angled shots
				// ? for bot / top collisions
				if (intersection_point[0][2] === "top" || intersection_point[0][2] === "bot") {
					if (intersection_point[0][2] === "top")
						this.pong.velocity[1] = (1 + consts.PONG_ACCELERATION_ACUTE_ANGLE * max_angle_percentage) * this.pong.speed * -Math.cos(angle);
					else if (intersection_point[0][2] === "bot")
						this.pong.velocity[1] = (1 + consts.PONG_ACCELERATION_ACUTE_ANGLE * max_angle_percentage) * this.pong.speed * Math.cos(angle);
					this.pong.velocity[0] = (1 + consts.PONG_ACCELERATION_ACUTE_ANGLE * max_angle_percentage) * this.pong.speed * -Math.sin(angle);
				}
				// ? invert velocity indexes for left / right collisions
				else if (intersection_point[0][2] === "side") {
					if (this.pong.pos[0] < this.map.width / 2)
						this.pong.velocity[0] = (1 + consts.PONG_ACCELERATION_ACUTE_ANGLE * max_angle_percentage) * this.pong.speed * Math.cos(angle);
					else
						this.pong.velocity[0] = (1 + consts.PONG_ACCELERATION_ACUTE_ANGLE * max_angle_percentage) * this.pong.speed * -Math.cos(angle);
					this.pong.velocity[1] = (1 + consts.PONG_ACCELERATION_ACUTE_ANGLE * max_angle_percentage) * this.pong.speed * -Math.sin(angle);	
				}
			}
			return "none"
		}
		return "none";
	}

	collisionPaddle(player : Player, intersection_point : [number, number, string][], ball_point : [number, number]) : number {
		let paddle_side_hit :	[[number, number], [number, number]] = player.index === 1 ? 
								[player.rightUp(), player.rightDown()] : [player.leftUp(), player.leftDown()];
		let paddle_bot_hit : [[number, number], [number, number]] = [player.leftDown(), player.rightDown()];
		let paddle_top_hit : [[number, number], [number, number]] = [player.leftUp(), player.rightUp()];

		intersection_point[0] = utils.getLineIntersection(ball_point, this.pong.ballMoves(ball_point), paddle_side_hit[0], paddle_side_hit[1]);
		intersection_point[0][2] = "side";
		if (intersection_point[0][0] !== -1)
			return utils.relativeIntersection(intersection_point[0], paddle_side_hit[0], paddle_side_hit[1]);
	
		// ? Multiplying velocity vector by 3 for better precision in bot/top intersection
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