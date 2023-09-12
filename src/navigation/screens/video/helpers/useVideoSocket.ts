import {useNavigation} from '@react-navigation/native';
import {useContext, useEffect} from 'react';
import GLOBALS from 'src/Globals';
import {VideoCallContext} from 'src/contexts/VideoContext';
import ENV_CONFIG from 'src/env.config';
import MetaStorage from 'src/singletons/MetaStorage';

export const getCallInfoFromServer = async (
  userAddress: string,
): Promise<any> => {
  try {
    console.log('getting call info from server');
    const URI = `${ENV_CONFIG.EPNS_SERVER}/v1/users/eip155:${userAddress}/feeds?page=1&limit=1&spam=false&showHidden=true`;
    console.log('URI', URI);
    const userFeeds = await fetch(URI).then(response => response.json());
    console.log('userFeeds', userFeeds);
    if (userFeeds.feeds.length > 0) {
      const videoMeta = JSON.parse(
        userFeeds.feeds[0].payload.data.additionalMeta.data
          ? userFeeds.feeds[0].payload.data.additionalMeta.data
          : userFeeds.feeds[0].payload.data.additionalMeta,
      );
      console.log('got videoMeta', videoMeta);
      return [true, videoMeta];
    }
    return [false, {}];
  } catch (error) {
    return [false, {}];
  }
};

const useVideoSocket = (userAddress: string, callAccepted: boolean) => {
  const navigation = useNavigation();
  const {acceptRequestWrapper, incomingCall} = useContext(VideoCallContext);

  useEffect(() => {
    (async () => {
      const alreadyNavigated =
        await MetaStorage.instance.isBackgroundCallAccepted();
      if (callAccepted && !alreadyNavigated) {
        await MetaStorage.instance.setBackgroundCallAccepted(true);
        // fetch the caller info from the backend
        const [success, videoMeta] = await getCallInfoFromServer(userAddress);
        if (success) {
          await incomingCall(videoMeta, false);
          acceptRequestWrapper({
            senderAddress: videoMeta.recipientAddress,
            recipientAddress: videoMeta.senderAddress,
            chatId: videoMeta.chatId,
            signalData: videoMeta.signalData,
          });

          // @ts-ignore
          navigation.navigate(GLOBALS.SCREENS.VIDEOCALL);
        }
        return;
      }
    })();
  }, [callAccepted]);
};

export default useVideoSocket;
