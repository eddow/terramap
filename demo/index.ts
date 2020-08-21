import TerraMap from 'terramap'

import * as THREE from 'three';
 
var container, clock;

var camera, scene, renderer;

var lines = [], meshes = [];

var segments = 4;
var r = 800;
var t = 0;

var terra = new TerraMap(r/2);

init();
animate();

function init() {

	container = document.getElementById( 'container' );

	//

	camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 1, 4000 );
	camera.position.z = 2750;

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x050505 );
	scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );

	//

	scene.add( new THREE.AmbientLight( 0x888888 ) );

	var light1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	light1.position.set( 1, 1, 1 );
	scene.add( light1 );

	var light2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
	light2.position.set( 0, - 1, 0 );
	scene.add( light2 );

	clock = new THREE.Clock();

	var wireMaterial = new THREE.LineBasicMaterial( { vertexColors: true, morphTargets: true } );
	var meshMaterial = new THREE.MeshPhongMaterial( {
		color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
		side: THREE.FrontSide, vertexColors: true
	} );
	var white = Array(12).fill(1), grey = Array(9).fill(0.9);
	var pA = new THREE.Vector3();
	var pB = new THREE.Vector3();
	var pC = new THREE.Vector3();

	var cb = new THREE.Vector3();
	var ab = new THREE.Vector3();
	for(let face of terra.faces) {
		let positions = [];
		let normals = [];

		for(let point of face.points) {
			positions.push(...point.coords);
		}
		
		pA.set(face.points[0].coords[0], face.points[0].coords[1], face.points[0].coords[2]);
		pB.set(face.points[1].coords[0], face.points[1].coords[1], face.points[1].coords[2]);
		pC.set(face.points[2].coords[0], face.points[2].coords[1], face.points[2].coords[2]);

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
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(grey, 3));
		geometry.computeBoundingSphere();

		let mesh = new THREE.Mesh( geometry, meshMaterial );
		scene.add(mesh);
		meshes.push(mesh);

		geometry = new THREE.BufferGeometry();
		positions.push(...face.points[0].coords);
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( white, 3 ) );
		geometry.computeBoundingSphere();

		let line = new THREE.Line( geometry, wireMaterial );
		scene.add(line);
		lines.push(line);
		face.d3Object = {line, mesh};
	}
	//

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.outputEncoding = THREE.sRGBEncoding;

	container.appendChild( renderer.domElement );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

	requestAnimationFrame( animate );

	render();

}

function render() {

	var delta = clock.getDelta();
	var time = clock.getElapsedTime();

	for(let line of [...lines, ...meshes]) {
		line.rotation.x = time * 0.25;
		line.rotation.y = time * 0.5;
	}

	renderer.render( scene, camera );

}