// Libs
import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import RAPIER from "@dimforge/rapier3d-compat";

// Types
import type { PlayerState } from "playroomkit";

export class Guest {
	public mesh: THREE.Mesh;
	private rigidBody: RAPIER.RigidBody;

	constructor(
		public playerState: PlayerState,
		private scene: THREE.Scene,
		private world: RAPIER.World,
		private spawnPos: THREE.Vector3,
		private debug: boolean
	) {
		const { mesh, rigidBody } = this.spawn();
		this.mesh = mesh;
		this.rigidBody = rigidBody;
	}

	private spawn() {
		const geometry = new THREE.CapsuleGeometry(0.125, 0.25, 10, 16);
		const material = new THREE.MeshStandardMaterial({
			color: "#FFFFFF",
			roughness: 0.5,
		});
		const player = new THREE.Mesh(geometry, material);
		player.position.copy(this.spawnPos);
		player.layers.enableAll();

		const nameLabel = this.createBillboard();
		nameLabel.position.set(player.position.x, player.position.y + 0.1, player.position.z);
		nameLabel.center.set(0.5, 1);
		player.add(nameLabel);
		nameLabel.layers.set(0);

		this.scene.add(player);
		this.playerState.setState("pos", { x: this.spawnPos.x, y: this.spawnPos.y, z: this.spawnPos.z });

		// Physics
		const playerRigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(
			this.spawnPos.x,
			this.spawnPos.y,
			this.spawnPos.z
		);
		const playerRigidBody = this.world.createRigidBody(playerRigidBodyDesc);
		const playerColliderDesc = RAPIER.ColliderDesc.cuboid(0.2, 0.2, 0.2);
		this.world.createCollider(playerColliderDesc, playerRigidBody);

		return { mesh: player, rigidBody: playerRigidBody };
	}

	private createBillboard() {
		const nameDiv = document.createElement("div");
		nameDiv.className =
			"rounded-full flex flex-row justify-center items-center space-x-1 bg-black/50 backdrop-blur-xl text-white text-sm p-1 pr-2";

		const name = document.createElement("p");
		name.textContent = this.playerState.getProfile().name;

		const guestImage = document.createElement("img");
		guestImage.src = this.playerState.getProfile().photo;
		guestImage.className = "rounded-full w-5 h-5";

		nameDiv.appendChild(guestImage);
		nameDiv.appendChild(name);

		return new CSS2DObject(nameDiv);
	}

	public update() {
		let playerPos = this.playerState.getState("pos") || { x: this.spawnPos.x, y: 0.25, z: this.spawnPos.z };
		if (this.debug) {
			playerPos = { x: 0, y: 0.25, z: -0.75 };
		}
		const { x, y, z } = playerPos;

		this.mesh.position.set(x, y, z);

		this.rigidBody.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
		this.rigidBody.setTranslation({ x, y, z }, true);

		this.playerState.setState("pos", { x, y, z });
	}
}
