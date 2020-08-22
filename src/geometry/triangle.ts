import Point from './point'
import Edge, {DirectedEdge, TriangleInterface, TrianglePoints} from './edge'
import {Event} from 'typescript.events'
import {LazyGetter} from 'lazy-get-decorator'

type Edges = [DirectedEdge, DirectedEdge, DirectedEdge];

export default class Triangle extends Event implements TriangleInterface {
	outerEdges: [DirectedEdge, DirectedEdge, DirectedEdge];
	innerEdges: [Edge?, Edge?, Edge?];
	d3Object: any
	constructor(edges: Edges) {
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
			dg[0].orderedPoints[1] == dg[1].orderedPoints[0] &&
			dg[1].orderedPoints[1] == dg[2].orderedPoints[0] &&
			dg[2].orderedPoints[1] == dg[0].orderedPoints[0],
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
			let undividedNdx = this.outerEdges.findIndex(edge=> !edge.middle),
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
			crossEdge.referents = barEdge.referents = [undivided.edge];
			// parralelipiped half - along the outer-edge
			this.emit('add', new Triangle([undivided, pEdges.nxt.directed[0], crossEdge.directed[0]]));
			// parralelipiped half - along the inner-edge
			this.emit('add', new Triangle([barEdge.directed[0], pEdges.prv.directed[1], crossEdge.directed[1]]));
			// sub-triangle remaining on over-division
			this.emit('add', new Triangle([stEdges.nxt.directed[1], stEdges.prv.directed[0], barEdge.directed[1]]));
			break;
		case 2:
			let already = this.innerEdges[0];
			delete already.referents;
			midEdge = this.innerEdges[1];
			this.emit('remove', midEdge.directed[0].borderOf);
			this.emit('remove', midEdge.directed[1].borderOf);

			index = (index+1)%3;
			if(index) this.innerEdges[index] = this.innerEdges[0];
			this.innerEdges[(index+1)%3] = new Edge([already.ends[1], middle]);
			this.innerEdges[(index+2)%3] = new Edge([middle, already.ends[0]]);

			// inside sub-triangle
			this.emit('add', new Triangle(<Edges>this.innerEdges.map(edge => edge.directed[0])));
			for(let i = index+1; (i=i%3) !== index; ++i) {
				let extSummit = this.points[(i+2)%3],
					nEdge = this.outerEdges[(i+1)%3],
					pEdge = this.outerEdges[(i+2)%3];
				nEdge = nEdge.division[nEdge.division[0].ends[0] === extSummit ? 0 : 1].directed[1];
				pEdge = pEdge.division[pEdge.division[0].ends[0] === extSummit ? 0 : 1].directed[0];
				this.emit('add', new Triangle([this.innerEdges[i].directed[1], nEdge, pEdge]));
			}
			break;
		default:
			console.assert(false, "Cut only uncut triangles")
			break;
		}
	}
}