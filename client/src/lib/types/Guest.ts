// Libs
import * as THREE from "three";

// Types
import type { PlayerState } from "playroomkit";

export type Guest = {
    state: PlayerState;
    guestMesh: THREE.Mesh;
}