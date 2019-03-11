import * as domain from 'domain';
import { EventEmitter } from 'events';
import { Request, Response, NextFunction } from 'express';

import StoreDomain, { STORE_KEY } from './StoreDomain';

/**
 * Middleware to initialize the async store and make it
 * accessible from all the subsequent middlewares or
 * async operations triggered afterwards.
 *
 * @returns {(req, res, next) => void}
 */
export function initializeMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    // If the store has already been initialized, ignore it.
    if (isInitialized()) {
      return next();
    }

    const errorHandler = (err: any) => {
      console.error('Error caught in domain:', err); // tslint:disable-line
      res.end({ error: 'An error occurred' });
      next(err);
    };

    initialize([req, res], errorHandler, () => next());
  };
}

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

  initializeStoreDomain(d);

  d.run(callback);
}

/**
 * Sets a <key: value> pair in the store.
 *
 * Example:
 *  set('key', 'value');
 *  set({ key1: 'value1', key2: 'value2' });
 *
 * @param {(string | any)} key
 * @param {*} [value]
 */
export function set(key: string | any, value?: any) {
  let properties: any = {};

  if (typeof key === 'string') {
    properties[key] = value;
  } else if (typeof key === 'object' && key !== null && !value) {
    properties = { ...key };
  } else {
    throw new Error('Invalid arguments provided for asyncStore.set().');
  }

  addToStore(getStore(), properties);
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
  if (!getActiveDomain()) {
    return false;
  }

  return getStore() !== null;
}

/**
 * Initialize the store domain with the initial state (empty object by default).
 *
 * @param {StoreDomain} activeDomain
 * @param {*} [initialState={}]
 */
function initializeStoreDomain(activeDomain: StoreDomain, initialState: any = {}) {
  if (!activeDomain[STORE_KEY]) {
    // Initialize the context in the domain.
    activeDomain[STORE_KEY] = {};
  }

  addToStore(activeDomain[STORE_KEY], initialState);
}

/**
 * Add (or override) properties to the given store.
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
 * Get the store from the active domain.
 *
 * @returns {*}
 */
function getStore(): any {
  const activeDomain = getActiveDomain();

  if (!activeDomain) {
    throw new Error('No active domain found to store.');
  }

  return activeDomain[STORE_KEY];
}
