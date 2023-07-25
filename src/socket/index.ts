import {VideoCallStatus} from '@pushprotocol/restapi';
import {ADDITIONAL_META_TYPE} from '@pushprotocol/restapi/src/lib/payloads';
import {EVENTS, createSocketConnection} from '@pushprotocol/socket';
import {useContext, useEffect, useRef} from 'react';
import InCallManager from 'react-native-incall-manager';
import {VideoCallContext} from 'src/contexts/VideoContext';
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

const endStream = (stream: any) => {
  stream.getTracks().forEach((track: any) => track.stop());
  stream.release();
  InCallManager.stop();
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

const useGlobalSocket = (userAddress: string) => {
  // const [socket, setSocket] = useState(newSocket(userAddress));
  const socket = useRef<any>() as React.MutableRefObject<any>;

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

  useEffect(() => {
    if (socket.current === undefined) {
      socket.current = newSocket(userAddress);

      // @ts-ignore
      socket.current.on(EVENTS.CONNECT, () => {
        console.log('---------- CONNECTED TO PUSH SOCKET ----------');
      });

      // @ts-ignore
      socket.current.on(EVENTS.DISCONNECT, () => {
        console.log('---------- DISCONNECTED FROM PUSH SOCKET ----------');
      });

      // @ts-ignore
      socket.current.on(EVENTS.USER_FEEDS, (feedItem: any) => {
        console.log('abishek got feeds');

        try {
          const {payload} = feedItem || {};

          // check for additionalMeta
          if (
            payload &&
            payload.hasOwnProperty('data') &&
            payload.data.hasOwnProperty('additionalMeta')
          ) {
            const additionalMeta = payload.data.additionalMeta;

            // check for PUSH_VIDEO
            if (
              additionalMeta !== null &&
              additionalMeta.type === `${ADDITIONAL_META_TYPE.PUSH_VIDEO}+1`
            ) {
              const videoCallMetaData = JSON.parse(additionalMeta.data);
              console.log(
                payload.data,
                'RECIEVED VIDEO DATA',
                videoCallMetaData.status,
                isVideoCallInitiator(),
              );

              console.log(
                'status is',
                VideoCallStatus[videoCallMetaData.status],
              );

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
                videoCallMetaData.status ===
                  VideoCallStatus.RETRY_INITIALIZED &&
                isVideoCallInitiator()
              ) {
                requestWrapper({
                  senderAddress: videoCallMetaData.recipientAddress,
                  recipientAddress: videoCallMetaData.senderAddress,
                  chatId: videoCallMetaData.chatId,
                  retry: true,
                });
              } else if (
                videoCallMetaData.status ===
                  VideoCallStatus.RETRY_INITIALIZED &&
                !isVideoCallInitiator()
              ) {
                acceptRequestWrapper({
                  signalData: videoCallMetaData.signalData,
                  senderAddress: videoCallMetaData.recipientAddress,
                  recipientAddress: videoCallMetaData.senderAddress,
                  chatId: videoCallMetaData.chatId,
                  retry: true,
                });
              }
            }
          }
        } catch (e) {
          console.error('Error while diplaying received Notification: ', e);
        }
      });
    }

    return () => {
      socket.current.disconnect();
    };
  }, []);

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
