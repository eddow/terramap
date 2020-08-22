import {Generation} from '../terraMap.h'
import Point from '../geometry/point'

export type Coords = [number, number, number];

function makePointData(coords: Coords, height: number, colors: number[]) {
	let [x, y, z] = coords;
	let actualHeight = Math.sqrt(x*x + y*y + z*z);
	return {
		height: height,
		coords: <Coords>coords.map(x => x * height/actualHeight),
		colors
	};
}
export default (scale: number = 1): Generation=> {
	const s30 = Math.sin(30*Math.PI/180), c30 = Math.cos(30*Math.PI/180);
	return {
		initials: [
			makePointData([0, 0, 1], scale, [.5, .5, .5]),
			makePointData([0, c30, -s30], scale, [1, 0, 0]),
			makePointData([c30*c30, -c30*s30, -s30], scale, [0, 1, 0]),
			makePointData([-c30*c30, -c30*s30, -s30], scale, [0, 0, 1])
		],
		pointComputer(points: [Point, Point]): Point {
			return new Point(makePointData(
				<Coords>[0,1,2].map(i=> (points[0].data.coords[i]+points[1].data.coords[i])/2),
				(points[0].data.height+points[1].data.height)/2,
				points[0].data.colors.map((c, i)=> (c+points[1].data.colors[i])/2)
			));
		}
	};
};