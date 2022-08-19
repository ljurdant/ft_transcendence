"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector = exports.sub = void 0;
function sub(v1, v2) {
    let ret = new Vector([v1.x, v1.y]);
    ret.x -= v2.x;
    ret.y -= v2.y;
    return ret;
}
exports.sub = sub;
class Vector {
    constructor(pos) {
        this.x = pos[0];
        this.y = pos[1];
    }
    add(other) {
        this.x += other.x;
        this.y += other.y;
    }
    mult(nbr) {
        this.x *= nbr;
        this.y *= nbr;
    }
    mag() {
        return (Math.sqrt(this.x * this.x + this.y * this.y));
    }
    normalize() {
        this.x /= this.mag();
        this.y /= this.mag();
    }
    dot(other) {
        let ret = 0;
        ret += this.x * other.x;
        ret += this.y * other.y;
        return ret;
    }
}
exports.Vector = Vector;
//# sourceMappingURL=Vector.js.map