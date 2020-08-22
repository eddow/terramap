import Point, {Coords} from './point'
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
	ends: Ends;
	middle?: Point;
	division?: [Edge, Edge];
	referents?: [Edge, Edge?]
	constructor(ends: Ends) {
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
		var coords = <Coords>[0,1,2].map(i=> (ends[0].coords[i]+ends[1].coords[i])/2);
		this.middle = new Point(coords, (ends[0].height+ends[1].height)/2);
		this.division = [
			new Edge([this.ends[0], this.middle]),
			new Edge([this.ends[1], this.middle])
		];
		for(let i in this.directed) {
			let directed = this.directed[i];
			let triangle = directed.borderOf;
			console.assert(triangle.innerEdges.length < 3, "No edge over-division");
			switch(triangle.innerEdges.length) {
			case 0:
				var opposite = triangle.points.findIndex(p => !~ends.indexOf(p));
				triangle.cut(opposite, this.division);
				break;
			case 1:
				throw "todo";
				break;
			case 2:
				throw "todo";
				break;
			}
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
		var inverse = false;
		for(let browser : DirectedEdge = this; browser; browser = browser.parent)
			inverse = inverse != browser.inverted;
		return inverse ? [this.ends[1], this.ends[0]] : this.ends;
	}

////// Forwards
	get ends(): Ends { return this.edge.ends; }
	parent?: DirectedEdge;
	get middle(): Point|undefined { return this.edge.middle; }
	get division(): [Edge, Edge]|undefined { return this.edge.division; }
	borderOf: TriangleInterface;
}