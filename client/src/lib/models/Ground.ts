import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";

export class Ground {
	private mesh: THREE.Mesh;
	public rigidBody: RAPIER.RigidBody;

	constructor(private scene: THREE.Scene, private world: RAPIER.World, private radius: number) {
		const { mesh, rigidBody } = this.spawn();
		this.mesh = mesh;
		this.rigidBody = rigidBody;
	}

	private spawn() {
		const segments = 32;
		const geometry = new THREE.CircleGeometry(this.radius * 2, segments);
		const material = new THREE.MeshStandardMaterial({
			color: "#8ADBA2",
			side: THREE.DoubleSide,
		});
		const plane = new THREE.Mesh(geometry, material);
		plane.rotation.x = -Math.PI / 2;
		plane.position.set(0, 0.01, 0);
		plane.receiveShadow = true;
		this.scene.add(plane);

		// Physics setup
		const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
		const groundBody = this.world.createRigidBody(groundBodyDesc);
		const groundColliderDesc = RAPIER.ColliderDesc.cylinder(0.01, this.radius)
			.setTranslation(0, -0.25, 0);
		this.world.createCollider(groundColliderDesc, groundBody);

		return { mesh: plane, rigidBody: groundBody };
	}
}
