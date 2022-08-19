import { Bumper } from "./Bumper";
export declare class GameMap {
    walls: [[number, number], [number, number], [number, number], [number, number]][];
    index: number;
    width: number;
    height: number;
    name: string;
    bumpers: Bumper[];
    constructor(index: number, w: number, h: number);
}
