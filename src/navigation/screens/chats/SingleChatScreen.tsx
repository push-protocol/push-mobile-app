import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import {GiphyDialog, GiphyDialogEvent} from '@giphy/react-native-sdk';
import Clipboard from '@react-native-clipboard/clipboard';
import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {useEffect, useRef, useState} from 'react';
import {
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
  View,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Globals from 'src/Globals';
import {ConnectedUser} from 'src/apis';
import * as PushNodeClient from 'src/apis';
import {Toaster} from 'src/components/indicators/Toaster';
import {ToasterOptions} from 'src/components/indicators/Toaster';
import {walletToCAIP10} from 'src/helpers/CAIPHelper';
import {pgpSign} from 'src/helpers/w2w/pgp';
import {EncryptionInfo} from 'src/navigation/screens/chats/components/EncryptionInfo';

import {AcceptIntent, MessageComponent} from './components';
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
}

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const SectionHeight = (windowHeight * 24) / 31.25;

const SingleChatScreen = ({route}: any) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const toastRef = useRef<any>();
  const {
    cid,
    senderAddress,
    connectedUser,
    isIntentSendPage,
    combinedDID,
  }: ChatScreenParam = route.params;

  const [isIntentReceivePage, setisIntentReceivePage] = useState<boolean>(
    route.params.isIntentReceivePage,
  );

  const navigation = useNavigation();
  const [text, setText] = React.useState('');
  const [textInputHeight, setTextInputHeight] = useState(0);

  const [isLoading, chatMessages, pushChatDataDirect] = useConversationLoader(
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

  // const []
  const handleSend = async () => {
    const _text = text;
    setText('');
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
    // user approves with signature
    const APPROVED_INTENT = 'Approved';
    const signature = await pgpSign(
      APPROVED_INTENT,
      connectedUser.publicKey,
      connectedUser.privateKey,
    );

    // post to the intent
    const updatedIntent: string = await PushNodeClient.approveIntent(
      walletToCAIP10(senderAddress),
      connectedUser.wallets,
      APPROVED_INTENT,
      signature,
      'sigType',
    );

    console.log('approved intent', updatedIntent);
    setisIntentReceivePage(false);
  };

  const onDecline = () => {};
  // const [visible, setVisible] = useState(false);
  // const hideMenu = () => setVisible(false);
  // const showMenu = () => setVisible(true);

  // const MENU_ITEMS = [
  //   {
  //     text: 'Give Nickname',
  //     icon: <AntDesign name="user" size={24} color="black" />,
  //     onPress: hideMenu,
  //   },
  //   {
  //     text: 'Block User',
  //     icon: <Entypo name="block" size={24} color="black" />,
  //     onPress: hideMenu,
  //   },
  // ];

  const handleAddressCopy = () => {
    Clipboard.setString(senderAddress);
    toastRef.current.showToast(
      'Address copied to clipboard',
      '',
      ToasterOptions.TYPE.GRADIENT_PRIMARY,
    );
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

  const includeDate = (index: number) => {
    if (index <= 0) {
      return true;
    }

    try {
      const prevDate = new Date(chatMessages[index - 1].time).getDate();
      const thisDate = new Date(chatMessages[index].time).getDate();

      return prevDate !== thisDate;
    } catch (error) {
      console.log('error', error);
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
              source={require('assets/chat/wallet1.png')}
            />

            <TouchableOpacity onPress={handleAddressCopy}>
              <Text style={styles.wallet}>{senderAddressFormatted}</Text>
            </TouchableOpacity>
          </View>

          {/* <Menu
            visible={visible}
            anchor={
              <Feather
                name="more-vertical"
                onPress={showMenu}
                size={24}
                color="black"
              />
            }
            onRequestClose={hideMenu}>
            {MENU_ITEMS.map((item, index) => (
              <MenuItem onPress={item.onPress} key={index}>
                <View style={styles.menuItem}>
                  {item.icon}
                  <Text style={styles.menuItemText}>{item.text}</Text>
                </View>
              </MenuItem>
            ))}
          </Menu> */}
        </View>
      </View>

      {isLoading ? (
        <View style={{height: SectionHeight}}>
          <Text style={{marginTop: 150}}>Loading coneversation...</Text>
        </View>
      ) : (
        <View style={styles.section}>
          {chatMessages.length > 0 && (
            <FlashList
              // @ts-ignore
              ref={scrollViewRef}
              data={chatMessages}
              // renderItem={renderItem}
              renderItem={({item, index}) => renderItem({item, index})}
              keyExtractor={(msg, index) => msg.time.toString() + index}
              showsHorizontalScrollIndicator={false}
              // initialScrollIndex={
              //   chatMessages.length === 0 ? null : chatMessages.length - 1
              // }
              onContentSizeChange={() => {
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollToEnd({animated: false});
                }
              }}
              onScrollToIndexFailed={() => {
                console.log('err scorlling ');
              }}
              extraData={chatMessages}
              estimatedItemSize={15}
              ListFooterComponent={
                isIntentReceivePage ? (
                  <AcceptIntent onAccept={onAccept} onDecline={onDecline} />
                ) : isSending ? (
                  <MessageComponent
                    chatMessage={tempChatMessage}
                    componentType="SENDER"
                    includeDate={false}
                  />
                ) : null
              }
              ListHeaderComponent={<EncryptionInfo addrs={senderAddress} />}
            />
          )}

          {/* Donot show intent checkbox in chat page */}
          {/* {!isIntentReceivePage && (
            //  />
          )} */}
        </View>
      )}

      {/* Donot show keyboard at intent page */}
      {!isIntentReceivePage && (
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior="position"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : -350}
          enabled={true}>
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
                    height: Math.min(Math.max(10, textInputHeight), 100),
                  },
                ]}
                onChangeText={setText}
                value={text}
                placeholder="Type your message here..."
                placeholderTextColor="#d2d1d1"
                multiline={true}
                onContentSizeChange={event => {
                  setTextInputHeight(event.nativeEvent.contentSize.height);
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
        </KeyboardAvoidingView>
      )}

      <Toaster ref={toastRef} />
    </LinearGradient>
  );
};

export default SingleChatScreen;

const styles = StyleSheet.create({
  keyboardAvoid: {
    justifyContent: 'center',
    paddingHorizontal: Platform.OS === 'ios' ? 12 : 18,
    position: 'absolute',
    bottom: Platform.OS === 'android' ? 20 : 40,
    zIndex: 100,
  },
  container: {
    height: windowHeight,
    flex: 1,
    alignItems: 'center',
    width: windowWidth,
    position: 'relative',
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
  },
  info: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    marginLeft: 20,
    width: '85%',
    justifyContent: 'space-between',
  },

  image: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
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
  section: {
    height: SectionHeight,
    width: windowWidth,
    paddingHorizontal: 20,
    overflow: 'scroll',
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
    // paddingTop: 2,
  },
  input: {
    marginVertical: Platform.OS === 'android' ? 6 : 16,
    paddingLeft: 12,
    marginRight: 0,
    color: Globals.COLORS.BLACK,
    fontSize: 16,
    minWidth: '75%',
    maxWidth: '75%',
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
});
