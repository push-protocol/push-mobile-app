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
    //@ts-ignore
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
    // console.log('got feed abishek', Object.keys(feedItem));
    // console.log(
    //   'global socket: feedItem',
    //   feedItem.payload.data.additionalMeta,
    // );

    try {
      if (feedItem.source === 'PUSH_VIDEO') {
        const {payload} = feedItem || {};
        const videoMeta = JSON.parse(payload.data.additionalMeta);
        if (videoMeta.status === 1) {
          // console.log('global socket: video signal got');
          // incoming call received, do something with it
          onIncomingCall(videoMeta);
        } else if (videoMeta.status === 2) {
          // handleAcceptCall(videoMeta);
          // i'm calling the user
          // user sends me the second notification
          // then this once called
          // initalize the peer
        }
      }
    } catch (e) {
      // console.error('Notification error: ', e);
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
