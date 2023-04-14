import {createSocketConnection} from '@pushprotocol/socket';
import {EVENTS} from '@pushprotocol/socket/src/lib/constants';
import {SocketConfig} from 'src/navigation/screens/chats/helpers/socketHelper';

const enableAudio = (stream: any) => {
  stream.getAudioTracks().forEach((track: any) => (track.enabled = true));
};

const disableAudio = (stream: any) => {
  stream.getAudioTracks().forEach((track: any) => (track.enabled = false));
};

const enableVideo = (stream: any) => {
  stream.getVideoTracks().forEach((track: any) => (track.enabled = true));
};

const disableVideo = (stream: any) => {
  stream.getVideoTracks().forEach((track: any) => (track.enabled = false));
};

const toggleCamera = (stream: any) => {
  stream.getVideoTracks().forEach((track: any) => {
    track._switchCamera();
  });
};

let socket;

const newSocket = (userAddress: string) => {
  return createSocketConnection({
    env: SocketConfig.url,
    apiKey: SocketConfig.key,
    user: userAddress,
    socketType: 'notification',
    socketOptions: {autoConnect: true, reconnectionAttempts: 3},
  });
};

const setupGlobalSocket = (
  userAddress: string,
  onIncomingCall: (videoMeta: any) => void,
) => {
  socket = newSocket(userAddress);

  if (!socket) {
    console.log('Socket not initialized properly!');
    return null;
  }

  socket.on('connect', () => {
    console.log('***//###@@@@ Connected to video socket');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from video socket');
    console.log('connecting agin...');

    socket = newSocket(userAddress);
  });

  socket.on(EVENTS.USER_FEEDS, (feedItem: any) => {
    console.log('got feed feedItem');
    try {
      const {payload} = feedItem || {};
      // if video meta, skip notification
      if (
        payload.hasOwnProperty('data') &&
        payload.data.hasOwnProperty('videoMeta')
      ) {
        const videoMeta = JSON.parse(payload.data.videoMeta);
        console.log('Call feed', Object.keys(videoMeta));
        console.log('Call feed status', videoMeta.status);
        console.log('Status Type', typeof videoMeta.status);
        if (videoMeta.status === 1) {
          console.log('video signal got');
          // incoming call received, do something with it
          onIncomingCall(videoMeta);
        } else if (videoMeta.status === 2) {
          // handleAcceptCall(videoMeta);
        }
      }
    } catch (e) {
      console.error('Notification error: ', e);
    }
  });

  return socket;
};

export {
  enableAudio,
  disableAudio,
  enableVideo,
  disableVideo,
  toggleCamera,
  setupGlobalSocket,
};
