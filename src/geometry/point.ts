export type Coords = [number, number, number];
export default class Point {
	coords: Coords;
	constructor(x: number, y: number, z: number, scale: number = 1) {
		this.coords = [x, y, z].map(x => x * scale) as Coords;
	}
}