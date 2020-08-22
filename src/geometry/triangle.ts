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
			var undividedNdx = this.outerEdges.findIndex(edge=> !edge.middle),
				undivided = this.outerEdges[undividedNdx],
				nEdge = this.outerEdges[(undividedNdx+1)%3],	//next edge (from undivided)
				pEdge = this.outerEdges[(undividedNdx+2)%3],	//previous edge (from undivided)
				barEdge = new Edge([	//The one that will stay in full division
					nEdge.middle,
					pEdge.middle
				]), crossEdge = new Edge([	//The one that crosses the parallelipiped
					nEdge.middle,
					undivided.orderedPoints[0]
				]),
				peNdx = {	//parralelipiped edge, sub-triangle edge
					nxt: (undivided.orderedPoints[1] === nEdge.division[0].ends[0]) ? 0 : 1,
					prv: (undivided.orderedPoints[0] === pEdge.division[0].ends[0]) ? 0 : 1,
				},
				pEdges = {nxt: nEdge.division[peNdx.nxt], prv: pEdge.division[peNdx.prv]},
				stEdges = {nxt: nEdge.division[1-peNdx.nxt], prv: pEdge.division[1-peNdx.prv]};
			this.innerEdges = [barEdge, crossEdge];
			crossEdge.referents = barEdge.referents = [
				(barEdge.directed[0].parent = barEdge.directed[1].parent = undivided).edge
			];
			// parralelipiped half - along the outer-edge
			this.emit('add', new Triangle([undivided, pEdges.nxt.directed[0], crossEdge.directed[1]]));
			// parralelipiped half - along the inner-edge
			this.emit('add', new Triangle([barEdge.directed[0], pEdges.prv.directed[1], crossEdge.directed[1]]));
			// sub-triangle remaining on over-division
			this.emit('add', new Triangle([stEdges.nxt.directed[1], stEdges.prv.directed[0], barEdge.directed[1]]));
			break;
		case 2:
			midEdge = this.innerEdges[0];
			this.emit('remove', midEdge.directed[0].borderOf);
			this.emit('remove', midEdge.directed[1].borderOf);
			throw "todo";
			break;
		}
	}
}