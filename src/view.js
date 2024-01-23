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
			let camera, scene, renderer;
			let controls, water, sun, mesh;

			init();
			animate();

			function init() {

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.toneMapping = THREE.NoToneMapping;
				renderer.toneMappingExposure = 0.5;
				document.body.appendChild( renderer.domElement );

				//

				scene = new THREE.Scene();

				camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
				camera.position.set( 30, 30, 100 );

				//

				sun = new THREE.Vector3();

				// Water

				const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

				water = new Water(
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

				// Skybox

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
				const sceneEnv = new THREE.Scene();

				let renderTarget;

				function updateSun() {

					const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
					const theta = THREE.MathUtils.degToRad( parameters.azimuth );

					sun.setFromSphericalCoords( 1, phi, theta );

					sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
					water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

					if ( renderTarget !== undefined ) renderTarget.dispose();

					sceneEnv.add( sky );
					renderTarget = pmremGenerator.fromScene( sceneEnv );
					scene.add( sky );

					scene.environment = renderTarget.texture;

				}

				updateSun();

				//

				const geometry = new THREE.BoxGeometry( 30, 30, 30 );
				const material = new THREE.MeshStandardMaterial( { roughness: 0 } );

				mesh = new THREE.Mesh( geometry, material );
				scene.add( mesh );

				const loader = new OBJLoader();

				const boey = loader.load(
					// resource URL
					'assets/models/boey-canarias.obj',
					// called when resource is loaded
					function ( object ) {
						object.scale.set(0.01, 0.01, 0.01);
						object.position.set(0, 0, 0);
						object.rotation.set(-1.51, 0, 0);
						scene.add( object );
						return object;
					},
					// called when loading is in progresses
					function ( xhr ) {
				
						console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
				
					},
					// called when loading has errors
					function ( error ) {
				
						console.log( 'An error happened' );
				
					}
				);

				//

				controls = new OrbitControls( camera, renderer.domElement );
				controls.maxPolarAngle = Math.PI * 0.495;
				controls.target.set( 0, 10, 0 );
				controls.minDistance = 40.0;
				controls.maxDistance = 200.0;
				controls.update();

				//

				stats = new Stats();
				document.body.appendChild( stats.dom );

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

				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				requestAnimationFrame( animate );
				render();
				stats.update();

			}

			function render() {

				const time = performance.now() * 0.001;

				boey.position.y = Math.sin( time ) * 20;
				boey.rotation.x = -1.51 + last_data.pitch;
				boey.rotation.y = last_data.yaw;
				boey.rotation.z = last_data.roll;

				water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

				renderer.render( scene, camera );

			}
