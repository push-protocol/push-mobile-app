import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import {GiphyDialog, GiphyDialogEvent} from '@giphy/react-native-sdk';
import {approveRequestPayload} from '@pushprotocol/restapi/src/lib/chat';
import Clipboard from '@react-native-clipboard/clipboard';
import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import {produce} from 'immer';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch} from 'react-redux';
import Globals from 'src/Globals';
import {ConnectedUser} from 'src/apis';
import * as PushNodeClient from 'src/apis';
import {Toaster} from 'src/components/indicators/Toaster';
import {ToasterOptions} from 'src/components/indicators/Toaster';
import {VideoCallContext} from 'src/contexts/VideoContext';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import {EncryptionInfo} from 'src/navigation/screens/chats/components/EncryptionInfo';
import {VideoCallStatus} from 'src/push_video/payloads';
import {setCall} from 'src/redux/videoSlice';

import {AcceptIntent, MessageComponent} from './components';
import {CustomScroll} from './components/CustomScroll';
import './giphy/giphy.setup';
import {getFormattedAddress} from './helpers/chatAddressFormatter';
import {ChatMessage} from './helpers/chatResolver';
import {useConversationLoader} from './helpers/useConverstaionLoader';
import {useSendMessage} from './helpers/useSendMessage';

interface ChatScreenParam {
  cid: string;
  senderAddress: string;
  connectedUser: ConnectedUser;
  combinedDID: string;
  isIntentSendPage: boolean;
  isIntentReceivePage: boolean;
  chatId?: string;
}

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const SectionHeight =
  Platform.OS === 'android' ? windowHeight - 126 : windowHeight - 195;

