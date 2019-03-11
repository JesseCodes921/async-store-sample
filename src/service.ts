import * as asyncStore from './core/asyncStore';

/**
 * An example function making use of the request context set in the store.
 *
 * @returns {Promise<void>}
 */
export async function doSomething() {
  console.log('Do something with the request.'); // tslint:disable-line

  await Promise.all([() => logRequestContext()]);
}

/**
 * An example function making use of the request context set in the store.
 *
 * @returns {Promise<void>}
 */
async function logRequestContext() {
  const xId = asyncStore.get('x-id');

  console.log('Request context: ', xId); // tslint:disable-line
}
