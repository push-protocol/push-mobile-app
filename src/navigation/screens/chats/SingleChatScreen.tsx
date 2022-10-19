import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome,
  FontAwesome5,
  Ionicons,
} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Menu, MenuItem} from 'react-native-material-menu';
import Globals from 'src/Globals';
import {ConnectedUser} from 'src/apis';
import * as PushNodeClient from 'src/apis';
import {walletToCAIP10} from 'src/helpers/CAIPHelper';
import {pgpSign} from 'src/helpers/w2w/pgp';

import {AcceptIntent, Recipient, Sender, Time} from './components';
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
}

const SingleChatScreen = ({route}: any) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    cid,
    senderAddress,
    connectedUser,
    combinedDID,
    isIntentSendPage,
  }: ChatScreenParam = route.params;

  const [isIntentReceivePage, setisIntentReceivePage] = useState<boolean>(
    route.params.isIntentReceivePage,
  );

  const navigation = useNavigation();
  const [text, setText] = React.useState('');
  const [isLoading, chatMessages] = useConversationLoader(
    cid,
    connectedUser.privateKey,
    combinedDID,
  );

  const [isSending, sendMessage, isSendReady] = useSendMessage(
    connectedUser,
    senderAddress,
    isIntentSendPage,
  );

  const senderAddressFormatted = getFormattedAddress(senderAddress);

  const handleSend = async () => {
    const _text = text;
    setText('');
    Keyboard.dismiss();
    if (_text.trim() === '') {
      return;
    }
    await sendMessage(_text);
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
        <Text style={{marginTop: 150}}>Loading conversation...</Text>
      ) : (
        <ScrollView
          style={styles.section}
          showsHorizontalScrollIndicator={false}
          ref={scrollViewRef}
          onContentSizeChange={() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollToEnd({animated: true});
            }
          }}>
          <Time
            text={chatMessages.length > 0 ? chatMessages[0].time : 'No date'}
          />

          {chatMessages.map((msg, index) =>
            msg.to === senderAddress ? (
              <Sender {...msg} key={index} />
            ) : (
              <Recipient {...msg} key={index} />
            ),
          )}

          {/* Donot show intent checkbox in chat page */}
          {isIntentReceivePage && (
            <AcceptIntent onAccept={onAccept} onDecline={onDecline} />
          )}
        </ScrollView>
      )}

      {/* Donot show keyboard at intent page */}
      {!isIntentReceivePage && (
        <View style={styles.keyboard}>
          <View style={styles.textInputContainer}>
            <View style={styles.smileyIcon}>
              <FontAwesome5 name="smile" size={20} color="black" />
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
    maxHeight: (windowHeight * 3) / 5,
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
    bottom: 10,
    backgroundColor: Globals.COLORS.WHITE,
    borderRadius: 16,
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    height: 35,
    margin: 12,
    padding: 10,
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
