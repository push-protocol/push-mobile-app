import {useNavigation} from '@react-navigation/native';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import GLOBALS from 'src/Globals';
import ENV_CONFIG from 'src/env.config';
import {setCall} from 'src/redux/videoSlice';
import {setupGlobalSocket} from 'src/socket';

const getCallInfoFromServer = async (userAddress: string): Promise<any> => {
  try {
    const URI = `${ENV_CONFIG.EPNS_SERVER}/v1/users/eip155:${userAddress}/feeds?page=1&limit=1&spam=false&showHidden=true`;
    const userFeeds = await fetch(URI).then(response => response.json());
    if (userFeeds.feeds.length > 0) {
      const videoMeta = JSON.parse(userFeeds.feeds[0].payload.data.videoMeta);
      return [true, videoMeta];
    }
  } catch (error) {
    return [false, {}];
  }
};

const useVideoSocket = (userAddress: string, callAccepted: boolean) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const onIncomingCall = (videoMeta: any) => {
    dispatch(
      setCall({
        isReceivingCall: true,
        from: videoMeta.fromUser,
        to: userAddress,
        name: videoMeta.name,
        signal: videoMeta.signalData,
      }),
    );
  };

  useEffect(() => {
    (async () => {
      if (callAccepted) {
        // fetch the caller info from the backend
        const [success, videoMeta] = await getCallInfoFromServer(userAddress);
        if (success) {
          dispatch(
            setCall({
              from: videoMeta.fromUser,
              to: userAddress,
              name: videoMeta.name,
              signal: videoMeta.signalData,
              isReceivingCall: false,
              calling: false,
            }),
          );

          // @ts-ignore
          navigation.navigate(GLOBALS.SCREENS.VIDEOCALL);
        }
        return;
      } else {
        // listen to incomming call
        setupGlobalSocket(userAddress, onIncomingCall);
      }
    })();
  }, [callAccepted]);
};

export default useVideoSocket;
