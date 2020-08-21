import Point from './geometry/point'
import Edge from './geometry/edge'
import Triangle, {TrianglePoints} from './geometry/triangle'

export {Point, Edge, Triangle, TrianglePoints}

export default class TerraMap {
	summits: [Point, Point, Point, Point];
	edges: [Edge, Edge, Edge, Edge, Edge, Edge];
	faces: [Triangle, Triangle, Triangle, Triangle];
	constructor(scale: number = 1) {
		const s30 = Math.sin(30*Math.PI/180), c30 = Math.cos(30*Math.PI/180);
		var smt = this.summits = [
			new Point(0, 0, 1, scale),
			new Point(0, c30, -s30, scale),
			new Point(c30*c30, -c30*s30, -s30, scale),
			new Point(-c30*c30, -c30*s30, -s30, scale)
		];
		var edg = this.edges = [
			new Edge(smt[0], smt[1]),
			new Edge(smt[0], smt[2]),
			new Edge(smt[0], smt[3]),
			new Edge(smt[1], smt[2]),
			new Edge(smt[1], smt[3]),
			new Edge(smt[2], smt[3])
		];
		this.faces = [
			new Triangle(edg[0], edg[3], edg[1]),
			new Triangle(edg[0], edg[4], edg[2]),
			new Triangle(edg[1], edg[5], edg[2]),
			new Triangle(edg[3], edg[4], edg[5])
		];
	}
	get triangles() : TrianglePoints[] {
		return this.faces.map(t => t.points);
	}
}