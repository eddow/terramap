import TerraMap from 'terramap'

import * as THREE from 'three';
 
var container, clock;

var camera, scene, renderer;

var lines = [];

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

	clock = new THREE.Clock();

	var material = new THREE.LineBasicMaterial( { vertexColors: true, morphTargets: true } );
	for(let face of terra.faces) {
		let geometry = new THREE.BufferGeometry();
		let positions = [];
		let colors = [];

		for(let point of face.points) {
			let [x, y, z] = point.coords;

			// positions

			positions.push( x, y, z );

			// colors

			colors.push( ( x / r ) + 0.5 );
			colors.push( ( y / r ) + 0.5 );
			colors.push( ( z / r ) + 0.5 );

		}

		positions.push(positions[0], positions[1], positions[2]);
		colors.push(colors[0], colors[1], colors[2]);

		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

		geometry.computeBoundingSphere();

		let line = new THREE.Line( geometry, material );
		scene.add(line);
		lines.push(line);
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

	for(let line of lines) {
		line.rotation.x = time * 0.25;
		line.rotation.y = time * 0.5;
	}

	renderer.render( scene, camera );

}