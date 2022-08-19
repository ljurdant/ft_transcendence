"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameMap = void 0;
const consts = require("./Consts");
const Bumper_1 = require("./Bumper");
class GameMap {
    constructor(index, w, h) {
        this.index = index;
        this.width = w;
        this.height = h;
        this.name = "original";
        this.walls = [
            [[5, 5], [this.width - 10, 5], [5, 10], [this.width - 5, 10]],
            [[5, this.height - 10], [this.width - 10, 5], [5, this.height - 10], [this.width - 5, this.height - 10]]
        ];
        this.bumpers = [];
        let diameter = consts.DIAGONAL * 0.1;
        this.bumpers.push(new Bumper_1.Bumper(consts.MAP_WIDTH / 2 - diameter / 2, consts.MAP_HEIGHT * 1 / 4 - diameter / 2, diameter));
        this.bumpers.push(new Bumper_1.Bumper(consts.MAP_WIDTH / 2 - diameter / 2, consts.MAP_HEIGHT * 3 / 4 - diameter / 2, diameter));
        if (this.index === 2)
            this.name = "city";
        else if (this.index === 3)
            this.name = "casino";
    }
}
exports.GameMap = GameMap;
;
//# sourceMappingURL=GameMap.js.map