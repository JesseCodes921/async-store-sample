import { Domain } from 'domain';

export const STORE_KEY = '__$store__';

/**
 * The custom domain type with the store.
 */
interface StoreDomain extends Domain {
  [STORE_KEY]?: any;
}

export default StoreDomain;
