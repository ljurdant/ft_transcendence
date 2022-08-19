export declare function sub(v1: Vector, v2: Vector): Vector;
export declare class Vector {
    x: number;
    y: number;
    constructor(pos: [number, number]);
    add(other: Vector): void;
    mult(nbr: number): void;
    mag(): number;
    normalize(): void;
    dot(other: Vector): number;
}