const SingleChatScreen = ({route}: any) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const toastRef = useRef<any>();
  const {
    cid,
    senderAddress,
    connectedUser,
    isIntentSendPage,
    combinedDID,
    chatId,
  }: ChatScreenParam = route.params;

  const [isIntentReceivePage, setisIntentReceivePage] = useState<boolean>(
    route.params.isIntentReceivePage,
  );

  const navigation = useNavigation();
  const [text, setText] = React.useState('');
  const [textInputHeight, setTextInputHeight] = useState(10);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [listHeight, setListHeight] = useState(0);
  const [indicatorPos] = useState(() => new Animated.Value(0));
  const [indicatorSize, setIndicatorSize] = useState(0);
  // const [indicatorDiff, setIndicatorDiff] = useState(0);
  const SCORLL_OFF_SET = 250;

  const [
    isLoading,
    chatMessages,
    pushChatDataDirect,
    loadMoreData,
    isLoadingMore,
  ] = useConversationLoader(
    cid,
    connectedUser.privateKey,
    connectedUser.wallets,
    senderAddress,
    combinedDID,
  );

  const [isSending, sendMessage, isSendReady, tempChatMessage] = useSendMessage(
    connectedUser,
    senderAddress,
    isIntentSendPage,
    toastRef.current ? toastRef.current.showToast : null,
  );

  const senderAddressFormatted = getFormattedAddress(senderAddress);
  const handleSend = async () => {
    const _text = text;
    setText('');
    setTextInputHeight(0);
    Keyboard.dismiss();
    if (_text.trim() === '') {
      return;
    }

    const res = await sendMessage({
      messageType: 'Text',
      message: _text,
      combinedDID: combinedDID,
    });

    if (!res) {
      return;
    }

    const [_cid, msg] = res;

    if (_cid && msg) {
      console.log('_after sending got', _cid);
      pushChatDataDirect(_cid, msg);
    }
  };

  const onAccept = async () => {
    setIsAccepting(true);

    const APPROVED_INTENT = 'Approved';
    const body = approveRequestPayload(
      senderAddress,
      connectedUser.wallets,
      APPROVED_INTENT,
    );

    const sig = 'xyz';
    const sigType = 'a';

    body.verificationProof = sig;
    body.sigType = sigType;
    body.signature = sig;

    const res = await PushNodeClient.approveIntent2(body);
    console.log('approved intent', res);
    setisIntentReceivePage(false);
    setIsAccepting(false);
  };

  const onDecline = () => {};

  const handleAddressCopy = () => {
    Clipboard.setString(senderAddress);
    toastRef.current.showToast(
      'Address copied to clipboard',
      '',
      ToasterOptions.TYPE.GRADIENT_PRIMARY,
    );
  };

  // const dispatch = useDispatch();
  const {setVideoCallData} = useContext(VideoCallContext);

  const startVideoCall = () => {
    // dispatch(
    //   setCall({
    //     isReceivingCall: false,
    //     calling: true,
    //     to: senderAddress,
    //     from: connectedUser.wallets,
    //     call: {},
    //     chatId: chatId,
    //   }),
    // );

    setVideoCallData((oldData: any) => {
      return produce(oldData, (draft: any) => {
        draft.local.address = caip10ToWallet(connectedUser.wallets);
        draft.incoming[0].address = senderAddress;
        draft.incoming[0].status = VideoCallStatus.INITIALIZED;
        draft.meta.chatId = chatId;
        draft.meta.initiator.address = caip10ToWallet(connectedUser.wallets);
      });
    });

    // @ts-ignore
    navigation.navigate(Globals.SCREENS.VIDEOCALL);
  };

  // giphy listener
  useEffect(() => {
    const listener = GiphyDialog.addListener(
      GiphyDialogEvent.MediaSelected,
      e => {
        // Handle send gif
        const gifUrl: string = e.media.url;

        // checks if url empty
        if (gifUrl.trim() === '') {
          return;
        }

        GiphyDialog.hide();
        const res = sendMessage({
          messageType: 'GIF',
          message: gifUrl,
          combinedDID: combinedDID,
        }).then(_res => {
          if (_res) {
            const [_cid, msg] = _res;
            if (_cid && msg) {
              pushChatDataDirect(_cid, msg);
            }
          }
        });
        if (!res) {
          return;
        }
      },
    );
    return () => {
      listener.remove();
    };
  }, []);

  // scroll bar indicator
  useEffect(() => {
    const visibleHeight = Math.min(SectionHeight, listHeight);

    const _indicatorSize =
      listHeight > visibleHeight
        ? (visibleHeight * visibleHeight) / listHeight
        : visibleHeight;
    // const difference =
    //   visibleHeight > _indicatorSize ? visibleHeight - _indicatorSize : 1;

    setIndicatorSize(_indicatorSize);
    // setIndicatorDiff(difference);
  }, [listHeight, indicatorPos]);

  const [keyboardStatus, setKeyboardStatus] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardStatus(true);
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const includeDate = (index: number) => {
    if (chatMessages.length === 1) {
      return true;
    }
    if (index < 0) {
      return false;
    }

    // first message
    if (index === chatMessages.length - 1) {
      return true;
    }

    try {
      const prevDate = new Date(chatMessages[index + 1].time).getDate();
      const thisDate = new Date(chatMessages[index].time).getDate();

      return prevDate !== thisDate;
    } catch (error) {
      console.log('err getting the date');
      return false;
    }
  };

  const renderItem = ({item, index}: {item: ChatMessage; index: number}) => {
    const componentType = item.to === senderAddress ? 'SENDER' : 'RECEIVER';
    return (
      <MessageComponent
        chatMessage={item}
        componentType={componentType}
        includeDate={includeDate(index)}
      />
    );
  };

  return (
    <LinearGradient colors={['#EEF5FF', '#ECE9FA']} style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={35}
          color={Globals.COLORS.CHAT_LIGHT_DARK}
          onPress={() => navigation.goBack()}
        />

        <View style={styles.info}>
          <View style={styles.user}>
            <Image
              style={styles.image}
              source={
                route.params?.image
                  ? {uri: route.params.image}
                  : require('assets/chat/wallet1.png')
              }
            />

            <TouchableOpacity onPress={handleAddressCopy}>
              <Text style={styles.wallet}>{senderAddressFormatted}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Ionicons
          name="videocam"
          size={35}
          style={styles.videoIcon}
          color={Globals.COLORS.PINK}
          onPress={() => startVideoCall()}
        />
      </View>

      <KeyboardAvoidingView
        behavior="position"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 60}
        enabled={true}
        style={{
          width: '100%',
          height: SectionHeight,
          position: 'relative',
        }}>
        <View
          style={{
            height: windowHeight,
            width: '100%',
            alignItems: 'center',
            position: 'relative',
          }}>
          {isLoading ? (
            <View style={{height: SectionHeight}}>
              <Image
                style={{marginTop: 50, width: 50, height: 50}}
                source={require('assets/chat/loading.gif')}
              />
            </View>
          ) : (
            <View
              style={[
                getSectionStyles(listHeight),
                keyboardStatus && {
                  height: Math.min(listHeight + keyboardHeight, SectionHeight),
                },
              ]}>
              {chatMessages.length > 0 ? (
                <FlashList
                  // @ts-ignore
                  ref={scrollViewRef}
                  data={chatMessages}
                  renderItem={({item, index}) => renderItem({item, index})}
                  keyExtractor={(msg, index) => msg.time.toString() + index}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  overScrollMode={'never'}
                  onScroll={event => {
                    const y = event.nativeEvent.contentOffset.y;
                    if (y > SCORLL_OFF_SET) {
                      setShowScrollDown(true);
                    } else {
                      setShowScrollDown(false);
                    }
                    // setIndicatorPos(y);
                    indicatorPos.setValue(y);
                  }}
                  onScrollToIndexFailed={() => {
                    console.log('err scorlling ');
                  }}
                  onEndReachedThreshold={0.6}
                  onEndReached={async () => {
                    // console.log('loading more data');
                    if (!isLoadingMore) {
                      await loadMoreData();
                    }
                    // }
                  }}
                  inverted={true}
                  extraData={chatMessages}
                  estimatedItemSize={15}
                  onContentSizeChange={(_, h) => {
                    setListHeight(h);
                  }}
                  ListHeaderComponent={
                    <>
                      {isIntentReceivePage ? (
                        <AcceptIntent
                          onAccept={onAccept}
                          onDecline={onDecline}
                          isAccepting={isAccepting}
                        />
                      ) : isSending ? (
                        <MessageComponent
                          chatMessage={tempChatMessage}
                          componentType="SENDER"
                          includeDate={false}
                        />
                      ) : null}
                    </>
                  }
                  ListFooterComponent={
                    <View>
                      <EncryptionInfo
                        addrs={connectedUser.wallets}
                        senderAddrs={senderAddress}
                      />
                      {isLoadingMore && (
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Image
                            style={{marginBottom: 22, width: 40, height: 40}}
                            source={require('assets/chat/loading.gif')}
                          />
                        </View>
                      )}
                    </View>
                  }
                />
              ) : (
                <View style={{marginTop: 10}}>
                  {keyboardStatus && <View style={{height: keyboardHeight}} />}
                  <EncryptionInfo
                    addrs={connectedUser.wallets}
                    senderAddrs={senderAddress}
                  />
                  <Text
                    style={{
                      marginTop: 20,
                      paddingHorizontal: 40,
                      lineHeight: 22,
                      color: '#657795',
                      textAlign: 'center',
                    }}>
                    This is your first conversation with recipient. Start the
                    conversation by sending a message.
                  </Text>
                </View>
              )}

              <CustomScroll
                sectionHeight={SectionHeight}
                indicatorPos={indicatorPos}
                indicatorSize={indicatorSize}
                listHeight={listHeight}
              />
            </View>
          )}

          {/* Donot show keyboard at intent page */}
          {!isLoading && !isIntentReceivePage && (
            <View style={styles.keyboardAvoid}>
              {/* scroll */}
              {showScrollDown && (
                <TouchableOpacity
                  onPress={() => {
                    setShowScrollDown(false);
                    // @ts-ignore
                    scrollViewRef.current.scrollToIndex({
                      index: 0,
                      animated: true,
                    });
                  }}>
                  <View
                    style={{
                      position: 'absolute',
                      width: 30,
                      height: 30,
                      bottom: 80,
                      borderRadius: 20,
                      right: 0,
                      backgroundColor: '#00000033',
                      zIndex: 200,
                    }}
                  />
                </TouchableOpacity>
              )}
              <View style={styles.keyboard}>
                <View style={styles.textInputContainer}>
                  {/* Open gif */}
                  <View style={styles.smileyIcon}>
                    <TouchableOpacity
                      onPress={() => {
                        GiphyDialog.show();
                      }}>
                      <MaterialCommunityIcons
                        name="sticker-emoji"
                        size={28}
                        color="#898686"
                      />
                      {/* <FontAwesome5 name="smile" size={20} color="black" /> */}
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={[
                      styles.input,
                      {
                        height: Math.min(Math.max(5, textInputHeight), 100),
                        minHeight: 40,
                      },
                    ]}
                    onChangeText={setText}
                    value={text}
                    placeholder="Type your message here..."
                    placeholderTextColor="#d2d1d1"
                    multiline={true}
                    onContentSizeChange={event => {
                      setTextInputHeight(
                        Math.max(event.nativeEvent.contentSize.height, 10),
                      );
                    }}
                  />

                  <View style={styles.textButtonContainer}>
                    <View style={styles.sendIcon}>
                      {isSending || !isSendReady ? (
                        <FontAwesome
                          name="spinner"
                          size={24}
                          color={Globals.COLORS.MID_GRAY}
                        />
                      ) : (
                        <FontAwesome
                          name="send"
                          size={24}
                          color={Globals.COLORS.PINK}
                          onPress={handleSend}
                        />
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <Toaster ref={toastRef} />
    </LinearGradient>
  );
};

export default SingleChatScreen;

const getSectionStyles = (listHeight: number) =>
  StyleSheet.create({
    section: {
      width: windowWidth,
      overflow: 'scroll',
      height: Math.min(SectionHeight, listHeight),
      minHeight: 200,
    },
  }).section;

const styles = StyleSheet.create({
  keyboardAvoid: {
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: Platform.OS === 'ios' ? 12 : 18,
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 75 : 135,
    zIndex: 100,
  },
  container: {
    height: windowHeight,
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
          ? StatusBar.currentHeight + 10
          : 30
        : 50,
    paddingHorizontal: 17,
    marginBottom: 0,
    zIndex: 1000,
  },
  info: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    marginLeft: 20,
    justifyContent: 'space-between',
  },

  image: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    borderRadius: 40,
  },
  user: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
  },
  wallet: {
    fontSize: 16,
    marginLeft: 10,
    color: Globals.COLORS.BLACK,
    fontWeight: '500',
  },

  moreIcon: {
    marginTop: -3,
  },
  keyboard: {
    display: 'flex',
    backgroundColor: Globals.COLORS.WHITE,
    borderRadius: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    alignItems: 'center',
    alignSelf: 'center',
  },
  input: {
    // marginVertical: Platform.OS === 'android' ? 6 : 16,
    paddingLeft: 12,
    marginRight: 0,
    color: Globals.COLORS.BLACK,
    fontSize: 16,
    minWidth: '75%',
    maxWidth: '75%',
    alignSelf: 'center',
    paddingTop: 10,
  },
  smileyIcon: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 15,
  },
  textInputContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  textButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    alignSelf: 'center',
  },
  fileIcon: {},
  sendIcon: {
    paddingHorizontal: 8,
  },
  menuItem: {
    display: 'flex',
    flexDirection: 'row',
    padding: 12,
  },
  menuItemText: {
    marginLeft: 10,
    marginTop: 5,
  },
  videoIcon: {
    marginLeft: 'auto',
  },
});
