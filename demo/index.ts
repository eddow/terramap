import {init, animate, createFace, Coords, TerraMap, Triangle, Edge, handleClick} from './threeIrf'
import {BufferGeometry, Geometry, BufferAttribute} from 'three';

var terra = new TerraMap(400);
terra.on('add', addFace);
terra.on('remove', removeFace);
terra.on('divided', dividedFace);
terra.on('deleteEdges', (deld)=> {
	for(let e of deld)
		delete edges[e.uid];
});
init();

for(let face of terra.faces) {
	face.add();
}
function registerEdges(registered: Edge[]) {
	edges = [].concat(edges);
	for(let e of registered)
		edges[e.uid] = e;
}
function registerFace(f: Triangle) {
	faces = [].concat(faces);
	faces[f.uid] = f;
}
var oldColors: [Coords, Coords, Coords][] = [];
function markFace(face: number, color: Coords|[Coords, Coords, Coords]) {
	const f = faces[face];
	const backup = !oldColors[face];
	if(backup) oldColors[face] = [null, null, null];
	if(!Array.isArray(color[0]))
		color = [<Coords>color, <Coords>color, <Coords>color];
	const flattened = [].concat(color[0], color[1], color[2]);
	(<BufferGeometry>f.data.mesh.geometry).setAttribute('color', new BufferAttribute(
		new Float32Array(flattened),3, false));
	(<Geometry>f.data.mesh.geometry).verticesNeedUpdate = true;
	debugger;
}
(<any>window).markFace = markFace;
(<any>window).unmarkFace = (face: number)=> {
	markFace(face, oldColors[face]);
}

var edges: Edge[] = [],
	faces: Triangle[] = [];
registerEdges(terra.edges);
for(let i=1; i<3; ++i) {
	for(let edge of edges) if(edge && !edge.division) edge.divide();
}
// todo:bug
//terra.faces[0].divide(true);
//edges[10].merge(true);
//edges[3].merge(true);
//edges[1].merge(true);
////terra.faces[0].merge(true);

handleClick(()=> {
	var mergeEdge, divideEdge, mergeFace, divideFace, recursive = false;
	debugger;
	if(undefined!== mergeEdge) edges[mergeEdge].merge(recursive);
	if(undefined!== divideEdge) edges[divideEdge].divide(recursive);
	if(undefined!== mergeFace) terra.faces[mergeFace].merge(recursive);
	if(undefined!== divideFace) terra.faces[divideFace].divide(recursive);
});
(<any>window).mergeEdge = (...merged: number[])=> {
	for(let e of merged)
		edges[e].merge(true);
}
animate();

function dividedFace(face: Triangle) {
	registerEdges(face.innerEdges);
	for(let e of face.outerEdges)
		for(let d of e.division)
			if(!d.undividedReferents.length)
				registerEdges([d]);
}

function addFace(face: Triangle) {
	registerFace(face);
	if(!face.data)
		face.data = createFace(face.points);
	face.data.add();
}

export function removeFace(face: Triangle) {
	face.data.remove();
}