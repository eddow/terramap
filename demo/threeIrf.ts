import * as THREE from 'three';
import middle, {Point} from 'terramap/generation/middle'
export {Point} from 'terramap/generation/middle'
import GTerraMap, {GEdge, GTriangle} from 'terramap'
var container;

export var camera, scene;
var renderer;

var segments = 4;
var t = 0;

var wireMaterial = new THREE.LineBasicMaterial( { vertexColors: true, morphTargets: true } );
var meshMaterial = new THREE.MeshPhongMaterial( {
	color: 0xaaaaaa, specular: 0xffffff, shininess: 5,
	side: THREE.BackSide, vertexColors: true
} );
var white = Array(12).fill(1);
var pA = new THREE.Vector3();
var pB = new THREE.Vector3();
var pC = new THREE.Vector3();

var cb = new THREE.Vector3();
var ab = new THREE.Vector3();

export function init() {

	container = document.getElementById( 'container' );

	//

	camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 1, 5000 );
	camera.position.z = 2750;

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x050505 );
	scene.fog = new THREE.Fog( 0x050505, 2000, 5000 );

	//

	scene.add( new THREE.AmbientLight( 0xffffff ) );
/*
	var light1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	light1.position.set( 1, 1, 1 );
	scene.add( light1 );

	var light2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
	light2.position.set( 0, - 1, 0 );
	scene.add( light2 );*/
	//

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth-24, window.innerHeight-24);
	renderer.outputEncoding = THREE.sRGBEncoding;

	container.appendChild( renderer.domElement );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth-24, window.innerHeight-24);

}

//

export function animate() {

	requestAnimationFrame( animate );

	render();

}

function render() {

	camera.lookAt( scene.position );
	camera.updateMatrixWorld();
	
	renderer.render( scene, camera );

}

class D3Rendered {
	line: THREE.Line;
	mesh: THREE.Mesh;
	constructor(line: THREE.Line, mesh: THREE.Mesh) {
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

export function createFace(data: [Point, Point, Point]): D3Rendered {
	let positions = [];
	let normals = [];
	var colrsV = [];

	for(let d of data) {
		positions.push(...d.coords);
		colrsV.push(...d.colors);
	}
	
	pA.set(data[0].coords[0], data[0].coords[1], data[0].coords[2]);
	pB.set(data[1].coords[0], data[1].coords[1], data[1].coords[2]);
	pC.set(data[2].coords[0], data[2].coords[1], data[2].coords[2]);

	cb.subVectors( pC, pB );
	ab.subVectors( pA, pB );
	cb.cross( ab );

	cb.normalize();

	var nx = cb.x;
	var ny = cb.y;
	var nz = cb.z;

	normals.push(nx, ny, nz);
	normals.push(nx, ny, nz);
	normals.push(nx, ny, nz);

	let geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
	geometry.setAttribute('color', new THREE.Float32BufferAttribute(colrsV, 3));
	geometry.computeBoundingSphere();

	let mesh = new THREE.Mesh( geometry, meshMaterial );

	geometry = new THREE.BufferGeometry();
	positions.push(...data[0].coords);
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute('color', new THREE.Float32BufferAttribute(white, 3));
	geometry.computeBoundingSphere();

	let line = new THREE.Line(geometry, wireMaterial);
	return new D3Rendered(line, mesh);
}


class EdgeData {}

export class Edge extends GEdge<EdgeData, Point> {}
export class Triangle extends GTriangle<D3Rendered, EdgeData, Point> {}
export class TerraMap extends GTerraMap<D3Rendered, EdgeData, Point> {
	constructor(scale: number = 1) {
		super(middle(scale));
	}
}

////#region Mouse events

function reposition() {
	camera.position.normalize().multiplyScalar(radius);
}
var mbDown: {x: number, y: number},
	raycaster = new THREE.Raycaster(),
	mouse = new THREE.Vector2(), intersected,
	radius = 2750, theta = 0, highLine = null,
	sizeX, sizeY;;
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
window.addEventListener('mouseup', event=> 1=== event.button ? mbDown = null : null, false );
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