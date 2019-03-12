import { EventEmitter } from 'events';
import { Request, Response, NextFunction } from 'express';

import AsyncStore from './AsyncStore';
import AsyncStoreAdapter from './AsyncStoreAdapter';

// Implementations of Async store.
import * as domainImplementation from './implementations/domain';

/**
 * The adapter which was used to initialize the store. The value
 * is set when this is initialized the first time.
 *
 * Note: There could be only one single, centralized store so,
 * once initialized the store cannot be re-initialized.
 */
let initializedAdapter: AsyncStoreAdapter;

/**
 * Middleware to initialize the async store and make it
 * accessible from all the subsequent middlewares or
 * async operations triggered afterwards.
 *
 * @param {AsyncStoreAdapter} [adapter=AsyncStoreAdapter.DOMAIN]
 * @returns {(req, res, next) => void}
 */
export function initializeMiddleware(adapter: AsyncStoreAdapter = AsyncStoreAdapter.DOMAIN) {
  return (req: Request, res: Response, next: NextFunction) => {
    // If the store has already been initialized, ignore it.
    console.log('Initializing middleware'); // tslint:disable-line

    if (isInitialized()) {
      return next();
    }

    console.log('Initializing the async store in the middleware.'); // tslint:disable-line

    const errorHandler = (err: any) => {
      console.error('Error:', err); // tslint:disable-line

      next(err);
    };

    initialize(adapter)([req, res], errorHandler, next);
  };
}

/**
 * Initialize the async store based on the adapter provided.
 *
 * @param {AsyncStoreAdapter} [adapter=AsyncStoreAdapter.DOMAIN]
 * @returns {(emitters: EventEmitter[], error: (...args: any[]) => void, callback: () => void)}
 */
export function initialize(adapter: AsyncStoreAdapter = AsyncStoreAdapter.DOMAIN) {
  if (isInitialized()) {
    throw new Error('Async store already initialized, cannot re-initialize again.');
  }

  const instance = getInstance(adapter);

  return (emitters: EventEmitter[], error: (...args: any[]) => void, callback: () => void) =>
    instance.initialize(emitters, error, () => {
      initializedAdapter = adapter;
      callback();
    });
}

/**
 * Sets properties in the store.
 *
 * Example:
 *  set({ key1: 'value1', key2: 'value2' });
 *
 * @param {*} properties
 */
export function set(properties: any) {
  if (isInitialized()) {
    getInstance(initializedAdapter).set(properties);
  }
}

/**
 * Get a value by a key from the store.
 *
 * @param {string} key
 * @returns {*}
 */
export function get(key: string): any {
  return initializedAdapter && getInstance(initializedAdapter).get(key);
}

/**
 * Check if the store has been initialized.
 *
 * @returns {boolean}
 */
export function isInitialized(): boolean {
  return initializedAdapter && getInstance(initializedAdapter).isInitialized();
}

/**
 * Get's the unique domain id created for the current context / scope.
 *
 * @returns {(string | undefined)}
 */
export function getId(): string | undefined {
  return initializedAdapter && getInstance(initializedAdapter).getId();
}

/**
 * Get the adapter instance based on adapter type.
 *
 * @param {AsyncStoreAdapter} adapter
 * @returns {AsyncStore}
 */
function getInstance(adapter: AsyncStoreAdapter): AsyncStore {
  switch (adapter) {
    case AsyncStoreAdapter.DOMAIN:
      return domainImplementation;

    default:
      throw new Error(`Invalid async store adapter provided ${adapter}.`);
  }
}
