import { Game } from "./Game";
import { Server } from "socket.io";
export declare class Pong {
    pos: [number, number];
    velocity: [number, number];
    diameter: number;
    speed: number;
    value: number;
    constructor();
    calculateNewPos(game: Game, server: Server): string;
    relaunchPong(loser_side: string): void;
    leftUp(): [number, number];
    leftDown(): [number, number];
    rightUp(): [number, number];
    rightDown(): [number, number];
    left(): [number, number];
    right(): [number, number];
    up(): [number, number];
    down(): [number, number];
    ballMoves(pos: [number, number]): [number, number];
    cX(): number;
    cY(): number;
    center(): [number, number];
    centerNextFrame(): [number, number];
}
