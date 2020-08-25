import {init, animate, createFace, TerraMap, Triangle, Edge, scene} from './threeIrf'
import {SphereGeometry, MeshBasicMaterial, Mesh, Geometry, Color} from 'three';

var terra = (<any>window).terra = new TerraMap(400);
terra.on('add', addFace);
terra.on('remove', removeFace);
terra.on('divided', dividedFace);
terra.on('deleteEdges', (deld)=> {
	for(let e of deld)
		delete edges[e.uid];
});
init();
type TColors = [Color, Color, Color];
for(let face of terra.faces) {
	face.add();
}
function registerEdges(registered: Edge[]) {
	(<any>window).edges = edges = [].concat(edges);
	for(let e of registered)
		edges[e.uid] = e;
}
function registerFace(f: Triangle) {
	(<any>window).faces = faces = [].concat(faces);
	faces[f.uid] = f;
}

////#region Debugging tools

(<any>window).test = function test(nr: number) {
	var arr = new Array(nr), cptr = 0, cptrX = 0, working = true;
	arr.fill(0);
	//console.log(arr = arr.map(_=> Math.random()));
	arr = arr.map(_=> Math.random());
	for(let i=0; i<arr.length-1; i++) {
		cptr++;
		if(arr[i] > arr[i+1]) {
			cptrX++;
			[arr[i], arr[i+1]] = [arr[i+1], arr[i]];
			if(i) i -= 2;
		}
	}
	for(let i=0; i<arr.length-1; i++)
		if(arr[i] > arr[i+1]) {
			working = false;
			break;
		}
	//console.log(arr);
	console.log(`Working: ${working}, cptr: ${cptr}, cptrX: ${cptrX}`)
}

var trMarker = (()=> {
	var geometry = new SphereGeometry( 15, 32, 32 );
	var material = new MeshBasicMaterial( {color: 0xffffff} );
	var rv = [
		new Mesh( geometry, material ),
		new Mesh( geometry, material ),
		new Mesh( geometry, material )
	];
	for(let s of rv) scene.add(s);
	return rv;
})();

(<any>window).markFace = function markFace(face: number) {
	const f = faces[face];
	if(!f) console.log('Inexistant');
	else {
		const geometry = <Geometry>f.data.mesh.geometry
		var vects = geometry.vertices;
		vects.forEach((v, i)=> trMarker[i].position.set(v.x, v.y, v.z));
	}
};

(<any>window).markEdge = function markEdge(edge: number) {
	const e = edges[edge];
	if(!e) console.log('Inexistant');
	else {
		e.ends.forEach((v, i)=> trMarker[i].position.set(v.coords[0], v.coords[1], v.coords[2]));
		trMarker[2].position.set(0, 0, 0);
	}
};

var edges: Edge[] = [],
	faces: Triangle[] = [];
registerEdges(terra.edges);
for(let i=1; i<3; ++i) {
	for(let edge of edges) if(edge && !edge.division) edge.divide();
}
(<any>window).mergeEdge = (...merged: number[])=> {
	for(let e of merged)
		edges[e].merge(true);
}
////#endregion

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
		face.data = createFace(face);
	face.data.add();
}

export function removeFace(face: Triangle) {
	face.data.remove();
}