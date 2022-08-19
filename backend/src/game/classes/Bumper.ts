import { Pong } from "./Pong"
import { sub, Vector } from "./Vector"

export class Bumper {
	pos : Vector;
	center : Vector;
	diameter : number;

	hit : boolean;
	collision : Vector;
	bounce_vec : Vector;

	constructor(x : number, y : number, diameter : number) {
		this.pos = new Vector([x, y]);
		this.center = new Vector([x + diameter / 2, y + diameter / 2])
		this.collision = new Vector([0, 0]);
		this.bounce_vec = new Vector([0, 0]);
		this.hit = false;
		this.diameter = diameter;
	}

	checkCollision(pong : Pong) : boolean {
		let e = new Vector(pong.center());
		let l = new Vector(pong.centerNextFrame());

		let cp = this.center;
		let r = (this.diameter * 0.85) / 2;

		let d = sub(l, e);
		let f = sub(e, cp);

		let a = d.dot(d);
		let b = 2 * f.dot(d);
		let c = f.dot(f) - r * r;

		let discriminant = b * b - 4 * a * c;
		if (discriminant >= 0) {
			discriminant = Math.sqrt(discriminant);

			let t1 = (-b - discriminant) / (2 * a);
			
			if( t1 >= 0 && t1 <= 1 )
			{
				// t1 is the intersection, and it's closer than t2
				// (since t1 uses -b - discriminant)
				// Impale, Poke
				this.collision.x = e.x + t1;
				this.collision.y = e.y;
				this.hit = true;
				
				this.bounce_vec = sub(this.collision, this.center);
				this.bounce_vec.normalize();
				let vec_pong = new Vector(pong.velocity);
				this.bounce_vec.mult(vec_pong.mag());
				pong.velocity[0] = this.bounce_vec.x;
				pong.velocity[1] = this.bounce_vec.y;
				return true;
			}
		}
		return false;
	}
  }