import {LineBasicMaterial, MeshBasicMaterial, Geometry, BackSide, PerspectiveCamera, Scene, Color,
	Raycaster, Face3, Vector2, Vector3, Line, Mesh, sRGBEncoding, Fog, AmbientLight, WebGLRenderer} from 'three';
import * as THREE from 'three';
import middle, {Point} from 'terramap/generation/middle'
export {Coords, Point} from 'terramap/generation/middle'
import GTerraMap, {GEdge, GTriangle} from 'terramap'
var container;

export var camera, scene;
var renderer;

var segments = 4;
var t = 0;

var wireMaterial = new LineBasicMaterial({vertexColors: true, morphTargets: true});
var meshMaterial = new MeshBasicMaterial({
	//color: 0xaaaaaa, specular: 0xffffff, shininess: 5,
	side: BackSide, vertexColors: true
});
var white = Array(12).fill(1);

export function init() {

	container = document.getElementById( 'container' );

	//

	camera = new PerspectiveCamera( 27, (sizeX = window.innerWidth) / (sizeY = window.innerHeight), 1, 5000 );
	camera.position.z = 2750;

	scene = new Scene();
	scene.background = new Color( 0x050505 );
	scene.fog = new Fog( 0x050505, 2000, 5000 );

	//

	scene.add( new AmbientLight( 0xffffff ) );
/*
	var light1 = new DirectionalLight( 0xffffff, 0.5 );
	light1.position.set( 1, 1, 1 );
	scene.add( light1 );

	var light2 = new DirectionalLight( 0xffffff, 1.5 );
	light2.position.set( 0, - 1, 0 );
	scene.add( light2 );*/
	//

	renderer = new WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = sRGBEncoding;

	container.appendChild( renderer.domElement );

	//

	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(sizeX = window.innerWidth, sizeY = window.innerHeight);

}

//


export function animate() {

	requestAnimationFrame( animate );


	
	raycaster.setFromCamera( mouse, camera );
	var intersect = raycaster.intersectObjects(scene.children)[0];
	if(intersect && intersect.object instanceof Mesh && intersect.object.userData.triangle)
		document.getElementById('textHelper').innerText = intersect.object.userData.triangle.uid;
	if(intersect) {/*
		var targetDistance = intersect.distance,
			verts = intersect.object.geometry.vertices,
			closest = null, minDist;
		if(verts) {
			for(let i=0; i<3; ++i) {
				let line = new Line3(verts[(i+1)%3], verts[(i+2)%3]),
					target = new Vector3(),
					lineClosest = line.closestPointToPoint(intersect.point, false, target),
					dist = lineClosest.distanceTo(intersect.point);
				if(closest === null || dist < minDist) {
					minDist = dist;
					closest = line;
				}
			}
		}*/
	} else {
		//un-highlight
		
		//displayed.geometry.verticesNeedUpdate = true;
	}

	render();

}

function render() {
	camera.lookAt(scene.position);
	camera.updateMatrixWorld();
	
	renderer.render(scene, camera);
}

class D3Rendered {
	line: Line;
	mesh: Mesh;
	constructor(line: Line, mesh: Mesh) {
		this.line = line;
		this.mesh = mesh;
	}
	add() {
		scene.add(this.line, this.mesh);
	}
	remove() {
		scene.remove(this.line, this.mesh);
	}
}

export function createFace(face: Triangle): D3Rendered {
	let data = face.points;
	let positions = [];
	let normals = [];
	var colrsV = [];

	for(let d of data) {
		positions.push(...d.coords);
		colrsV.push(...d.color);
	}

	let geometry = new Geometry();
	geometry.vertices.push(...data.map(p=> new Vector3(...p.coords)));
	var face3 = new Face3(0, 1, 2);
	face3.vertexColors = data.map(p=> new Color(...p.color));
	geometry.faces.push(face3);
	
	let mesh = new Mesh( geometry, meshMaterial );
	mesh.userData.triangle = face;
	let bGgeometry = new THREE.BufferGeometry();
	positions.push(...data[0].coords);
	bGgeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	bGgeometry.setAttribute('color', new THREE.Float32BufferAttribute(white, 3));
	bGgeometry.computeBoundingSphere();

	let line = new Line(bGgeometry, wireMaterial);
	return new D3Rendered(line, mesh);
}

class EdgeData {
	apparentSize: number
}

function projected(x: number, y: number, z: number) {
	var p = new Vector3(x, y, z),
		vector = p.project(camera);

	vector.x = (vector.x + 1) / 2;
	vector.y = -(vector.y - 1) / 2;

	return vector;
}
export type Edge = GEdge<EdgeData, Point>;
export type Triangle = GTriangle<D3Rendered, EdgeData, Point>;
export class TerraMap extends GTerraMap<D3Rendered, EdgeData, Point> {
	apparentSize(edge: Edge): number {
		var ps = edge.ends.map(p=> projected(...p.coords)),
			dx = ps[0].x-ps[1].x,
			dy = ps[0].y-ps[1].y;
		
		return Math.sqrt(dx*dx+dy*dy);
	}
	constructor(scale: number = 1) {
		super(middle(scale));
	}
}

////#region Mouse events

function reposition() {
	camera.position.normalize().multiplyScalar(radius);
}
var mbDown: {x: number, y: number},
	raycaster = new Raycaster(),
	mouse = new Vector2(), intersected,
	radius = 2750, theta = 0, highLine = null,
	sizeX, sizeY,
	highlighted;
const wheelDistance = 100, mvtDistance = .01;

window.addEventListener('mousedown', event=> {
	if(1=== event.button) mbDown = {
		x: event.clientX, y: event.clientY
	};
	else if(intersected) {
		//todo?
	}
}, false);
window.addEventListener('wheel', event => {
	radius += event.deltaY>0?wheelDistance:-wheelDistance;
	reposition();
});
window.addEventListener('mouseup', event=> {
	if(1=== event.button) mbDown = null;
	return false;
});
window.addEventListener('mousemove', event=> {
	if(mbDown) {
		var nwDown = {x: event.clientX, y: event.clientY},
			dist = {x: mbDown.x-nwDown.x, y: nwDown.y-mbDown.y};
		const mtrx = camera.matrix.elements,
			dirX = {x: mtrx[0], y: mtrx[1], z: mtrx[2]},
			dirY = {x: mtrx[9], y: mtrx[10], z: mtrx[11]};
		mbDown = nwDown;
		scene.rotation.x += dist.y * mvtDistance;
		scene.rotation.y -= dist.x * mvtDistance;
		mbDown = nwDown;
		reposition();
	}
	event.preventDefault();
	mouse.x = ( event.clientX / sizeX ) * 2 - 1;
	mouse.y = - ( event.clientY / sizeY ) * 2 + 1;
	
}, false );

////#endregion