import Point from './point'
import Edge, {DirectedEdge, TriangleInterface, TrianglePoints} from './edge'
import {Event} from 'typescript.events'
import {LazyGetter} from 'lazy-get-decorator'

export default class Triangle extends Event implements TriangleInterface {
	outerEdges: [DirectedEdge, DirectedEdge, DirectedEdge];
	innerEdges: [Edge?, Edge?, Edge?];
	d3Object: any
	constructor(edges: [DirectedEdge, DirectedEdge, DirectedEdge]) {
		super();
		this.innerEdges = [];
		this.outerEdges = edges;
		edges.forEach(dg=> {
			dg.borderOf  ??= this;
		});
	}
	@LazyGetter()
	get points(): TrianglePoints {
		const dg = this.outerEdges;
		const points = <TrianglePoints>[...dg[0].orderedPoints, dg[1].orderedPoints[1]];
		console.assert(
			~points.indexOf(dg[1].ends[0]) &&
			~points.indexOf(dg[2].ends[0]) &&
			~points.indexOf(dg[2].ends[1]),
			'Consistant edging of triangle'
		);
		return points;
	}
	cut(index: number, subEdges: [Edge, Edge]) {
		let middle = subEdges[0].ends[1];
		let midEdge;
		console.assert(middle === subEdges[1].ends[1], "Edge division consistant: [AM, BM]");
		switch(this.innerEdges.length) {
		case 0:
			midEdge = new Edge([middle, this.outerEdges[index].orderedPoints[0]]);
			midEdge.referents = [null];
			this.innerEdges[0] = midEdge;
			this.emit('remove', this);
			for(let i=0; i<2; ++i) {
				let sideEdge = this.outerEdges[(index+i+2)%3];
				midEdge.referents[i] = sideEdge.edge;
				let extrPt = sideEdge.orderedPoints[i];
				let subEdge = subEdges[0];
				let iop = subEdge.ends.indexOf(extrPt);
				if(!~iop) {
					subEdge = subEdges[1];
					iop = subEdge.ends.indexOf(extrPt);
				}
				let subTriangle = new Triangle(i?
					[sideEdge, subEdge.directed[0], midEdge.directed[0]]:
					[subEdge.directed[1], sideEdge, midEdge.directed[1]]
				);
				this.emit('add', subTriangle);
			}
			break;
		case 1:
			midEdge = this.innerEdges[0];
			this.emit('remove', midEdge.directed[0].borderOf);
			this.emit('remove', midEdge.directed[1].borderOf);
			var undividedNdx = this.outerEdges.findIndex(edge=> !edge.middle);
			var barEdge = new Edge([	//The one that will stay in full division
				this.outerEdges[(undividedNdx+1)%3].middle,
				this.outerEdges[(undividedNdx+2)%3].middle
			]);
			throw "todo";
			break;
		case 2:
			throw "todo";
			break;
		}
	}
}