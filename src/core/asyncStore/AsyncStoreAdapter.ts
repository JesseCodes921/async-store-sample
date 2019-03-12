/**
 * Async Store adapter types.
 */
enum AsyncStoreAdapter {
  DOMAIN = 'domain'

  // Later we can add other implementaions of the store as a new adapter,
  // for instance: add
  //  ASYNC_HOOKS = 'async_hooks'
  // and add an implmenetation as per the API requirements.
}

export default AsyncStoreAdapter;
