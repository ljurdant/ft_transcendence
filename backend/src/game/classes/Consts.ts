import { GameMap } from "./GameMap"

export const PLAYER_WIDTH : number = 15;
export const PLAYER_HEIGHT : number = 80;

export const MAP_WIDTH : number = 1200;
export const MAP_HEIGHT : number = 750;

export const DIAGONAL = Math.sqrt(Math.pow(MAP_WIDTH, 2) + Math.pow(MAP_HEIGHT, 2));

export const PONG_DIAMETER : number = 12;
export const PONG_BASE_SPEED : number = DIAGONAL / 150;
export const PONG_MAX_SPEED : number = PONG_BASE_SPEED * 2;
export const PONG_ACCELERATION : number = PONG_BASE_SPEED / 2800;
export const PONG_ACCELERATION_ACUTE_ANGLE : number = PONG_BASE_SPEED / 28;

export const PLAYER_SPEED : number = DIAGONAL / 125;	

export const TOP_BOUND : number = 10;
export const BOT_BOUND : number = MAP_HEIGHT - 10;
export const LEFT_BOUND : number = 0;
export const RIGHT_BOUND : number = MAP_WIDTH;

export const original_map : GameMap = new GameMap(1, MAP_WIDTH, MAP_HEIGHT);
export const city_map : GameMap = new GameMap(2, MAP_WIDTH, MAP_HEIGHT);
export const casino_map : GameMap = new GameMap(3, MAP_WIDTH, MAP_HEIGHT);