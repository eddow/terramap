import {init, animate, createFace, TerraMap, Triangle, Edge, Point} from './threeIrf'

var terra = new TerraMap(400);
terra.on('add', addFace);
terra.on('remove', removeFace);
terra.on('divided', dividedFace);
init();

for(let face of terra.faces) {
	face.add();
}

var edges: Edge[] = terra.edges;
/*for(let edge of edges) edge.divide();
for(let edge of edges) if(!edge.middle) edge.divide();*/
edges[0].divide();
edges[5].divide();
edges[3].divide();
edges[3].merge();
animate();

function dividedFace(face: Triangle) {
	edges = edges.concat(face.innerEdges);
}

function addFace(face: Triangle) {
	if(!face.data)
		face.data = createFace(face.points);
	face.data.add();
}

export function removeFace(face: Triangle) {
	face.data.remove();
}