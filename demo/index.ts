import {init, animate, createFace, TerraMap, Triangle, Edge} from './threeIrf'

var terra = new TerraMap(400);
terra.on('add', addFace);
terra.on('remove', removeFace);
terra.on('divided', dividedFace);
init();

for(let face of terra.faces) {
	face.add();
}

var edges: Edge[] = terra.edges;
for(let i=0; i<4; ++i) {
	for(let edge of edges) if(!edge.division) edge.divide(true);
}
terra.faces[1].merge(true);

animate();

function dividedFace(face: Triangle) {
	edges = edges.concat(face.innerEdges);
	for(let e of face.outerEdges)
		edges.push(e.division[e.inverted?1:0]);
	//Perhaps we made the first triangle of the pair this edge border
	//	=> there is a reference to the triangle who is going to be divided now
	/*for(let e of edges)
		console.assert(!e.referents.size,
			"When a triangle is fully divided, its innerEdges have no referents");*/
}

function addFace(face: Triangle) {
	if(!face.data)
		face.data = createFace(face.points);
	face.data.add();
}

export function removeFace(face: Triangle) {
	face.data.remove();
}