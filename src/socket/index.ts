import {createSocketConnection} from '@pushprotocol/socket';
import {EVENTS} from '@pushprotocol/socket/src/lib/constants';
import {useContext} from 'react';
import {VideoCallContext} from 'src/contexts/VideoContext';
import {SocketConfig} from 'src/navigation/screens/chats/helpers/socketHelper';
import {ADDITIONAL_META_TYPE, VideoCallStatus} from 'src/push_video/payloads';

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

const endStream = (stream: any) => {
  stream.getTracks().forEach((track: any) => track.stop());
};

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

const useGlobalSocket = (
  userAddress: string,
  // onIncomingCall: (videoMeta: any) => void,
) => {
  // const [socket, setSocket] = useState<any>(newSocket(userAddress));
  const socket = newSocket(userAddress);
  const {
    isVideoCallInitiator,
    acceptRequestWrapper,
    connectWrapper,
    requestWrapper,
    incomingCall,
    disconnectWrapper,
  } = useContext(VideoCallContext);

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

    // setTimeout(() => {
    //   socket.connect();
    // }, 1000);
  });

  socket.on(EVENTS.USER_FEEDS, (feedItem: any) => {
    try {
      const {payload} = feedItem || {};

      // check for additionalMeta
      if (
        payload.hasOwnProperty('data') &&
        payload.data.hasOwnProperty('additionalMeta')
      ) {
        const additionalMeta = payload.data.additionalMeta;
        console.log('RECEIVED ADDITIONAL META', additionalMeta);

        // check for PUSH_VIDEO
        if (additionalMeta.type === `${ADDITIONAL_META_TYPE.PUSH_VIDEO}+1`) {
          const videoCallMetaData = JSON.parse(additionalMeta.data);
          console.log('RECIEVED VIDEO DATA', videoCallMetaData);

          console.log('status is', VideoCallStatus[videoCallMetaData.status]);

          if (videoCallMetaData.status === VideoCallStatus.INITIALIZED) {
            incomingCall(videoCallMetaData);
          } else if (
            videoCallMetaData.status === VideoCallStatus.RECEIVED ||
            videoCallMetaData.status === VideoCallStatus.RETRY_RECEIVED
          ) {
            connectWrapper(videoCallMetaData);
          } else if (
            videoCallMetaData.status === VideoCallStatus.DISCONNECTED
          ) {
            disconnectWrapper();
          } else if (
            videoCallMetaData.status === VideoCallStatus.RETRY_INITIALIZED &&
            isVideoCallInitiator()
          ) {
            requestWrapper({
              senderAddress: videoCallMetaData.local.address,
              recipientAddress: videoCallMetaData.incoming[0].address,
              chatId: videoCallMetaData.meta.chatId,
              retry: true,
            });
          } else if (
            videoCallMetaData.status === VideoCallStatus.RETRY_INITIALIZED &&
            !isVideoCallInitiator()
          ) {
            acceptRequestWrapper({
              signalData: videoCallMetaData.signalData,
              senderAddress: videoCallMetaData.local.address,
              recipientAddress: videoCallMetaData.incoming[0].address,
              chatId: videoCallMetaData.meta.chatId,
              retry: true,
            });
          }
        }
      }
    } catch (e) {
      console.error('DAPP Error while diplaying received Notification: ', e);
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
  endStream,
  useGlobalSocket,
};
