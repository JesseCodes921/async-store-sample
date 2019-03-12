import { EventEmitter } from 'events';

/**
 * Async Store implementation contract.
 */
interface AsyncStore {
  initialize: (emitters: EventEmitter[], error: (...args: any[]) => void, callback: () => void) => void;
  set: (properties: any) => void;
  get: (key: string) => any;
  isInitialized: () => boolean;
  getId: () => string | undefined;
}

export default AsyncStore;
