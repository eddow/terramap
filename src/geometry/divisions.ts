import Edge, {ITriangle, Edges} from './edge'

function addReferent<E,P>(referent: Edge<E,P>, targets: Edge<E,P>[]): Edge<E,P>[] {
	for(let e of targets)
		e.referents.add(referent)
	return targets;
}
function deleteReferent<E,P>(referent: Edge<E,P>, targets: Edge<E,P>[]): Edge<E,P>[] {
	for(let e of targets)
		e.referents.delete(referent)
	return targets;
}

export function divide1<E,P>(triangle: ITriangle<E,P>, index: number, subEdges: [Edge<E,P>, Edge<E,P>]) {
	/*
     A
     ^
    /|\
   / | \
  /  |  \
 /___|___\ <---- divided side
C  ^ D ^  B
   |---|-------- subEdges
edges:
- midEdge: DA
triangles: ACD, DBA
	*/
	let middle = subEdges[0].ends[1], midEdge;
	console.assert(middle === subEdges[1].ends[1], "Edge division consistant: [AM, BM]");
	midEdge = new Edge<E,P>(triangle.TM, [middle, triangle.outerEdges[index].orderedPoints[0]]);
	triangle.innerEdges = [midEdge];
	triangle.remove(false);
	for(let i=0; i<2; ++i) {
		let sideEdge = triangle.outerEdges[(index+i+2)%3];
		addReferent(sideEdge.edge, [midEdge, subEdges[0], subEdges[1]]);
		let extrPt = sideEdge.orderedPoints[i];
		let subEdge = subEdges[0];
		if(!~subEdge.ends.indexOf(extrPt)) {
			subEdge = subEdges[1];
		}
		triangle.addSub(i?
			[sideEdge, subEdge.directed[0], midEdge.directed[0]]:
			[subEdge.directed[1], sideEdge, midEdge.directed[1]]
		);
	}
}

export function divide2<E,P>(triangle: ITriangle<E,P>, divided: Edge<E,P>, alreadyBarEdge?: Edge<E,P>) {
	/*
     A
    /\
  D/__\E
  / _ /\ <----- _/ crossEdge = diagonal of parallelepiped DEBC
 /_/____\ <---- divided side
C         B
edges:
- barEdge: ED
- crossEdge: EC
triangles: BCE, EDC, ADE
	*/
	let undividedNdx = triangle.outerEdges.findIndex(edge=> !edge.division);
	console.assert(~undividedNdx, "There exist one undivided side when only one innerEdge")
	let undivided = triangle.outerEdges[undividedNdx],
		nEdge = triangle.outerEdges[(undividedNdx+1)%3],	//next edge (from undivided)
		pEdge = triangle.outerEdges[(undividedNdx+2)%3],	//previous edge (from undivided)
		barEdge = alreadyBarEdge || new Edge<E,P>(triangle.TM, [	//The one that will stay in full division
			nEdge.middle,
			pEdge.middle
		]), crossEdge = new Edge<E,P>(triangle.TM, [	//The one that crosses the parallelipiped
			nEdge.middle,
			undivided.orderedPoints[0]
		]),
		peNdx = {
			nxt: (undivided.orderedPoints[1] === nEdge.division[0].ends[0]) ? 0 : 1,
			prv: (undivided.orderedPoints[0] === pEdge.division[0].ends[0]) ? 0 : 1,
		},
		// parallelepiped edge
		pEdges = {nxt: nEdge.division[peNdx.nxt], prv: pEdge.division[peNdx.prv]},
		// sub-triangle edge
		stEdges = {nxt: nEdge.division[1-peNdx.nxt], prv: pEdge.division[1-peNdx.prv]};
	triangle.innerEdges = [barEdge, crossEdge];
	addReferent(undivided.edge, [crossEdge, barEdge]);
	if(divided) deleteReferent(divided, [stEdges.nxt, stEdges.prv, pEdges.nxt, pEdges.prv]);
	else addReferent(undivided.edge, [stEdges.nxt, stEdges.prv, pEdges.nxt, pEdges.prv]);

	// parallelepiped half - along the outer-edge
	triangle.addSub([undivided, pEdges.nxt.directed[0], crossEdge.directed[0]]);
	// parallelepiped half - along the inner-edge
	triangle.addSub([barEdge.directed[0], pEdges.prv.directed[1], crossEdge.directed[1]]);
	if(!alreadyBarEdge) //We already have that triangle if we are merging a 3-division triangle
		// sub-triangle remaining on over-division
		triangle.addSub([stEdges.nxt.directed[1], stEdges.prv.directed[0], barEdge.directed[1]]);
}

export function divide3<E,P>(triangle: ITriangle<E,P>, index: number, subEdges: [Edge<E,P>, Edge<E,P>]) {
	/*
     A
    /\
  D/__\E
  /\  /\
 /__\/__\
C    F    B
edges: ED, DF, FE
triangles: BEF, CFD, ADE, FED
	*/
	let middle = subEdges[0].ends[1];
	console.assert(middle === subEdges[1].ends[1], "Edge division consistant: [AM, BM]");
	let already = triangle.innerEdges[0];
	let divided = subEdges[0].parent;

	index = (index+1)%3;
	if(index) triangle.innerEdges[index] = triangle.innerEdges[0];
	triangle.innerEdges[(index+1)%3] = new Edge<E,P>(triangle.TM, [already.ends[1], middle]);
	triangle.innerEdges[(index+2)%3] = new Edge<E,P>(triangle.TM, [middle, already.ends[0]]);
	deleteReferent(divided, [
		...triangle.outerEdges[(index+1)%3].division,
		...triangle.outerEdges[(index+2)%3].division,
		triangle.innerEdges[index]
	]);
	triangle.TM.emit('divided', triangle);
	// inside sub-triangle
	triangle.addSub(<Edges<E,P>>triangle.innerEdges.map(edge => edge.directed[0]));
	for(let i = index+1; (i=i%3) !== index; ++i) {
		let extSummit = triangle.points[(i+2)%3],
			nEdge = triangle.outerEdges[(i+1)%3],
			pEdge = triangle.outerEdges[(i+2)%3];
		nEdge = nEdge.division[nEdge.division[0].ends[0] === extSummit ? 0 : 1].directed[1];
		pEdge = pEdge.division[pEdge.division[0].ends[0] === extSummit ? 0 : 1].directed[0];
		triangle.addSub([triangle.innerEdges[i].directed[1], nEdge, pEdge]);
	}
}