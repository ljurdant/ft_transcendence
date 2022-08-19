export declare class Player {
    pos: [number, number];
    velocity: [number, number];
    width: number;
    height: number;
    color: any;
    index: number;
    id: any;
    ready: boolean;
    real_id: number;
    real_name: string;
    constructor(color: any, index: number, id: any, user: [string, string, boolean]);
    reset(players_len: number): void;
    distanceTo(point: [number, number]): number;
    calculateNewPos(): void;
    moveUp(): void;
    moveDown(): void;
    dash(direction: number): void;
    leftUp(): [number, number];
    leftDown(): [number, number];
    rightUp(): [number, number];
    rightDown(): [number, number];
}
