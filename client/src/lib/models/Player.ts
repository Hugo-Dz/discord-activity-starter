// Libs
import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";

// Types
import type { PlayerState } from "playroomkit";

export class Player {
	public mesh: THREE.Mesh;
	private moveSpeed = 2;
	private rigidBody: RAPIER.RigidBody;
	private moveState = { forward: false, backward: false, left: false, right: false };
	private isGrounded = true;
	private sensorCollider: RAPIER.Collider;

	constructor(
		public playerState: PlayerState,
		private scene: THREE.Scene,
		private world: RAPIER.World,
		private groundCollider: RAPIER.Collider,
		private camera: THREE.PerspectiveCamera,
		private spawnPos: THREE.Vector3
	) {
		const { mesh, rigidBody, sensorCollider } = this.spawn();
		this.mesh = mesh;
		this.rigidBody = rigidBody;
		this.sensorCollider = sensorCollider;
		this.setupEventListeners();
	}

	private setupEventListeners() {
		window.addEventListener("keydown", (event) => this.handleKey(event, true));
		window.addEventListener("keyup", (event) => this.handleKey(event, false));
		window.addEventListener("mousemove", (event: MouseEvent) => {
			const yawChange = event.movementX * 0.002;
			this.mesh.rotation.y -= yawChange;
			this.camera.rotation.x -= event.movementY * 0.002;
			this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
		});
	}

	private handleKey(event: KeyboardEvent, isDown: boolean) {
		switch (event.code) {
			case "KeyW":
				this.moveState.forward = isDown;
				break;
			case "KeyS":
				this.moveState.backward = isDown;
				break;
			case "KeyA":
				this.moveState.left = isDown;
				break;
			case "KeyD":
				this.moveState.right = isDown;
				break;
			case "Space":
				if (isDown && this.isGrounded) {
					this.rigidBody.setLinvel({ x: 0, y: 3, z: 0 }, true);
				}
				break;
		}
	}

	private spawn() {
		const geometry = new THREE.CapsuleGeometry(0.125, 0.25, 10, 16);
		const material = new THREE.MeshStandardMaterial({
			color: "#FFFFFF",
			roughness: 0.5,
		});
		const player = new THREE.Mesh(geometry, material);
		player.position.copy(this.spawnPos);
		this.camera.position.set(0, 0.25, 0);
		player.add(this.camera);
		this.scene.add(player);

		// Physics
		const playerRigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
			this.spawnPos.x,
			this.spawnPos.y,
			this.spawnPos.z
		);
		const playerRigidBody = this.world.createRigidBody(playerRigidBodyDesc);
		const playerColliderDesc = RAPIER.ColliderDesc.capsule(0.4, 0.1);
		this.world.createCollider(playerColliderDesc, playerRigidBody);

		const sensorColliderDesc = RAPIER.ColliderDesc.ball(0.1).setTranslation(0, -0.5, 0).setSensor(true);
		const sensorCollider = this.world.createCollider(sensorColliderDesc, playerRigidBody);

		return { mesh: player, rigidBody: playerRigidBody, sensorCollider: sensorCollider };
	}

	public update() {
		const forward = this.mesh.getWorldDirection(new THREE.Vector3()).negate();
		const right = new THREE.Vector3().crossVectors(this.mesh.up, forward).normalize();

		const inputVelocity = new THREE.Vector3();
		if (this.moveState.forward) inputVelocity.add(forward);
		if (this.moveState.backward) inputVelocity.sub(forward);
		if (this.moveState.left) inputVelocity.add(right);
		if (this.moveState.right) inputVelocity.sub(right);
		inputVelocity.normalize().multiplyScalar(this.moveSpeed);

		const yVel = this.rigidBody.linvel().y;
		this.rigidBody.setLinvel({ x: inputVelocity.x, y: yVel, z: inputVelocity.z }, true);
		// Prevent collider rotation
		this.rigidBody.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);

		const playerPos = this.rigidBody.translation();
		this.mesh.position.set(playerPos.x, playerPos.y, playerPos.z);
		this.playerState.setState("pos", { x: playerPos.x, y: playerPos.y, z: playerPos.z });

		this.isGrounded = this.world.intersectionPair(this.sensorCollider, this.groundCollider);
	}
}
