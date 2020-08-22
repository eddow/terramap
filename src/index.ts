import Point from './geometry/point'
import Edge, {TrianglePoints, DirectedEdge} from './geometry/edge'
import Triangle from './geometry/triangle'

export {Point, Edge, Triangle, TrianglePoints, DirectedEdge}

export default class TerraMap {
	summits: [Point, Point, Point, Point];
	edges: [Edge, Edge, Edge, Edge, Edge, Edge];
	faces: [Triangle, Triangle, Triangle, Triangle];
	constructor(scale: number = 1) {
		const s30 = Math.sin(30*Math.PI/180), c30 = Math.cos(30*Math.PI/180);
		var smt = this.summits = [
			new Point([0, 0, 1], scale),
			new Point([0, c30, -s30], scale),
			new Point([c30*c30, -c30*s30, -s30], scale),
			new Point([-c30*c30, -c30*s30, -s30], scale)
		];
		var edg = this.edges = [
			new Edge([smt[0], smt[1]]),
			new Edge([smt[0], smt[2]]),
			new Edge([smt[0], smt[3]]),
			new Edge([smt[1], smt[2]]),
			new Edge([smt[1], smt[3]]),
			new Edge([smt[2], smt[3]])
		];
		this.faces = [
			new Triangle([
				edg[0].directed[0],
				edg[3].directed[0],
				edg[1].directed[1]
			]),
			new Triangle([
				edg[0].directed[1],
				edg[2].directed[0],
				edg[4].directed[1]
			]),
			new Triangle([
				edg[1].directed[0],
				edg[5].directed[0],
				edg[2].directed[1]
			]),
			new Triangle([
				edg[5].directed[1],
				edg[3].directed[1],
				edg[4].directed[0]
			])
		];
		
	}
	get triangles() : TrianglePoints[] {
		return this.faces.map(t => t.points);
	}
}