<script lang="ts">
	// Svelte
	import { onMount } from "svelte";

	// Libs
	import * as THREE from "three";
	import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
	import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
	import { ConvexHull } from "three/examples/jsm/Addons.js";
	import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
	import RAPIER from "@dimforge/rapier3d-compat";
	import { insertCoin, onPlayerJoin, me } from "playroomkit";

	// Env variables
	import { PUBLIC_PLAYROOM_ID } from "$env/static/public";

	// Utils
	import { Player } from "$lib/models/Player";
	import { Ground } from "$lib/models/Ground";
	import { Guest } from "$lib/models/Guest";

	// Stores
	import { guests } from "$lib/stores/guests";

	// Variables
	const loader = new GLTFLoader();
	const textureLoader = new THREE.TextureLoader();
	const gravity = { x: 0.0, y: -9.81, z: 0.0 };
	// If enabled, you can see yourself in the game as a static object
	const debug = false;
	let composer: EffectComposer;
	let rootElement: HTMLElement;
	let camera: THREE.PerspectiveCamera;

	onMount(async () => {
		const world = await initPhysics();
		await initPlayroom();
		const scene = initThree(world);
		initGuests(scene, world, new THREE.Vector3(0, 0.2, 0));
	});

	function initThree(world: RAPIER.World) {
		const renderWidth = rootElement.clientWidth;
		const renderHeight = rootElement.clientHeight;

		const labelRenderer = new CSS2DRenderer();
		labelRenderer.setSize(renderWidth, renderHeight);
		labelRenderer.domElement.style.position = "absolute";
		labelRenderer.domElement.style.top = "0px";
		rootElement.appendChild(labelRenderer.domElement);

		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(renderWidth, renderHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		rootElement.appendChild(renderer.domElement);

		const scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(65, renderWidth / renderHeight);

		// Initial setups
		const ground = new Ground(scene, world, 20);
		const player = new Player(me(), scene, world, ground.rigidBody.collider(0), camera, new THREE.Vector3(0, 2, 0));
		setupMap(scene, world);
		setupLights(scene);
		setupHDRI(scene);

		// Events
		handleResize(renderer, labelRenderer, camera);
		rootElement.addEventListener("click", () => {
			rootElement.requestPointerLock();
		});

		renderer.setAnimationLoop((time) => {
			player.update();
			updateGuests();
			world.step();
			renderer.render(scene, camera);
			labelRenderer.render(scene, camera);
		});

		return scene;
	}

	function handleResize(renderer: THREE.WebGLRenderer, labelRenderer: CSS2DRenderer, camera: THREE.PerspectiveCamera) {
		window.addEventListener("resize", () => {
			const newWidth = rootElement.clientWidth;
			const newHeight = rootElement.clientHeight;
			camera.aspect = newWidth / newHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(newWidth, newHeight);
			labelRenderer.setSize(newWidth, newHeight);
			composer.setSize(newWidth, newHeight);
		});
	}

	async function initPhysics() {
		await RAPIER.init();
		return new RAPIER.World(gravity);
	}

	async function initPlayroom() {
		await insertCoin({
			gameId: PUBLIC_PLAYROOM_ID,
			discord: true,
		});
		return me();
	}

	function initGuests(scene: THREE.Scene, world: RAPIER.World, spawnPos: THREE.Vector3) {
		onPlayerJoin((playerState) => {
			const myState = me();
			const guestState = playerState;
			if (guestState.id !== myState.id || debug) {
				const guest = new Guest(guestState, scene, world, spawnPos, debug);
				$guests = [...$guests, guest];
			}
			playerState.onQuit(() => {
				const guest = $guests.find((g) => g.playerState.id === playerState.id);
				if (guest) {
					guest.despawn();
					$guests = $guests.filter((g) => g.playerState.id !== playerState.id);
				}
			});
		});
	}

	function setupMap(scene: THREE.Scene, world: RAPIER.World) {
		const excludedMeshes = ["wall-narrow-gate", "metal-gate001", "bridge-draw001"];
		loader.load(
			"scenes/map.glb",
			function (gltf) {
				const model = gltf.scene;
				model.traverse((node) => {
					if (node instanceof THREE.Mesh) {
						node.castShadow = true;
						node.receiveShadow = true;
						if (!excludedMeshes.includes(node.name)) setupCollider(world, node);
					}
				});
				scene.add(model);
			},
			undefined,
			function (error) {
				console.log("Error loading GLB:", error);
			}
		);
	}

	function setupCollider(world: RAPIER.World, node: THREE.Mesh) {
		const convexHull = new ConvexHull().setFromObject(node);
		const vertices = convexHull.vertices;
		const buffer = new Float32Array(convexHull.vertices.length * 3);
		for (let i = 0; i < vertices.length; i++) {
			buffer[i * 3] = vertices[i].point.x;
			buffer[i * 3 + 1] = vertices[i].point.y;
			buffer[i * 3 + 2] = vertices[i].point.z;
		}
		const meshColliderDesc = RAPIER.ColliderDesc.convexHull(buffer) as RAPIER.ColliderDesc;
		world.createCollider(meshColliderDesc);
	}

	function setupLights(scene: THREE.Scene) {
		const ambientLight = new THREE.AmbientLight("#E6F9EC", 1);
		scene.add(ambientLight);
		const directionalLight = new THREE.DirectionalLight(0xffffff, 4.2);
		directionalLight.castShadow = true;
		directionalLight.shadow.bias = -0.0001;
		directionalLight.shadow.mapSize.width = 4096;
		directionalLight.shadow.mapSize.height = 4096;
		directionalLight.shadow.camera.near = 0.5;
		directionalLight.shadow.camera.far = 500;
		directionalLight.shadow.camera.left = -50;
		directionalLight.shadow.camera.right = 50;
		directionalLight.shadow.camera.top = 50;
		directionalLight.shadow.camera.bottom = -50;
		directionalLight.rotation.z = Math.PI / 4;
		directionalLight.position.set(-20, 20, 0);
		scene.add(directionalLight);
	}

	function setupHDRI(scene: THREE.Scene) {
		const texture = textureLoader.load("textures/skybox.png");
		const geometry = new THREE.SphereGeometry(200, 32, 32);
		geometry.scale(-1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ map: texture });
		const sphere = new THREE.Mesh(geometry, material);
		scene.add(sphere);
	}

	function updateGuests() {
		for (const guest of $guests) {
			guest.update();
		}
	}
</script>

<!-- Main container -->
<div class="h-full w-full flex flex-col justify-center items-center" bind:this={rootElement}></div>
