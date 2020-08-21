import Point, {Coords} from './point'

export type Ends = [Point, Point];

export type TrianglePoints = [Point, Point, Point];
export interface TriangleInterface {
	outerEdges: [DirectedEdge, DirectedEdge, DirectedEdge];
	innerEdges: [Edge?, Edge?, Edge?];
	points: TrianglePoints;
	cut(index: number, point: Point);
}

export default class Edge {
	ends: Ends;
	middle?: Point;
	division?: [Edge, Edge];
	directed: [DirectedEdge, DirectedEdge]
	constructor(ends: Ends) {
		this.directed = [new DirectedEdge(this, 0), new DirectedEdge(this, 1)];
		this.ends = ends;
	}
	divide() {
		//TODO: check if we have a parent -> no division
		console.assert(!this.middle, "No duplicate edge division")
		const ends = this.ends;
		var coords = [0,1,2].map(i=> (ends[0].coords[i]+ends[1].coords[i])/2) as Coords;
		this.middle = new Point(coords, (ends[0].height+ends[1].height)/2);
		this.division = [
			new Edge([this.ends[0], this.middle]),
			new Edge([this.middle, this.ends[1]])
		];
		for(let i in this.directed) {
			let directed = this.directed[i];
			let triangle = directed.borderOf;
			console.assert(triangle.innerEdges.length < 3, "No edge over-division");
			switch(triangle.innerEdges.length) {
			case 0:
				var opposite = triangle.points.findIndex(p => !~ends.indexOf(p));
				triangle.cut(opposite, this.middle);
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
	get orderedPoints() : Ends {
		var straight = false;
		for(let browser : DirectedEdge = this; browser; browser = browser.parent)
			straight = straight != browser.inverted;
		return straight ? this.ends : [this.ends[1], this.ends[0]];
	}

////// Forwards
	get ends(): Ends { return this.edge.ends; }
	parent?: DirectedEdge;
	get middle(): Point|undefined { return this.edge.middle; }
	get division(): [Edge, Edge]|undefined { return this.edge.division; }
	borderOf: TriangleInterface;
}