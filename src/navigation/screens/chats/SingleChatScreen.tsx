import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import {GiphyDialog, GiphyDialogEvent} from '@giphy/react-native-sdk';
import {IFeeds, IMessageIPFS, VideoCallStatus} from '@pushprotocol/restapi';
import {walletToPCAIP10} from '@pushprotocol/restapi/src/lib/helpers';
import Clipboard from '@react-native-clipboard/clipboard';
import {useNavigation} from '@react-navigation/native';
import {produce} from 'immer';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
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
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch} from 'react-redux';
import Globals from 'src/Globals';
import {ConnectedUser} from 'src/apis';
import {Toaster} from 'src/components/indicators/Toaster';
import {ToasterOptions} from 'src/components/indicators/Toaster';
import {usePushApi} from 'src/contexts/PushApiContext';
import {VideoCallContext} from 'src/contexts/VideoContext';
import envConfig from 'src/env.config';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import {EncryptionInfo} from 'src/navigation/screens/chats/components/EncryptionInfo';
import {setOtherUserProfilePicture} from 'src/redux/videoSlice';
import MetaStorage from 'src/singletons/MetaStorage';

import {AcceptIntent, MessageComponent, ReplyMessageBubble} from './components';
import {CustomScroll} from './components/CustomScroll';
import './giphy/giphy.setup';
import {getFormattedAddress} from './helpers/chatAddressFormatter';
import {useConversationLoader} from './helpers/useConverstaionLoader';
import {useSendMessage} from './helpers/useSendMessage';

interface ChatScreenParam {
  cid: string;
  senderAddress: string;
  connectedUser: ConnectedUser;
  combinedDID: string;
  isIntentSendPage: boolean;
  isIntentReceivePage: boolean;
  chatId: string;
  feed?: IFeeds;
  title?: string;
}

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const SectionHeight =
  Platform.OS === 'android' ? windowHeight - 126 : windowHeight - 195;

