import Point from './point'

export type Ends = [Point, Point];

export interface TriangleInterface {
	OuterEdges: [Edge, Edge, Edge];
	InnerEdges: [Edge?, Edge?, Edge?];
}

export default class Edge {
	ends: Ends;
	middle?: Point;
	parents?: [Edge, Edge];
	borderOf: [TriangleInterface, TriangleInterface];
	constructor(...ends: Ends) {
		this.ends = ends;
		this.borderOf = [null, null];
	}
}