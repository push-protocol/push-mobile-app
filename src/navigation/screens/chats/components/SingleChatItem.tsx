import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Globals from 'src/Globals';
import {Context} from 'src/navigation/screens/chats/ChatScreen';

import {getFormattedAddress} from '../helpers/chatAddressFormatter';
import {resolveCID} from '../helpers/chatResolver';
import {SingleChatItemProps} from '../types';

const ChatItem = (props: SingleChatItemProps) => {
  const navigation = useNavigation();
  const appContext = useContext(Context);
  const cid = props.text;
  if (!appContext) {
    throw new Error('Invalid context');
  }

  const [lastMessage, setLastMessage] = useState('decrypting....');
  const [timeStamp, setTimeStamp] = useState('...');
  const [isLoading, setLoading] = useState(true);

  const handleChatDetail = async () => {
    if (isLoading) {
      console.log('thread info loading');
      return;
    }

    // @ts-ignore
    navigation.navigate(Globals.SCREENS.SINGLE_CHAT, {
      cid: cid,
      senderAddress: props.wallet,
      connectedUser: appContext.connectedUser,
      combinedDID: props.combinedDID,
      isIntentPage: props.isIntentPage,
    });
  };

  useEffect(() => {
    (async () => {
      const [chatMessage] = await resolveCID(
        cid,
        appContext.connectedUser.privateKey,
      );

      setLastMessage(chatMessage.message);
      setTimeStamp(chatMessage.time);
      setLoading(false);
    })();
  });

  return (
    <TouchableWithoutFeedback onPress={handleChatDetail}>
      <View style={styles.container}>
        <Image
          source={{uri: props.image}}
          style={styles.image}
          resizeMode={'cover'}
        />

        <View style={styles.chatContainer}>
          <View style={styles.chatDetails}>
            <Text style={styles.wallet}>
              {getFormattedAddress(props.wallet)}
            </Text>
            <Text style={props.count ? styles.activeText : styles.text}>
              {lastMessage}
            </Text>
          </View>

          <View>
            <Text style={props.count ? styles.activeTime : styles.time}>
              {timeStamp}
            </Text>
            {props.count && (
              <View style={styles.count}>
                <Text style={styles.countText}>{props.count}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ChatItem;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingLeft: 30,
    paddingRight: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },

  chatContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    marginLeft: 10,
  },
  chatDetails: {
    marginLeft: 10,
  },
  time: {
    fontSize: 12,
    color: Globals.COLORS.CHAT_LIGHT_DARK,
    marginBottom: 5,
  },
  activeTime: {
    fontSize: 12,
    color: Globals.COLORS.PINK,
    marginBottom: 5,
  },
  wallet: {
    color: Globals.COLORS.CHAT_BLACK,
    marginBottom: 5,
    fontSize: 16,
  },
  text: {
    color: Globals.COLORS.CHAT_LIGHT_DARK,
    marginBottom: 5,
    fontSize: 14,
  },
  activeText: {
    color: Globals.COLORS.PINK,
    marginBottom: 5,
    fontSize: 14,
  },

  image: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    borderRadius: 50 / 2,
    overflow: 'hidden',
  },
  count: {
    backgroundColor: Globals.COLORS.PINK,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: 'white',
  },
});
