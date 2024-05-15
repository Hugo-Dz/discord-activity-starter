// Svelte
import { writable } from 'svelte/store';

// Types
import { Guest } from '$lib/models/Guest';

export const guests = writable<Guest[]>([]);