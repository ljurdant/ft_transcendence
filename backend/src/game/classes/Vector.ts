export function sub(v1 : Vector, v2 : Vector) : Vector {
	let ret : Vector = new Vector([v1.x, v1.y]);
	ret.x -= v2.x;
	ret.y -= v2.y;
	return ret;
}

export class Vector {
	x : number;
	y : number;

	constructor(pos : [number, number]) {
		this.x = pos[0];
		this.y = pos[1];
	}

	add(other : Vector) {
		this.x += other.x;
		this.y += other.y;
	}

	mult(nbr : number) {
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

	dot(other : Vector) : number {
		let ret : number = 0;

		ret += this.x * other.x;
		ret += this.y * other.y;
		return ret;
	}
}