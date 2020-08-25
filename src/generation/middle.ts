import {Generation} from '../ITerraMap'
import {LazyGetter} from 'lazy-get-decorator'

export type Coords = [number, number, number];

export class Point {
	coords: Coords
	color: Coords
	constructor(coords: Coords, height: number, color: Coords) {
		let [x, y, z] = coords;
		let actualHeight = Math.sqrt(x*x + y*y + z*z);
		this.coords = <Coords>coords.map(x => x * height/actualHeight);
		this.color = color;
	}
	@LazyGetter()
	get height(): number {
		let [x, y, z] = this.coords;
		return Math.sqrt(x*x + y*y + z*z);
	}
}

export default (scale: number = 1): Generation<Point>=> {
	const s30 = Math.sin(Math.PI/6), c30 = Math.cos(Math.PI/6);
	return {
		initials: [
			new Point([0, 0, 1], scale, [1, 0, 0]),
			new Point([0, c30, -s30], scale, [0, 1, 0]),
			new Point([c30*c30, -c30*s30, -s30], scale, [0, 0, 1]),
			new Point([-c30*c30, -c30*s30, -s30], scale, [.5, .5, .5])
		],
		pointComputer(points: [Point, Point]): Point {
			return new Point(
				<Coords>[0,1,2].map(i=> (points[0].coords[i]+points[1].coords[i])/2),
				(points[0].height+points[1].height)/2,
				<Coords>points[0].color.map((c, i)=> (c+points[1].color[i])/2)
			);
		}
	};
};