const SingleChatScreen = ({route}: any) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const toastRef = useRef<any>();
  const textInputRef = useRef<TextInput>(null);
  const {
    cid,
    senderAddress,
    connectedUser,
    isIntentSendPage,
    combinedDID,
    chatId,
    feed,
    title,
  }: ChatScreenParam = route.params;

  const [isIntentReceivePage, setisIntentReceivePage] = useState<boolean>(
    route.params.isIntentReceivePage,
  );

  const navigation = useNavigation();
  const [text, setText] = React.useState('');
  const [textInputHeight, setTextInputHeight] = useState(10);
  const [replyPadding, setReplyPadding] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [listHeight, setListHeight] = useState(0);
  const [indicatorPos] = useState(() => new Animated.Value(0));
  const [indicatorSize, setIndicatorSize] = useState(0);
  const [replyPayload, setReplyPayload] = useState<IMessageIPFS | null>(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState(null);
  const SCORLL_OFF_SET = 250;

  const [
    isLoading,
    chatMessages,
    pushChatDataDirect,
    loadMoreData,
    isLoadingMore,
    reactionMessages,
  ] = useConversationLoader(
    cid,
    connectedUser.privateKey,
    connectedUser.wallets,
    senderAddress,
    combinedDID,
    chatId,
  );

  const [isSending, sendMessage, isSendReady, tempChatMessage] = useSendMessage(
    connectedUser,
    senderAddress || chatId,
    isIntentSendPage,
    toastRef.current ? toastRef.current.showToast : null,
  );

  const dispatch = useDispatch();

  const senderAddressFormatted = senderAddress
    ? getFormattedAddress(senderAddress)
    : null;
  const {userPushSDKInstance} = usePushApi();

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
      replyRef: replyPayload?.cid || undefined,
    });
    if (replyPayload) {
      setReplyPayload(null);
      setReplyPadding(0);
    }
    if (!res) {
      return;
    }

    const [_cid, msg] = res;
    if (_cid && msg) {
      // console.log('_after sending got', _cid);
      pushChatDataDirect(_cid, msg);
    }
  };

  const onAccept = async () => {
    try {
      setIsAccepting(true);
      await userPushSDKInstance?.chat.accept(
        senderAddress ? walletToPCAIP10(senderAddress) : chatId,
      );
      setisIntentReceivePage(false);
    } catch (error) {
      console.log('error accepting req ', error);
    } finally {
      setIsAccepting(false);
    }
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
    dispatch(setOtherUserProfilePicture(route.params.image));
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
          messageType: 'MediaEmbed',
          message: gifUrl,
          replyRef: replyPayload?.cid || undefined,
        })
          .then(_res => {
            if (_res) {
              const [_cid, msg] = _res;
              if (_cid && msg) {
                pushChatDataDirect(_cid, msg);
              }
            }
          })
          .finally(() => {
            if (replyPayload) {
              setReplyPayload(null);
              setReplyPadding(0);
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
  }, [replyPayload]);

  // scroll bar indicator
  useEffect(() => {
    const visibleHeight = Math.min(SectionHeight, listHeight);

    const _indicatorSize =
      listHeight > visibleHeight
        ? (visibleHeight * visibleHeight) / listHeight
        : visibleHeight;

    setIndicatorSize(_indicatorSize);
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
      const prevDate = new Date(
        chatMessages[index + 1].timestamp || 0,
      ).getDate();
      const thisDate = new Date(chatMessages[index].timestamp || 0).getDate();

      return prevDate !== thisDate;
    } catch (error) {
      console.log('err getting the date');
      return false;
    }
  };

  const handleSetReplyPayload = (payload: IMessageIPFS) => {
    // @ts-ignore
    scrollViewRef.current.scrollToIndex({
      index: 0,
      animated: true,
    });
    textInputRef.current?.focus();
    setReplyPayload(payload);
  };

  const handleMessageLongPress = (messageId: any) => {
    setActiveReactionMessageId(prev => (prev === messageId ? null : messageId));
  };

  const handleTapOutside = () => {
    setActiveReactionMessageId(null);
  };

  const handleSendReaction = async (payload: any) => {
    setActiveReactionMessageId(null);
    const res = await sendMessage(payload);
    if (!res) {
      return;
    }

    const [_cid, msg] = res;
    if (_cid && msg) {
      // console.log('_after sending got', _cid);
      pushChatDataDirect(_cid, msg);
    }
  };

  const renderItem = ({item, index}: {item: IMessageIPFS; index: number}) => {
    const componentType = item.fromCAIP10.includes(
      caip10ToWallet(connectedUser.wallets),
    )
      ? 'SENDER'
      : 'RECEIVER';
    if (item?.messageType === 'Reaction' || !item?.messageType) return null;
    return (
      <MessageComponent
        chatMessage={item}
        isGroupMessage={!!feed?.groupInformation}
        componentType={componentType}
        includeDate={includeDate(index)}
        setReplyPayload={handleSetReplyPayload}
        chatId={chatId}
        handleMessageLongPress={message => handleMessageLongPress(message?.cid)}
        reactionPickerId={activeReactionMessageId}
        handleTapOutside={() => handleTapOutside()}
        sendReaction={handleSendReaction}
        chatReactions={reactionMessages?.[(item as IMessageIPFS)?.cid] || []}
      />
    );
  };

  const navigateToGroupInfo = () => {
    // @ts-ignore
    navigation.navigate(Globals.SCREENS.GROUP_INFO, {
      groupInformation: feed?.groupInformation!,
    });
  };

  const handleOnScroll = event => {
    const y = event.nativeEvent.contentOffset.y;
    if (y > SCORLL_OFF_SET) {
      setShowScrollDown(true);
    } else {
      setShowScrollDown(false);
    }
    indicatorPos.setValue(y);
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
              <Text style={styles.wallet}>
                {senderAddress ? senderAddressFormatted : title}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/********************************************/
        /**     Uncomment this conditional code     **/
        /**     if video call feature is enabled    **/
        /**    Note: enable for single user chat    **/
        /********************************************/}
        {/* {!(isIntentSendPage || isIntentReceivePage) && (
              <TouchableOpacity
                onPress={startVideoCall}
                style={styles.rightAligned}>
                <Ionicons
                  name="videocam"
                  size={35}
                  color={Globals.COLORS.PINK}
                />
              </TouchableOpacity>
            )} */}

        {feed && feed.groupInformation && (
          <TouchableOpacity
            style={styles.rightAligned}
            onPress={navigateToGroupInfo}>
            <Feather name="info" size={20} color={Globals.COLORS.BLACK} />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        behavior="position"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 60}
        enabled={true}
        style={styles.keyboardAvoidingViewStyles}>
        <View style={styles.chatListAndInputContainer}>
          <TouchableWithoutFeedback
            style={styles.touchableWithoutFeedbackStyle}
            onPress={() => handleTapOutside()}
            onLongPress={() => null}>
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
                    height: Math.min(
                      listHeight + keyboardHeight,
                      SectionHeight,
                    ),
                  },
                ]}>
                {chatMessages.length > 0 ? (
                  <FlatList
                    // @ts-ignore
                    ref={scrollViewRef}
                    contentContainerStyle={[
                      styles.contentContainerStyle,
                      {paddingTop: replyPadding},
                    ]}
                    data={chatMessages}
                    renderItem={({item, index}) => renderItem({item, index})}
                    keyExtractor={(msg: any) => `chat-message-${msg.cid}`}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    overScrollMode={'never'}
                    onScroll={handleOnScroll}
                    onScrollToIndexFailed={() => {
                      console.log('err scorlling ');
                    }}
                    onEndReachedThreshold={0.6}
                    onEndReached={async () => {
                      if (!isLoadingMore) {
                        await loadMoreData();
                      }
                    }}
                    inverted={true}
                    extraData={[
                      chatMessages,
                      activeReactionMessageId,
                      reactionMessages,
                    ]}
                    estimatedItemSize={100000}
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
                          <View style={styles.viewCenterAlignStyles}>
                            <Image
                              style={styles.loadingImage}
                              source={require('assets/chat/loading.gif')}
                            />
                          </View>
                        )}
                      </View>
                    }
                  />
                ) : (
                  <View style={{marginTop: 10}}>
                    {keyboardStatus && (
                      <View style={{height: keyboardHeight}} />
                    )}
                    <EncryptionInfo
                      addrs={connectedUser.wallets}
                      senderAddrs={senderAddress}
                    />
                    <Text style={styles.firstConversationGuideText}>
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
          </TouchableWithoutFeedback>
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
                  <View style={styles.scrollToBottomWrapper}>
                    <Image
                      style={styles.caretIcon}
                      source={require('assets/ui/icCaretDown.png')}
                    />
                  </View>
                </TouchableOpacity>
              )}

              <View style={styles.keyboard}>
                {/* Render reply message bubble */}
                {replyPayload && !isSending && (
                  <ReplyMessageBubble
                    chatMessage={replyPayload}
                    componentType="replying"
                    onCancelReply={() => {
                      setReplyPayload(null);
                      setReplyPadding(0);
                    }}
                    onLayoutChange={({nativeEvent}) =>
                      setReplyPadding(
                        nativeEvent?.layout?.height
                          ? nativeEvent?.layout?.height + 20
                          : 0,
                      )
                    }
                  />
                )}
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
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    ref={textInputRef}
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
  keyboardAvoidingViewStyles: {
    width: '100%',
    height: SectionHeight,
    position: 'relative',
  },
  chatListAndInputContainer: {
    height: windowHeight,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  touchableWithoutFeedbackStyle: {
    position: 'relative',
  },
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
  contentContainerStyle: {
    zIndex: 2,
  },
  moreIcon: {
    marginTop: -3,
  },
  keyboard: {
    display: 'flex',
    backgroundColor: Globals.COLORS.WHITE,
    borderRadius: 16,
    width: '100%',
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    alignItems: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  input: {
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
  rightAligned: {
    marginLeft: 'auto',
  },
  scrollToBottomWrapper: {
    position: 'absolute',
    width: 30,
    height: 30,
    bottom: 80,
    borderRadius: 15,
    right: 0,
    backgroundColor: '#00000033',
    zIndex: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caretIcon: {
    tintColor: Globals.COLORS.WHITE,
  },
  firstConversationGuideText: {
    marginTop: 20,
    paddingHorizontal: 40,
    lineHeight: 22,
    color: '#657795',
    textAlign: 'center',
  },
  viewCenterAlignStyles: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingImage: {
    marginBottom: 22,
    width: 40,
    height: 40,
  },
});
