import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
} from '@expo/vector-icons';
import {GiphyDialog, GiphyDialogEvent} from '@giphy/react-native-sdk';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import {Menu, MenuItem} from 'react-native-material-menu';
import Globals from 'src/Globals';
import {ConnectedUser} from 'src/apis';
import * as PushNodeClient from 'src/apis';
import {Toaster} from 'src/components/indicators/Toaster';
import {walletToCAIP10} from 'src/helpers/CAIPHelper';
import {pgpSign} from 'src/helpers/w2w/pgp';

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
    });

    if (!res) {
      return;
    }

    //add messages to current state
    const [_cid, msg] = res;
    pushChatDataDirect(_cid, msg);
  };

  const onAccept = async () => {
    // user approves with signature
    const APPROVED_INTENT = 'Approved';
    const signature = await pgpSign(
      APPROVED_INTENT,
      connectedUser.publicKey,
      connectedUser.privateKey,
    );

    // post to the
    const updatedIntent: string = await PushNodeClient.approveIntent(
      walletToCAIP10(senderAddress),
      connectedUser.wallets,
      APPROVED_INTENT,
      signature,
      'sigType',
    );

    console.log('approved intent', updatedIntent);

    // update state to load chats
    setisIntentReceivePage(false);
  };

  const onDecline = () => {};
  const [visible, setVisible] = useState(false);
  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  const MENU_ITEMS = [
    {
      text: 'Give Nickname',
      icon: <AntDesign name="user" size={24} color="black" />,
      onPress: hideMenu,
    },
    {
      text: 'Block User',
      icon: <Entypo name="block" size={24} color="black" />,
      onPress: hideMenu,
    },
  ];

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
        const res = sendMessage({messageType: 'GIF', message: gifUrl}).then(
          _res => {
            if (_res) {
              const [_cid, msg] = _res;
              pushChatDataDirect(_cid, msg);
            }
          },
        );
        if (!res) {
          return;
        }
      },
    );
    return () => {
      listener.remove();
    };
  }, []);

  const renderItem = ({item}: {item: ChatMessage}) => {
    if (item.to === senderAddress) {
      return <MessageComponent chatMessage={item} componentType="SENDER" />;
    } else {
      return <MessageComponent chatMessage={item} componentType="RECEIVER" />;
    }
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

            <Text style={styles.wallet}>{senderAddressFormatted}</Text>
          </View>

          <Menu
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
          </Menu>
        </View>
      </View>

      {isLoading ? (
        <Text style={{marginTop: 150}}>Loading coneversation...</Text>
      ) : (
        <View style={styles.section}>
          <FlatList
            // @ts-ignore
            ref={scrollViewRef}
            data={chatMessages}
            renderItem={renderItem}
            keyExtractor={(_, index) => 'key' + index}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={chatMessages.length - 1}
            onContentSizeChange={() => {
              if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({animated: true});
              }
            }}
          />

          {isSending && (
            <MessageComponent
              chatMessage={tempChatMessage}
              componentType="SENDER"
            />
          )}

          {/* Donot show intent checkbox in chat page */}
          {isIntentReceivePage && (
            <AcceptIntent onAccept={onAccept} onDecline={onDecline} />
          )}
        </View>
      )}

      {/* Donot show keyboard at intent page */}
      {!isIntentReceivePage && (
        <View style={styles.keyboard}>
          <View style={styles.textInputContainer}>
            {/* Open gif */}
            <View style={styles.smileyIcon}>
              <TouchableOpacity
                onPress={() => {
                  GiphyDialog.show();
                }}>
                <FontAwesome5 name="smile" size={20} color="black" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              onChangeText={setText}
              value={text}
              placeholder="Type your message here..."
              placeholderTextColor="#494D5F"
            />
          </View>

          <View style={styles.textButtonContainer}>
            <View>
              <Feather name="paperclip" size={20} color="black" />
            </View>

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
      )}

      <Toaster ref={toastRef} />
    </LinearGradient>
  );
};

export default SingleChatScreen;

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
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
    padding: 15,
  },
  info: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    marginLeft: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    height: 50,
    padding: 15,
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
    maxHeight: (windowHeight * 24) / 35,
    width: windowWidth,
    paddingVertical: 10,
    paddingHorizontal: 20,
    overflow: 'scroll',
  },
  moreIcon: {
    marginTop: -3,
  },
  keyboard: {
    display: 'flex',
    position: 'absolute',
    bottom: 20,
    backgroundColor: Globals.COLORS.WHITE,
    borderRadius: 16,
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  input: {
    height: 35,
    margin: 15,
    paddingHorizontal: 10,
    paddingTop: 6,
    color: Globals.COLORS.BLACK,
    fontSize: 16,
  },
  smileyIcon: {
    marginTop: 20,
    marginLeft: 20,
  },
  textInputContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  textButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 20,
    marginRight: 20,
  },
  fileIcon: {},
  sendIcon: {
    marginLeft: 10,
  },
  menuItem: {
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
  },
  menuItemText: {
    marginLeft: 10,
    marginTop: 5,
  },
});
