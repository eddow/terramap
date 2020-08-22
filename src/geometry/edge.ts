import Point from './point'
import ITerraMap from '../terraMap.h'
import {LazyGetter} from 'lazy-get-decorator'

export type Ends = [Point, Point];

export type TrianglePoints = [Point, Point, Point];
export interface TriangleInterface {
	outerEdges: [DirectedEdge, DirectedEdge, DirectedEdge];
	innerEdges: [Edge?, Edge?, Edge?];
	points: TrianglePoints;
	cut(index: number, subEdges: [Edge, Edge]);
}

export default class Edge {
	TM: ITerraMap
	ends: Ends;
	middle?: Point;
	division?: [Edge, Edge];
	referents?: [Edge, Edge?]
	data: any
	constructor(TM: ITerraMap, ends: Ends, data?: any) {
		this.TM = TM;
		this.data = data;
		this.ends = ends;
	}
	@LazyGetter()
	get directed(): [DirectedEdge, DirectedEdge] {
		return [new DirectedEdge(this, 0), new DirectedEdge(this, 1)];
	}

	divide() {
		console.assert(!this.referents, "No division of helper edge")
		console.assert(!this.middle, "No duplicate edge division")
		const ends = this.ends;
		this.middle = this.TM.pointComputer([ends[0], ends[1]]);
		this.division = [
			new Edge(this.TM, [this.ends[0], this.middle]),
			new Edge(this.TM, [this.ends[1], this.middle])
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

export class DirectedEdge {
	edge: Edge
	inverted: boolean
	constructor(edge: Edge, inverted: number|boolean) {
		this.edge = edge;
		this.inverted = !!inverted;
	}
	@LazyGetter()
	get orderedPoints() : Ends {
		return this.inverted ? [this.ends[1], this.ends[0]] : this.ends;
	}

////// Forwards
	get ends(): Ends { return this.edge.ends; }
	parent?: DirectedEdge;
	get middle(): Point|undefined { return this.edge.middle; }
	get division(): [Edge, Edge]|undefined { return this.edge.division; }
	borderOf: TriangleInterface;
}