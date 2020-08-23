import Edge, {DirectedEdge, ITriangle, TrianglePoints, Edges} from './edge'
import ITerraMap from '../terraMap.h'
import {LazyGetter} from 'lazy-get-decorator'
import {divide1, divide2, divide3} from './divisions'

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
	merge(recursive: boolean = false) {
		for(let e of this.outerEdges)
			if(e.middle)
				e.edge.merge(recursive);
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
		var divCase = this.innerEdges.length;
		if(divCase) {
			let midEdge = this.innerEdges.pop();
			midEdge.directed[0].borderOf.remove();
			midEdge.directed[1].borderOf.remove();
		}
		switch(divCase) {
		case 0:
			divide1<E,P>(this, index, subEdges);
			break;
		case 1:
			divide2<E,P>(this);
			break;
		case 2:
			divide3<E,P>(this, index, subEdges);
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
			this.TM.emit('add', this);	//No need to set `borderOf` as they should have been kept
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
		case 3:
			this.TM.emit('remove', this.innerEdges[index].directed[0].borderOf);
			this.TM.emit('remove', this.innerEdges[index].directed[1].borderOf);
			this.TM.emit('remove', this.innerEdges[(index+2)%3].directed[1].borderOf);
			
			index = (index+1)%3;
			if(index) this.innerEdges[0] = this.innerEdges[index];
			this.innerEdges.splice(1, 2);
			divide2<E,P>(this, this.innerEdges[index]);
			break;
		default:
			console.assert(false, "Uncut only cut triangles")
			break;
		}
	}
}