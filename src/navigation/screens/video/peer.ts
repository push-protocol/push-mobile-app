import RNPeer from 'react-native-simple-peer';
import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';

interface UsePeerArgs {
  calling: boolean;
  userMedia: MediaStream;
  connectionRef: any;
  setAnotherUserMedia: any;
  call: any;
  toAddress: string;
  fromAddress: string;
}

const usePeer = ({
  calling,
  userMedia,
  connectionRef,
  setAnotherUserMedia,
  call,
  toAddress,
  fromAddress,
}: UsePeerArgs) => {
  let receiverPeerSignalled = false;
  const peer = new RNPeer({
    initiator: true,
    trickle: true,
    config: {},
    webRTC: {
      RTCPeerConnection,
      RTCIceCandidate,
      RTCSessionDescription,
    },
    stream: userMedia,
  });
  if (calling) {
  } else {
    console.log('answer call -> data');

    const res = peer.signal(call.signal);
    console.log('got res', res);

    console.log('Sending Payload for answer call - Step 1');

    // @ts-ignore
    peer.on('signal', (data: any) => {
      console.log('ANSWER CALL -> SIGNAL CALLBACK');
      console.log('RECIEVER PEER SIGNALED', receiverPeerSignalled);

      // send answer call notification
      // Prepare post request
      // 1 is call initiated, 2 is call answered, 3 is completed
      console.log('Sending Payload for answer call - Peer on Signal - Step 2');
      if (!receiverPeerSignalled) {
        receiverPeerSignalled = true;

        console.log(
          'Sending Payload for answer call - Peer on Signal - Step 3',
          receiverPeerSignalled,
        );
        const videoPayload: any = {
          userToCall: toAddress,
          fromUser: fromAddress,
          signalData: data,
          name: 'name',
          status: 2,
        };
        let identityPayload = {
          notification: {
            title: 'VideoCall',
            body: 'VideoCall',
          },
          data: {
            amsg: 'VideoCall',
            asub: 'VideoCall',
            type: '3',
            etime: Date.now() + 245543,
            hidden: '1',
            videoMeta: videoPayload,
          },
        };

        const identityType: number = 2;
        const stringifiedData: string = JSON.stringify(identityPayload);
        const identity: string = `${identityType}+${stringifiedData}`;

        const payload: any = {
          sender: `eip155:42:${toAddress}`,
          recipient: `eip155:42:${fromAddress}`,
          identity: identity,
          source: 'PUSH_VIDEO',
        };

        console.log('****/// sending payload', payload);

        const requestOptions = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        };
        fetch(
          'https://backend-staging.epns.io/apis/v1/payloads/video/poc',
          requestOptions,
        );
      }
      // socket.emit('answerCall', { signal: data, to: call.from });
    });

    // @ts-ignore
    peer.on('connect', () => {
      // wait for 'connect' event before using the data channel
      peer.send('hey caller, how is it going?');
    });

    // @ts-ignore
    peer.on('stream', (currentStream: MediaStream) => {
      console.log('++ GOT STREAM BACK IN ANSWERCALL');
      setAnotherUserMedia(currentStream);
    });
  }

  // @ts-ignore
  peer.on('error', (err: any) => {
    console.log('!!!!!!!! err', err);
  });

  connectionRef.current = peer;

  return peer;
};

export {usePeer};
