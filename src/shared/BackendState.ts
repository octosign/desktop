import BackendConfig from './BackendConfig';

/**
 * Representation of backend and its state
 */
interface BackendState {
  /**
   * Unique identifier of the backend
   */
  slug: string;
  config: BackendConfig;
  /**
   * True if it's available or error message if not
   */
  available: true | string;
}

export default BackendState;
