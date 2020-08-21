export type Coords = [number, number, number];
export default class Point {
	coords: Coords;
	height: number;
	constructor(coords: [number, number, number], height: number = 1) {
		let [x, y, z] = coords;
		let actualHeight = Math.sqrt(x*x + y*y + z*z);
		this.coords = coords.map(x => x * height/actualHeight) as Coords;
	}
}