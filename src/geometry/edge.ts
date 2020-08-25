import ITerraMap from '../ITerraMap'
import {LazyGetter} from 'lazy-get-decorator'

export type Ends<P> = [P, P];


export type Edges<E,P> = [DirectedEdge<E,P>, DirectedEdge<E,P>, DirectedEdge<E,P>];
export type TrianglePoints<P> = [P, P, P];
export interface ITriangle<E,P> {
	TM: ITerraMap<P>
	outerEdges: [DirectedEdge<E,P>, DirectedEdge<E,P>, DirectedEdge<E,P>];
	innerEdges: [Edge<E,P>?, Edge<E,P>?, Edge<E,P>?];
	points: TrianglePoints<P>;
	cut(index: number, subEdges: [Edge<E,P>, Edge<E,P>]);
	uncut(index: number, edge: Edge<E,P>);
	remove(markEdges?: boolean);
	addSub(edges: Edges<E,P>);
}

export default class Edge<E,P> {
	TM: ITerraMap<P>
	ends: Ends<P>;
	division?: [Edge<E,P>, Edge<E,P>];
	/**
	 * Referents are undivided edges that should be divided before this edge could be divided.
	 */
	readonly referents: Set<Edge<E,P>>;
	readonly referedBy: Set<Edge<E,P>>;
	data: E;
	parent?: Edge<E,P>;
	// TODO: uid for debug purpose only
	uid: number;
	static ctr: number = 0;
	constructor(TM: ITerraMap<P>, ends: Ends<P>, data?: E) {
		this.uid = Edge.ctr++;
		this.TM = TM;
		this.data = data;
		this.ends = ends;
		this.referents = new Set<Edge<E,P>>();
		this.referedBy = new Set<Edge<E,P>>();
	}
	get undividedReferents(): Edge<E,P>[] {
		var rv = [];
		for(let e of this.referents)
			if(!e.division)
				rv.push(e);
		return rv;
	}
	@LazyGetter()
	get directed(): [DirectedEdge<E,P>, DirectedEdge<E,P>] {
		return [new DirectedEdge<E,P>(this, 0), new DirectedEdge<E,P>(this, 1)];
	}

	get middle(): P {
		return !this.division ? null : this.division[0].ends[1];
	}

	/**
	 * Divide an undivided edge in 2 and keep the bordering triangles up to date
	 */
	divide(recursive?: boolean) {
		console.assert(!this.division, "No duplicate edge division");
		if(recursive) {
			for(let r of this.undividedReferents)
				r.divide(recursive);
			if(this.division) return;
		} else
			console.assert(!this.undividedReferents.length, "No division of helper edge")
		const ends = this.ends;
		const middle = this.TM.pointComputer([ends[0], ends[1]]);
		this.division = [
			new Edge<E,P>(this.TM, [this.ends[0], middle]),
			new Edge<E,P>(this.TM, [this.ends[1], middle])
		];
		for(let e of this.division) e.parent = this;
		for(let i in this.directed) {
			let directed = this.directed[i];
			let triangle = directed.borderOf;
			console.assert(triangle, "All directed edges are bording a triangle");
			console.assert(triangle.innerEdges.length < 3, "No edge over-division");
			var opposite = triangle.points.findIndex(p => !~ends.indexOf(p));
			triangle.cut(opposite, this.division);
		}
	}

	/**
	 * Merge a divided edge and keep the bordering triangles up to date
	 */
	merge(recursive?: boolean) {
		console.assert(this.division, "Merge only divided edges")
		var subMerge = this.division.concat(
			[...this.referedBy],
			this.directed[0].borderOf.innerEdges,
			this.directed[1].borderOf.innerEdges
		);
		if(recursive) {
			for(let e of subMerge)
				if(e.division)
					e.merge(recursive);
			if(!this.division) return;
		} else
			console.assert(this.division.every(e=> !e.division && !e.referedBy.size), "Edge to merge has no subDivision");
		const ends = this.ends;
		this.TM.emit('deleteEdges', this.division)
		delete this.division;
		console.log(this.uid);
		for(let i in this.directed) {
			let directed = this.directed[i];
			let triangle = directed.borderOf;
			console.assert(triangle, "All directed edges are bording a triangle");
			console.assert(triangle.innerEdges.length > 0, "Merged triangles are divided");
			var opposite = triangle.points.findIndex(p => !~ends.indexOf(p));
			triangle.uncut(opposite, this);
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
	get referents(): Set<Edge<E,P>> { return this.edge.referents; }
	get referedBy(): Set<Edge<E,P>> { return this.edge.referedBy; }
	get division(): [Edge<E,P>, Edge<E,P>]|undefined { return this.edge.division; }
	borderOf: ITriangle<E,P>;
}