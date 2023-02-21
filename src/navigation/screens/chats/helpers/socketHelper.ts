import Globals from 'src/Globals';
import ENV_CONFIG from 'src/env.config';

const USE_WEBSOCKETS = Globals.SOCKETS.USE_SOCKETS;
const API_KEY = ENV_CONFIG.SOCKET_KEY;

const SocketConfig = {
  key: API_KEY,
  useSocket: USE_WEBSOCKETS,
  url: ENV_CONFIG.PROD_ENV ? 'prod' : 'staging',
};

export {SocketConfig};
