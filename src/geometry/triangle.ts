import Point from './point'
import Edge, {DirectedEdge, TriangleInterface, TrianglePoints} from './edge'
import {Event} from 'typescript.events'

export default class Triangle extends Event implements TriangleInterface {
	outerEdges: [DirectedEdge, DirectedEdge, DirectedEdge];
	innerEdges: [Edge?, Edge?, Edge?];
	points: TrianglePoints;
	d3Object: any
	constructor(edges: [DirectedEdge, DirectedEdge, DirectedEdge]) {
		super();
		this.innerEdges = [];
		this.outerEdges = edges;
		edges.forEach(dg=> {
			dg.borderOf  = this;
		});
		
		const dg = this.outerEdges;
		this.points = [...dg[0].orderedPoints, dg[1].ends[1]];
		console.assert(
			~this.points.indexOf(dg[1].ends[0]) &&
			~this.points.indexOf(dg[2].ends[0]) &&
			~this.points.indexOf(dg[2].ends[1]),
			'Consistant edging of triangle'
		);
	}
	cut(index: number, point: Point) {
		switch(this.innerEdges.length) {
		case 0:
			
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