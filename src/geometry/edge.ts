import ITerraMap from '../terraMap.h'
import {LazyGetter} from 'lazy-get-decorator'

export type Ends<P> = [P, P];

export type TrianglePoints<P> = [P, P, P];
export interface ITriangle<E,P> {
	outerEdges: [DirectedEdge<E,P>, DirectedEdge<E,P>, DirectedEdge<E,P>];
	innerEdges: [Edge<E,P>?, Edge<E,P>?, Edge<E,P>?];
	points: TrianglePoints<P>;
	cut(index: number, subEdges: [Edge<E,P>, Edge<E,P>]);
}

export default class Edge<E,P> {
	TM: ITerraMap<P>
	ends: Ends<P>;
	middle?: P;
	division?: [Edge<E,P>, Edge<E,P>];
	referents?: [Edge<E,P>, Edge<E,P>?]
	data: E
	constructor(TM: ITerraMap<P>, ends: Ends<P>, data?: E) {
		this.TM = TM;
		this.data = data;
		this.ends = ends;
	}
	@LazyGetter()
	get directed(): [DirectedEdge<E,P>, DirectedEdge<E,P>] {
		return [new DirectedEdge<E,P>(this, 0), new DirectedEdge<E,P>(this, 1)];
	}

	divide() {
		console.assert(!this.referents, "No division of helper edge")
		console.assert(!this.middle, "No duplicate edge division")
		const ends = this.ends;
		this.middle = this.TM.pointComputer([ends[0], ends[1]]);
		this.division = [
			new Edge<E,P>(this.TM, [this.ends[0], this.middle]),
			new Edge<E,P>(this.TM, [this.ends[1], this.middle])
		];
		for(let i in this.directed) {
			let directed = this.directed[i];
			let triangle = directed.borderOf;
			console.assert(triangle, "All directed edges are bording a triangle");
			console.assert(triangle.innerEdges.length < 3, "No edge over-division");
			var opposite = triangle.points.findIndex(p => !~ends.indexOf(p));
			triangle.cut(opposite, this.division);
		}
	}
}

export class DirectedEdge<E,P> {
	edge: Edge<E,P>
	inverted: boolean
	constructor(edge: Edge<E,P>, inverted: number|boolean) {
		this.edge = edge;
		this.inverted = !!inverted;
	}
	@LazyGetter()
	get orderedPoints() : Ends<P> {
		return this.inverted ? [this.ends[1], this.ends[0]] : this.ends;
	}

////// Forwards
	get ends(): Ends<P> { return this.edge.ends; }
	get middle(): P|undefined { return this.edge.middle; }
	get division(): [Edge<E,P>, Edge<E,P>]|undefined { return this.edge.division; }
	borderOf: ITriangle<E,P>;
}