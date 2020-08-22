import GEdge, {TrianglePoints, DirectedEdge} from './geometry/edge'
import GTriangle from './geometry/triangle'
import ITerraMap, {Generation} from './terraMap.h'

export {GEdge, GTriangle, TrianglePoints, DirectedEdge}

export default class TerraMap<T,E,P> extends ITerraMap<P> {
	summits: [P, P, P, P];
	edges: [GEdge<E,P>, GEdge<E,P>, GEdge<E,P>, GEdge<E,P>, GEdge<E,P>, GEdge<E,P>];
	faces: [GTriangle<T,E,P>, GTriangle<T,E,P>, GTriangle<T,E,P>, GTriangle<T,E,P>];
	constructor(generation: Generation<P>) {
		super();
		this.pointComputer = generation.pointComputer;
		var smt = this.summits = [
			generation.initials[0],
			generation.initials[1],
			generation.initials[2],
			generation.initials[3]
		];
		var edg = this.edges = [
			new GEdge<E,P>(this, [smt[0], smt[1]]),
			new GEdge<E,P>(this, [smt[0], smt[2]]),
			new GEdge<E,P>(this, [smt[0], smt[3]]),
			new GEdge<E,P>(this, [smt[1], smt[2]]),
			new GEdge<E,P>(this, [smt[1], smt[3]]),
			new GEdge<E,P>(this, [smt[2], smt[3]])
		];
		this.faces = [
			new GTriangle<T,E,P>(this, [
				edg[0].directed[0],
				edg[3].directed[0],
				edg[1].directed[1]
			]),
			new GTriangle<T,E,P>(this, [
				edg[0].directed[1],
				edg[2].directed[0],
				edg[4].directed[1]
			]),
			new GTriangle<T,E,P>(this, [
				edg[1].directed[0],
				edg[5].directed[0],
				edg[2].directed[1]
			]),
			new GTriangle<T,E,P>(this, [
				edg[5].directed[1],
				edg[3].directed[1],
				edg[4].directed[0]
			])
		];
		
	}
	get triangles() : TrianglePoints<P>[] {
		return this.faces.map(t => t.points);
	}
}