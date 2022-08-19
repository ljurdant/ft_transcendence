import { Pong } from "./Pong";
import { Vector } from "./Vector";
export declare class Bumper {
    pos: Vector;
    center: Vector;
    diameter: number;
    hit: boolean;
    collision: Vector;
    bounce_vec: Vector;
    constructor(x: number, y: number, diameter: number);
    checkCollision(pong: Pong): boolean;
}
