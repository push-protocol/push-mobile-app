import {produce} from 'immer';
import React, {createContext, useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';
import {UserChatCredentials} from 'src/navigation/screens/chats/ChatScreen';
import {Video, VideoCallData} from 'src/navigation/screens/video/helpers/video';
import {VideoCallStatus} from 'src/push_video/payloads';
import {setIsReceivingCall} from 'src/redux/videoSlice';
import MetaStorage from 'src/singletons/MetaStorage';

interface RequestWrapperOptionsType {
  senderAddress: string;
  recipientAddress: string;
  chatId: string;
  retry?: boolean;
}

interface AcceptRequestWrapperOptionsType {
  senderAddress: string;
  recipientAddress: string;
  chatId: string;
  signalData: any;
  retry?: boolean;
}

interface VideoCallMetaDataType {
  recipientAddress: string;
  senderAddress: string;
  chatId: string;
  signalData: any;
  status: number;
}

export const initVideoCallData: VideoCallData = {
  meta: {
    chatId: '',
    initiator: {
      address: '',
      signal: null,
    },
  },
  local: {
    stream: null,
    audio: null,
    video: null,
    address: '',
  },
  incoming: [
    {
      stream: null,
      audio: null,
      video: null,
      address: '',
      status: VideoCallStatus.UNINITIALIZED,
      retryCount: 0,
    },
  ],
};

type VideoCallContextType = {
  videoCallData: VideoCallData;
  requestWrapper: (options: RequestWrapperOptionsType) => void;
  createWrapper: () => Promise<void>;
  acceptRequestWrapper: (
    options: AcceptRequestWrapperOptionsType,
  ) => Promise<void>;
  connectWrapper: (options: VideoCallMetaDataType) => void;
  disconnectWrapper: () => void;
  incomingCall: (options: VideoCallMetaDataType) => Promise<void>;
  setVideoCallData: any;
  toggleVideoWrapper: () => void;
  toggleAudioWrapper: () => void;
  isVideoCallInitiator: () => boolean;
};

export const VideoCallContext = createContext<VideoCallContextType>({
  acceptRequestWrapper: () => Promise.resolve(),
  connectWrapper: () => {},
  createWrapper: () => Promise.resolve(),
  disconnectWrapper: () => {},
  incomingCall: () => Promise.resolve(),
  isVideoCallInitiator: () => false,
  requestWrapper: () => {},
  setVideoCallData: () => {},
  toggleAudioWrapper: () => {},
  toggleVideoWrapper: () => {},
  videoCallData: initVideoCallData,
});

const VideoCallContextProvider = ({children}: {children: React.ReactNode}) => {
  const [data, setData] = useState<VideoCallData>(initVideoCallData);
  const videoObjectRef = useRef<Video | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const {pgpPrivateKey}: UserChatCredentials =
        await MetaStorage.instance.getUserChatData();
      videoObjectRef.current = new Video({
        pgpPrivateKey,
        setData,
      });
    })();
  }, []);

  // wrapper methods over the class methods

  const createWrapper = async (): Promise<void> => {
    console.log('CREATE WRAPPER');
    if (!videoObjectRef.current) {
      return;
    }

    try {
      if (!data.local.stream) {
        await videoObjectRef.current.create({video: true, audio: true});
      }
    } catch (err) {
      console.log('Error in getting local stream', err);
    }
  };

  const requestWrapper = ({
    senderAddress,
    recipientAddress,
    chatId,
    retry = false,
  }: RequestWrapperOptionsType): void => {
    if (!videoObjectRef.current) {
      return;
    }
    try {
      console.log('REQUEST WRAPPER');

      videoObjectRef.current.request({
        senderAddress,
        recipientAddress,
        chatId,
        retry,
      });
    } catch (err) {
      console.log('Error in requesting video call', err);
    }
  };

  const acceptRequestWrapper = async ({
    senderAddress,
    recipientAddress,
    chatId,
    signalData,
    retry = false,
  }: AcceptRequestWrapperOptionsType): Promise<void> => {
    console.log('ACCEPT REQUEST WRAPPER');
    dispatch(setIsReceivingCall(false));
    if (!videoObjectRef.current) {
      return;
    }
    try {
      await videoObjectRef.current.acceptRequest({
        signalData: signalData ? signalData : data.meta.initiator.signal,
        senderAddress,
        recipientAddress,
        chatId,
        retry,
      });
    } catch (err) {
      console.log('Error in requesting video call', err);
    }
  };

  const connectWrapper = (videoCallMetaData: VideoCallMetaDataType) => {
    if (!videoObjectRef.current) {
      return;
    }
    console.log('CONNECT WRAPPER');
    videoObjectRef.current.connect({
      signalData: videoCallMetaData.signalData,
    });
  };

  const disconnectWrapper = () => {
    dispatch(setIsReceivingCall(false));
    if (!videoObjectRef.current) {
      return;
    }
    console.log('DISCONNECT WRAPPER');
    videoObjectRef.current.disconnect();
  };

  const incomingCall = async (videoCallMetaData: VideoCallMetaDataType) => {
    dispatch(setIsReceivingCall(true));
    if (!videoObjectRef.current) {
      console.log('videoObjectRef.current', videoObjectRef.current);
      return;
    }
    console.log('INCOMING CALL', {
      senderAddress: videoCallMetaData.senderAddress,
      recipientAddress: videoCallMetaData.recipientAddress,
      chatId: videoCallMetaData.chatId,
    });
    videoObjectRef.current.setData(oldData => {
      return produce(oldData, draft => {
        draft.local.address = videoCallMetaData.recipientAddress;
        draft.local.audio = true;
        draft.local.video = true;
        draft.incoming[0].address = videoCallMetaData.senderAddress;
        draft.incoming[0].status = VideoCallStatus.RECEIVED;
        draft.meta.chatId = videoCallMetaData.chatId;
        draft.meta.initiator.address = videoCallMetaData.senderAddress;
        draft.meta.initiator.signal = videoCallMetaData.signalData;
      });
    });
  };

  const toggleVideoWrapper = () => {
    if (!videoObjectRef.current) {
      return;
    }
    console.log('TOGGLE VIDEO WRAPPER', data.local.video);
    videoObjectRef.current.enableVideo({state: !data.local.video});
  };

  const toggleAudioWrapper = () => {
    if (!videoObjectRef.current) {
      return;
    }
    console.log('TOGGLE AUDIO WRAPPER', data.local.audio);
    videoObjectRef.current.enableAudio({state: !data.local.audio});
  };

  const isVideoCallInitiator = () => {
    if (!videoObjectRef.current) {
      return false;
    }
    return videoObjectRef.current?.isInitiator();
  };

  return (
    <VideoCallContext.Provider
      value={{
        videoCallData: data,
        setVideoCallData: setData,
        createWrapper,
        requestWrapper,
        acceptRequestWrapper,
        connectWrapper,
        disconnectWrapper,
        incomingCall,
        toggleVideoWrapper,
        toggleAudioWrapper,
        isVideoCallInitiator,
      }}>
      {children}
    </VideoCallContext.Provider>
  );
};

export default VideoCallContextProvider;
