import * as domain from 'domain';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

import StoreDomain, { STORE_KEY, ID_KEY } from '../StoreDomain';

/**
 * Initialize the store domain and enable
 * all the async middelwares / callacks triggered
 * via the provided callback to have access to the store.
 *
 * @param {EventEmitter[]} emitters         Emitters to add to the domain
 * @param {(...args: any[]) => void} error  Error handler to listen for the error even
 * @param {() => void} callback             Callback function to trigger once domain is initialized
 */
export function initialize(emitters: EventEmitter[], error: (...args: any[]) => void, callback: () => void) {
  const d: StoreDomain = domain.create();

  emitters.forEach(emitter => d.add(emitter));

  d.on('error', error);

  // Initialize the context in the domain.
  d[STORE_KEY] = {};
  d[ID_KEY] = uuidv4();

  d.run(callback);
}

/**
 * Sets a <key: value> pair in the store.
 *
 * Example:
 *  set({ key1: 'value1', key2: 'value2' });
 *
 * @param {*} properties
 */
export function set(properties: any) {
  if (properties && typeof properties === 'object') {
    addToStore(getStore(), properties);

    return;
  }

  throw new Error('Invalid arguments provided for asyncStore.set()');
}

/**
 * Get a value by a key from the store.
 *
 * @param {string} key
 * @returns {*}
 */
export function get(key: string): any {
  const store = getStore();

  if (!store) {
    return null;
  }

  return store[key];
}

/**
 * Check if the store has been initialized in the active domain.
 *
 * @returns {boolean}
 */
export function isInitialized(): boolean {
  console.log('isInitialized() checking'); // tslint:disable-line
  if (!getActiveDomain()) {
    return false;
  }

  return !!getActiveDomain()[STORE_KEY];
}

/**
 * Add (or override) properties to the given store (mutates the central store object).
 *
 * @param {*} store
 * @param {*} properties
 */
function addToStore(store: any, properties: any) {
  Object.assign(store, properties);
}

/**
 * Get the active domain.
 *
 * @returns {StoreDomain}
 */
function getActiveDomain(): StoreDomain {
  return process.domain as StoreDomain;
}

/**
 * Get's the unique domain id created for the current context / scope.
 *
 * @returns {(string | undefined)}
 */
export function getId(): string | undefined {
  const activeDomain = getActiveDomain();

  return activeDomain && activeDomain[ID_KEY];
}

/**
 * Get the store from the active domain.
 *
 * @returns {*}
 */
function getStore(): any {
  console.log('getStore()'); // tslint:disable-line
  const activeDomain = getActiveDomain();

  if (!activeDomain) {
    throw new Error('No active domain found in store.');
  }

  return activeDomain[STORE_KEY];
}
