export function randomRoomId() {
	let room_id : string = Math.random().toString(36).substring(2, 8);
	let i : number = -1;
	while ((i = room_id.indexOf("O")) !== -1)
		room_id = room_id.replace("O", "o");
	while ((i = room_id.indexOf("l")) !== -1)
		room_id = room_id.replace("l", "2");
	while ((i = room_id.indexOf("1")) !== -1)
		room_id = room_id.replace("1", "p");
	return (room_id);
}

// Returns 1 if the lines intersect, otherwise 0. In addition, if the lines 
// intersect the intersection point may be stored in the floats i[0] and i[1].
export function getLineIntersection(p0 : [number, number], p1 : [number, number], p2 : [number, number], p3 : [number, number]) : [number, number, string] {
	let s1 : [number, number] = [p1[0] - p0[0], p1[1] - p0[1]];
	let s2 : [number, number] = [p3[0] - p2[0], p3[1] - p2[1]];

	let s : number = (-s1[1] * (p0[0] - p2[0]) + s1[0] * (p0[1] - p2[1])) / (-s2[0] * s1[1] + s1[0] * s2[1]);
	let t : number = ( s2[0] * (p0[1] - p2[1]) - s2[1] * (p0[0] - p2[0])) / (-s2[0] * s1[1] + s1[0] * s2[1]);

	let i : [number, number, string] = [-1, -1, "side"];
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        // Collision detected
        i[0] = p0[0] + (t * s1[0]);
        i[1] = p0[1] + (t * s1[1]);
        return i;
    }

    return i; // No collision
}

export function relativeIntersection(intersection_point : [number, number, string], p1 : [number, number], p2 : [number, number]) : number {
	let middle : [number, number] = [p1[0] + (p2[0] - p1[0]) / 2 - intersection_point[0], p1[1] + (p2[1] - p1[1]) / 2 - intersection_point[1]];

	if (intersection_point[2] === "side")
		return middle[1] / ((p2[1] - p1[1]) / 2) * ((3 * Math.PI) / 12);
	else
		return middle[0] / ((p2[0] - p1[0]) / 2) * ((3 * Math.PI) / 12);
}