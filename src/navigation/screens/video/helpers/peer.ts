import {createSocketConnection} from '@pushprotocol/socket';
import {ENV, EVENTS} from '@pushprotocol/socket/src/lib/constants';
import RNPeer from 'react-native-simple-peer';
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import JsonHelper from 'src/helpers/JsonHelper';
import {Call} from 'src/redux/videoSlice';

import {sendCallPayload} from './connection';
import {VIDEO_DATA} from './constants';

interface UsePeerArgs {
  calling: boolean;
  userMedia: MediaStream;
  connectionRef: any;
  setAnotherUserMedia: any;
  call: Call;
  toAddress: string;
  fromAddress: string;
  rcalled: any;
  rsetCalled: any;
  isVideoOn: boolean;
  isAudioOn: boolean;
  setIncomingVideoStatus: (status: boolean) => void;
  setIncomingAudioStatus: (status: boolean) => void;
  onEndCall: () => void;
}

let k = false;

const usePeer = ({
  calling,
  userMedia,
  connectionRef,
  setAnotherUserMedia,
  call,
  toAddress,
  fromAddress,
  rcalled,
  rsetCalled,
  isVideoOn,
  isAudioOn,
  setIncomingVideoStatus,
  setIncomingAudioStatus,
  onEndCall,
}: UsePeerArgs) => {
  const peer = new RNPeer({
    initiator: calling,
    trickle: true,
    debugConsole: false,
    config: {},
    webRTC: {
      RTCPeerConnection,
      RTCIceCandidate,
      RTCSessionDescription,
    },
    stream: userMedia,
  });
  if (calling) {
    console.log('calling the peer');

    try {
      const socket = createSocketConnection({
        user: caip10ToWallet(fromAddress),
        env: ENV.STAGING,
        socketOptions: {autoConnect: true, reconnectionAttempts: 3},
      });

      if (socket) {
        socket.on(EVENTS.USER_FEEDS, (feedItem: any) => {
          console.log('got feed abishek', Object.keys(feedItem));
          try {
            if (feedItem.source === 'PUSH_VIDEO') {
              const {payload} = feedItem || {};
              const videoMeta = JSON.parse(payload.data.additionalMeta);
              if (videoMeta.status === 1) {
              } else if (videoMeta.status === 2) {
                const signalData = videoMeta.signalData;
                console.log('got the signal data', signalData);
                peer.signal(signalData);
              }
            }
          } catch (e) {
            console.error('Notification error: ', e);
          }
        });

        socket.on(EVENTS.CONNECT, () => {
          console.log('*****() socket connection connection done');
          peer.send(
            JSON.stringify({
              type: VIDEO_DATA.VIDEO_STATUS,
              isVideoOn: isVideoOn,
            }),
          );
          peer.send(
            JSON.stringify({
              type: VIDEO_DATA.AUDIO_STATUS,
              isAudioOn: isAudioOn,
            }),
          );
        });

        socket.on(EVENTS.DISCONNECT, () => {
          console.log('caller disconn');
        });
      }
    } catch (error) {
      console.log('err', error);
    }

    // @ts-ignore
    peer.on('signal', (_data: any) => {
      if (!rcalled && !k) {
        console.log('CALL USER -> SIGNAL CALLBACK');
        rsetCalled(true);
        k = true;

        // ring the user
        sendCallPayload({
          from: fromAddress,
          to: toAddress,
          name: 'John Doe',
          signalData: _data,
          status: 1,
          chatId: call.chatId,
        });
        // .then(r => console.log(r.status))
        // .catch(e => console.error(e));
      }
    });
  } else {
    console.log('answer call -> data');
    peer.signal(call.signal);
    console.log('Sending Payload for answer call - Step 1');

    // @ts-ignore
    peer.on('signal', (data: any) => {
      console.log('ANSWER CALL -> SIGNAL CALLBACK');

      // send answer call notification
      console.log('Sending Payload for answer call - Peer on Signal - Step 2');
      if (!rcalled) {
        rsetCalled(true);
        sendCallPayload({
          from: toAddress,
          to: fromAddress,
          name: 'name',
          signalData: data,
          status: 2,
          chatId: call.chatId,
        });
        // .then(r => console.log(r.status))
        // .catch(e => console.error(e));
      }
    });
  }

  // @ts-ignore
  peer.on('error', (err: any) => {
    console.log('!!!!!!!! err', err);
  });

  // @ts-ignore
  peer.on('connect', () => {
    // wait for 'connect' event before using the data channel
    peer.send('hey caller, how is it going?');

    peer.send(
      JSON.stringify({type: VIDEO_DATA.VIDEO_STATUS, isVideoOn: isVideoOn}),
    );
    peer.send(
      JSON.stringify({type: VIDEO_DATA.AUDIO_STATUS, isAudioOn: isAudioOn}),
    );
  });

  // @ts-ignore
  peer.on('stream', (currentStream: MediaStream) => {
    console.log('++ GOT STREAM BACK IN ANSWERCALL');
    setAnotherUserMedia(currentStream);
  });

  // @ts-ignore
  peer.on('data', (data: any) => {
    if (JsonHelper.isJSON(data)) {
      const jsonData = JSON.parse(data);
      if (jsonData.type === VIDEO_DATA.VIDEO_STATUS) {
        setIncomingVideoStatus(jsonData.isVideoOn);
      } else if (jsonData.type === VIDEO_DATA.AUDIO_STATUS) {
        setIncomingAudioStatus(jsonData.isAudioOn);
      } else if (jsonData.type === VIDEO_DATA.END_CALL) {
        onEndCall();
      }
    }
  });

  // @ts-ignore
  peer.on('disconnect', () => {
    onEndCall();
  });

  connectionRef.current = peer;

  return peer;
};

export {usePeer};
