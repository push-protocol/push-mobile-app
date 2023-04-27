import {useNavigation} from '@react-navigation/native';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import GLOBALS from 'src/Globals';
import {setCall} from 'src/redux/videoSlice';
import {setupGlobalSocket} from 'src/socket';

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

  const userAddres = '0xE653670AB71600983C2843434d6D0aBD946768A8';
  const URI = `https://backend-staging.epns.io/apis/v1/users/eip155:${userAddres}/feeds?page=1&limit=1&spam=false&showHidden=true`;
  useEffect(() => {
    (async () => {
      if (callAccepted) {
        console.log('call accepted');
        const userFeeds = await fetch(URI).then(response => response.json());
        if (userFeeds.feeds.length > 0) {
          const videoMeta = JSON.parse(
            userFeeds.feeds[0].payload.data.videoMeta,
          );
          // console.log('got feed', typeof videoMeta);
          // console.log('obj', {
          //   from: videoMeta.fromUser,
          //   to: userAddress,
          //   name: videoMeta.name,
          //   signal: videoMeta.signalData,
          //   isReceivingCall: false,
          //   calling: true,
          // });

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
        console.log('all already accepted');
        return;
      } else {
        setupGlobalSocket(userAddress, onIncomingCall);
      }
    })();
  }, [callAccepted]);
};

export default useVideoSocket;
