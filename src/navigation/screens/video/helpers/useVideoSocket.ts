import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {setCall} from 'src/redux/videoSlice';
import {setupGlobalSocket} from 'src/socket';

const useVideoSocket = (userAddress: string) => {
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
    setupGlobalSocket(userAddress, onIncomingCall);
  }, []);
};

export default useVideoSocket;
