import Point from './geometry/point'
import Edge, {TrianglePoints, DirectedEdge} from './geometry/edge'
import Triangle from './geometry/triangle'
import ITerraMap, {Generation} from './terraMap.h'

export {Point, Edge, Triangle, TrianglePoints, DirectedEdge}

export default class TerraMap extends ITerraMap {
	summits: [Point, Point, Point, Point];
	edges: [Edge, Edge, Edge, Edge, Edge, Edge];
	faces: [Triangle, Triangle, Triangle, Triangle];
	constructor(generation: Generation) {
		super();
		this.pointComputer = generation.pointComputer;
		var smt = this.summits = [
			new Point(generation.initials[0]),
			new Point(generation.initials[1]),
			new Point(generation.initials[2]),
			new Point(generation.initials[3])
		];
		var edg = this.edges = [
			new Edge(this, [smt[0], smt[1]]),
			new Edge(this, [smt[0], smt[2]]),
			new Edge(this, [smt[0], smt[3]]),
			new Edge(this, [smt[1], smt[2]]),
			new Edge(this, [smt[1], smt[3]]),
			new Edge(this, [smt[2], smt[3]])
		];
		this.faces = [
			new Triangle(this, [
				edg[0].directed[0],
				edg[3].directed[0],
				edg[1].directed[1]
			]),
			new Triangle(this, [
				edg[0].directed[1],
				edg[2].directed[0],
				edg[4].directed[1]
			]),
			new Triangle(this, [
				edg[1].directed[0],
				edg[5].directed[0],
				edg[2].directed[1]
			]),
			new Triangle(this, [
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