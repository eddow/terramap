import Edge, {ITriangle, Edges} from './edge'

export function divide1<T,E,P>(triangle: ITriangle<E,P>, index: number, subEdges: [Edge<E,P>, Edge<E,P>]) {
	/*
    ^
   /|\
  / | \
 /  |  \
/___|___\ <---- divided side
  ^---^-------- subEdges
	*/
	let middle = subEdges[0].ends[1], midEdge;
	console.assert(middle === subEdges[1].ends[1], "Edge division consistant: [AM, BM]");
	midEdge = new Edge<E,P>(triangle.TM, [middle, triangle.outerEdges[index].orderedPoints[0]]);
	midEdge.referents = [null];
	triangle.innerEdges = [midEdge];
	triangle.remove(false);
	for(let i=0; i<2; ++i) {
		let sideEdge = triangle.outerEdges[(index+i+2)%3];
		midEdge.referents[i] = sideEdge.edge;
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