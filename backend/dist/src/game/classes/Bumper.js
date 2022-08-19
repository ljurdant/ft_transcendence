"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bumper = void 0;
const Vector_1 = require("./Vector");
class Bumper {
    constructor(x, y, diameter) {
        this.pos = new Vector_1.Vector([x, y]);
        this.center = new Vector_1.Vector([x + diameter / 2, y + diameter / 2]);
        this.collision = new Vector_1.Vector([0, 0]);
        this.bounce_vec = new Vector_1.Vector([0, 0]);
        this.hit = false;
        this.diameter = diameter;
    }
    checkCollision(pong) {
        let e = new Vector_1.Vector(pong.center());
        let l = new Vector_1.Vector(pong.centerNextFrame());
        let cp = this.center;
        let r = (this.diameter * 0.85) / 2;
        let d = (0, Vector_1.sub)(l, e);
        let f = (0, Vector_1.sub)(e, cp);
        let a = d.dot(d);
        let b = 2 * f.dot(d);
        let c = f.dot(f) - r * r;
        let discriminant = b * b - 4 * a * c;
        if (discriminant >= 0) {
            discriminant = Math.sqrt(discriminant);
            let t1 = (-b - discriminant) / (2 * a);
            if (t1 >= 0 && t1 <= 1) {
                this.collision.x = e.x + t1;
                this.collision.y = e.y;
                this.hit = true;
                this.bounce_vec = (0, Vector_1.sub)(this.collision, this.center);
                this.bounce_vec.normalize();
                let vec_pong = new Vector_1.Vector(pong.velocity);
                this.bounce_vec.mult(vec_pong.mag());
                pong.velocity[0] = this.bounce_vec.x;
                pong.velocity[1] = this.bounce_vec.y;
                return true;
            }
        }
        return false;
    }
}
exports.Bumper = Bumper;
//# sourceMappingURL=Bumper.js.map