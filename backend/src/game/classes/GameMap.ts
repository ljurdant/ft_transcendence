import * as consts from "./Consts"
import { Bumper } from "./Bumper"

export class GameMap {
	walls : [[number, number], [number, number], [number, number], [number, number]][]; // [pos_x, pos_y], [width, height], outer1, outer2
	index : number;
	width : number;
	height : number;
	name: string;
	bumpers : Bumper[];

	constructor(index : number, w : number, h : number) {
		this.index = index;
		this.width = w;
		this.height = h;
		this.name = "original";
		this.walls =	[
			[[5, 5], [this.width - 10, 5], [5, 10], [this.width - 5, 10]], 
			[[5, this.height - 10], [this.width - 10, 5], [5, this.height - 10], [this.width - 5, this.height - 10]]
		];
		this.bumpers = [];
		let diameter = consts.DIAGONAL * 0.1;
		this.bumpers.push(new Bumper(consts.MAP_WIDTH / 2 - diameter / 2, consts.MAP_HEIGHT * 1 / 4 - diameter / 2, diameter));
		this.bumpers.push(new Bumper(consts.MAP_WIDTH / 2 - diameter / 2, consts.MAP_HEIGHT * 3 / 4 - diameter / 2, diameter));
		if (this.index === 2)
			this.name = "city";
		else if (this.index === 3)
			this.name = "casino";
	}
};
