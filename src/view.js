/*
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';


const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );


const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

const controls = new OrbitControls( camera, renderer.domElement );

const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

const water = new Water(
	waterGeometry,
	{
		textureWidth: 512,
		textureHeight: 512,
		waterNormals: new THREE.TextureLoader().load( 'assets/textures/waternormals.jpg', function ( texture ) {

			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

		} ),
		sunDirection: new THREE.Vector3(),
		sunColor: 0xffffff,
		waterColor: 0x001e0f,
		distortionScale: 3.7,
		fog: scene.fog !== undefined
	}
);

water.rotation.x = - Math.PI / 2;

scene.add( water );

const sky = new Sky();
sky.scale.setScalar( 10000 );
scene.add( sky );

const skyUniforms = sky.material.uniforms;

skyUniforms[ 'turbidity' ].value = 10;
skyUniforms[ 'rayleigh' ].value = 2;
skyUniforms[ 'mieCoefficient' ].value = 0.005;
skyUniforms[ 'mieDirectionalG' ].value = 0.8;

const parameters = {
	elevation: 2,
	azimuth: 180
};

const pmremGenerator = new THREE.PMREMGenerator( renderer );

function animate() {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

	renderer.render( scene, camera );
}

animate();
*/

var data;
var last_data = {};

last_data.time = 0;
last_data.roll = 0;
last_data.yaw = 0;
last_data.pitch = 0;

//MQTT
import Paho from 'paho-mqtt';
var client = new Paho.Client("wedge.alteriaautomation.com", 1884, "clientId" + new Date().getTime());

client.onConnectionLost = onConnectionLost;
function onConnectionLost(responseObject) {
	console.log("onConnectionLost:");
	client.unsubscribe("imu");
}

client.onMessageArrived = onMessageArrived;
function onMessageArrived(message) {
	data = JSON.parse(message.payloadString);
	if (data.time > last_data.time) {
		last_data = data;
	}
}

client.connect({ onSuccess: onConnect, userName: 'wedge-server', password: 'N&@^rEWv', useSSL: true });
function onConnect() {
	console.log("onConnect");
	client.subscribe("imu");
}

//THREE
import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';

//import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

let stats;
let camera, scene, sceneEnv, renderer, renderTarget, pmremGenerator, ambient_light, force;
let controls, water, sun, boey, boeyMaterial, sky;

init();
animate();


	function updateSun() {

		var angle = last_data.time % 86400000 / 86400000 * 360;
		const phi = THREE.MathUtils.degToRad(angle);
		const theta = THREE.MathUtils.degToRad(0);

		sun.setFromSphericalCoords(1, phi, theta);

		sky.material.uniforms['sunPosition'].value.copy(sun);
		water.material.uniforms['sunDirection'].value.copy(sun).normalize();

		if (renderTarget !== undefined) renderTarget.dispose();

		sceneEnv.add(sky);
		renderTarget = pmremGenerator.fromScene(sceneEnv);
		scene.add(sky);

		scene.environment = renderTarget.texture;

	}

function init() {

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.toneMapping = THREE.NoToneMapping;
	renderer.toneMappingExposure = 0.5;
	renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
	document.body.appendChild(renderer.domElement);


	//

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
	camera.position.set(30, 30, 100);

	//

	sun = new THREE.Vector3();

	ambient_light = new THREE.AmbientLight(0x404040, 10);
	scene.add(ambient_light);

	// Water

	const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

	water = new Water(
		waterGeometry,
		{
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: new THREE.TextureLoader().load('assets/textures/waternormals.jpg', function (texture) {

				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

			}),
			sunDirection: new THREE.Vector3(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 3.7,
			fog: scene.fog !== undefined,
			alpha: 0.1
		}
	);

	water.rotation.x = - Math.PI / 2;

	scene.add(water);

	// Skybox

	sky = new Sky();
	sky.scale.setScalar(10000);
	scene.add(sky);

	const skyUniforms = sky.material.uniforms;

	skyUniforms['turbidity'].value = 10;
	skyUniforms['rayleigh'].value = 2;
	skyUniforms['mieCoefficient'].value = 0.005;
	skyUniforms['mieDirectionalG'].value = 0.8;

	const parameters = {
		elevation: 2,
		azimuth: 180
	};

	pmremGenerator = new THREE.PMREMGenerator(renderer);
	sceneEnv = new THREE.Scene();

	//updateSun();

	//

	const loader = new OBJLoader();
	loader.load(
		// resource URL
		'assets/models/boey-canarias.obj',
		// called when resource is loaded
		function (object) {
			object.scale.set(0.01, 0.01, 0.01);
			object.position.set(0, 0, 0);
			object.rotation.set(-1.51, 0, 0);
			boey = object;
			boeyMaterial = new THREE.MeshPhysicalMaterial({
				color: 0x63452c,
				roughness: 0.275,
				metalness: 0.5,
				ior: 1.5,
				reflectivity: 1,
				iridescence: 0,
				wireframe: true
			});
			boey.traverse((mesh)	=> {
				if (mesh.isMesh) mesh.material = boeyMaterial;
			});
			scene.add(boey);
		},
		// called when loading is in progresses
		function (xhr) {

			console.log((xhr.loaded / xhr.total * 100) + '% loaded');

		},
		// called when loading has errors
		function (error) {

			console.log('An error happened');

		}
	);

	force = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0), 1, 0xff0000);
	scene.add(force);

	//

	controls = new OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = Math.PI * 0.495;
	controls.target.set(0, 10, 0);
	controls.minDistance = 40.0;
	controls.maxDistance = 200.0;
	controls.update();

	//

	stats = new Stats();
	document.body.appendChild(stats.dom);

	/*
	// GUI

	const gui = new GUI();

	const folderSky = gui.addFolder( 'Sky' );
	folderSky.add( parameters, 'elevation', 0, 90, 0.1 ).onChange( updateSun );
	folderSky.add( parameters, 'azimuth', - 180, 180, 0.1 ).onChange( updateSun );
	folderSky.open();

	const waterUniforms = water.material.uniforms;

	const folderWater = gui.addFolder( 'Water' );
	folderWater.add( waterUniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
	folderWater.add( waterUniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
	folderWater.open();

	//
	*/

	window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
	console.log(boey);

}

function animate() {

	requestAnimationFrame(animate);
	render();
	stats.update();

}

function render() {

	if (boey !== undefined) {
		boey.rotation.x = +1.57 + last_data.roll;
		boey.rotation.y = last_data.pitch;
		boey.rotation.z = last_data.yaw;
		force.setLength(5 * Math.sqrt(last_data.accX * last_data.accX + last_data.accY * last_data.accY + last_data.accZ * last_data.accZ));
		force.position.set(boey.position.x, boey.position.y, boey.position.z);
		force.scale.set(2, 2, 2);
		force.setDirection(new THREE.Vector3(last_data.accX, last_data.accY, last_data.accZ).normalize());
		(new THREE.Vector3(last_data.accX, last_data.accY, last_data.accZ));
	}
	updateSun();
	water.material.uniforms['time'].value += 1.0 / 60.0;

	renderer.render(scene, camera);

}
