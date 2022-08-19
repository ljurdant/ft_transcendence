"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relativeIntersection = exports.getLineIntersection = exports.randomRoomId = void 0;
function randomRoomId() {
    let room_id = Math.random().toString(36).substring(2, 8);
    let i = -1;
    while ((i = room_id.indexOf("O")) !== -1)
        room_id = room_id.replace("O", "o");
    while ((i = room_id.indexOf("l")) !== -1)
        room_id = room_id.replace("l", "2");
    while ((i = room_id.indexOf("1")) !== -1)
        room_id = room_id.replace("1", "p");
    return (room_id);
}
exports.randomRoomId = randomRoomId;
function getLineIntersection(p0, p1, p2, p3) {
    let s1 = [p1[0] - p0[0], p1[1] - p0[1]];
    let s2 = [p3[0] - p2[0], p3[1] - p2[1]];
    let s = (-s1[1] * (p0[0] - p2[0]) + s1[0] * (p0[1] - p2[1])) / (-s2[0] * s1[1] + s1[0] * s2[1]);
    let t = (s2[0] * (p0[1] - p2[1]) - s2[1] * (p0[0] - p2[0])) / (-s2[0] * s1[1] + s1[0] * s2[1]);
    let i = [-1, -1, "side"];
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        i[0] = p0[0] + (t * s1[0]);
        i[1] = p0[1] + (t * s1[1]);
        return i;
    }
    return i;
}
exports.getLineIntersection = getLineIntersection;
function relativeIntersection(intersection_point, p1, p2) {
    let middle = [p1[0] + (p2[0] - p1[0]) / 2 - intersection_point[0], p1[1] + (p2[1] - p1[1]) / 2 - intersection_point[1]];
    if (intersection_point[2] === "side")
        return middle[1] / ((p2[1] - p1[1]) / 2) * ((3 * Math.PI) / 12);
    else
        return middle[0] / ((p2[0] - p1[0]) / 2) * ((3 * Math.PI) / 12);
}
exports.relativeIntersection = relativeIntersection;
//# sourceMappingURL=utils.js.map