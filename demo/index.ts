import TerraMap, {Triangle, Edge} from 'terramap'
import {init, animate, createFace} from './threeIrf'
import middle from 'terramap/generation/middle'

var terra = new TerraMap(middle(400));
terra.on('add', addFace);
terra.on('remove', removeFace);
terra.on('divided', dividedFace);
init();

for(let face of terra.faces) {
	face.add();
}

var edges: Edge[] = terra.edges;
for(let edge of edges) edge.divide();
for(let edge of edges) if(!edge.middle) edge.divide();
animate();

function dividedFace(face: Triangle) {
	edges = edges.concat(face.innerEdges);
}

function addFace(face: Triangle) {
	if(!face.data)
		face.data = createFace(face.points.map(p=> p.data));
	face.data.add();
}

export function removeFace(face: Triangle) {
	face.data.remove();
}