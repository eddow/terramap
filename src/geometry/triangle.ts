import Edge, {DirectedEdge, ITriangle, TrianglePoints, Edges} from './edge'
import ITerraMap from '../terraMap.h'
import {LazyGetter} from 'lazy-get-decorator'
import {divide1} from './divisions'

export default class Triangle<T,E,P> implements ITriangle<E,P> {
	TM: ITerraMap<P>
	outerEdges: [DirectedEdge<E,P>, DirectedEdge<E,P>, DirectedEdge<E,P>];
	innerEdges: [Edge<E,P>?, Edge<E,P>?, Edge<E,P>?];
	data: T
	constructor(TM: ITerraMap<P>, edges: Edges<E,P>, data?: T) {
		this.TM = TM;
		this.data = data;
		this.innerEdges = [];
		this.outerEdges = edges;
	}
	add() {
		this.outerEdges.forEach(dg=> {
			dg.borderOf ??= this;
		});
		this.TM.emit('add', this);
	}
	remove(markEdges: boolean = true) {
		if(markEdges) this.outerEdges.forEach(dg=> {
			if(dg.borderOf === this) delete dg.borderOf;
		});
		this.TM.emit('remove', this);
	}
	addSub(edges: Edges<E,P>) {
		(new Triangle<T,E,P>(this.TM, edges)).add();
	}
	divide() {
		for(let e of this.outerEdges)
			if(!e.middle)
				e.edge.divide();
	}
	@LazyGetter()
	get points(): TrianglePoints<P> {
		const dg = this.outerEdges;
		const points = <TrianglePoints<P>>[...dg[0].orderedPoints, dg[1].orderedPoints[1]];
		console.assert(
			dg[0].orderedPoints[1] == dg[1].orderedPoints[0] &&
			dg[1].orderedPoints[1] == dg[2].orderedPoints[0] &&
			dg[2].orderedPoints[1] == dg[0].orderedPoints[0],
			'Consistant edging of triangle'
		);
		return points;
	}

	cut(index: number, subEdges: [Edge<E,P>, Edge<E,P>]) {
    let midEdge;
		switch(this.innerEdges.length) {
		case 0:
      divide1(this, index, subEdges);
			break;
		case 1:
			midEdge = this.innerEdges[0];
			midEdge.directed[0].borderOf.remove();
			midEdge.directed[1].borderOf.remove();
			let undividedNdx = this.outerEdges.findIndex(edge=> !edge.middle);
			console.assert(~undividedNdx, "There exist one undivided side when only one innerEdge")
			let undivided = this.outerEdges[undividedNdx],
				nEdge = this.outerEdges[(undividedNdx+1)%3],	//next edge (from undivided)
				pEdge = this.outerEdges[(undividedNdx+2)%3],	//previous edge (from undivided)
				barEdge = new Edge<E,P>(this.TM, [	//The one that will stay in full division
					nEdge.middle,
					pEdge.middle
				]), crossEdge = new Edge<E,P>(this.TM, [	//The one that crosses the parallelipiped
					nEdge.middle,
					undivided.orderedPoints[0]
				]),
				peNdx = {	//parallelepiped edge, sub-triangle edge
					nxt: (undivided.orderedPoints[1] === nEdge.division[0].ends[0]) ? 0 : 1,
					prv: (undivided.orderedPoints[0] === pEdge.division[0].ends[0]) ? 0 : 1,
				},
				pEdges = {nxt: nEdge.division[peNdx.nxt], prv: pEdge.division[peNdx.prv]},
				stEdges = {nxt: nEdge.division[1-peNdx.nxt], prv: pEdge.division[1-peNdx.prv]};
			this.innerEdges = [barEdge, crossEdge];
			crossEdge.referents = barEdge.referents = [undivided.edge];
			// parallelepiped half - along the outer-edge
			this.addSub([undivided, pEdges.nxt.directed[0], crossEdge.directed[0]]);
			// parallelepiped half - along the inner-edge
			this.addSub([barEdge.directed[0], pEdges.prv.directed[1], crossEdge.directed[1]]);
			// sub-triangle remaining on over-division
			this.addSub([stEdges.nxt.directed[1], stEdges.prv.directed[0], barEdge.directed[1]]);
			break;
		case 2:
      let middle = subEdges[0].ends[1];
      console.assert(middle === subEdges[1].ends[1], "Edge division consistant: [AM, BM]");
			let already = this.innerEdges[0];
			delete already.referents;
			midEdge = this.innerEdges[1];
			midEdge.directed[0].borderOf.remove();
			midEdge.directed[1].borderOf.remove();

			index = (index+1)%3;
			if(index) this.innerEdges[index] = this.innerEdges[0];
			this.innerEdges[(index+1)%3] = new Edge<E,P>(this.TM, [already.ends[1], middle]);
			this.innerEdges[(index+2)%3] = new Edge<E,P>(this.TM, [middle, already.ends[0]]);
			this.TM.emit('divided', this);
			// inside sub-triangle
			this.addSub(<Edges<E,P>>this.innerEdges.map(edge => edge.directed[0]));
			for(let i = index+1; (i=i%3) !== index; ++i) {
				let extSummit = this.points[(i+2)%3],
					nEdge = this.outerEdges[(i+1)%3],
					pEdge = this.outerEdges[(i+2)%3];
				nEdge = nEdge.division[nEdge.division[0].ends[0] === extSummit ? 0 : 1].directed[1];
				pEdge = pEdge.division[pEdge.division[0].ends[0] === extSummit ? 0 : 1].directed[0];
				this.addSub([this.innerEdges[i].directed[1], nEdge, pEdge]);
			}
			break;
		default:
			console.assert(false, "Cut only uncut triangles")
			break;
		}
	}
	uncut(index: number, edge: Edge<E,P>) {
    console.assert(this.outerEdges.every(e=> e.borderOf === this),
      "Outer edges' `borderOf` are kept on the main triangle");
    switch(this.innerEdges.length) {
    case 1:
      let midEdge = this.innerEdges.pop();
      this.TM.emit('remove', midEdge.directed[0].borderOf);
      this.TM.emit('remove', midEdge.directed[1].borderOf);
      // 1-division merged => just re-add the plain triangle
      this.TM.emit('add', this);  //No need to set `borderOf` as they should have been kept
      break;
    case 2:
      let [barEdge, crossEdge] = this.innerEdges;
      this.innerEdges = [];
      
      this.TM.emit('remove', crossEdge.directed[0].borderOf);
      this.TM.emit('remove', crossEdge.directed[1].borderOf);
      this.TM.emit('remove', barEdge.directed[1].borderOf);

      let divided = this.outerEdges.find(e=> e.middle);
			index = this.points.findIndex(p => !~divided.ends.indexOf(p));
      divide1(this, index, divided.division);
      break;
		default:
			console.assert(false, "Uncut only cut triangles")
			break;
    }
	}
}