import {useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Globals from 'src/Globals';
import {formatAMPM} from 'src/helpers/DateTimeHelper';
import {Context} from 'src/navigation/screens/chats/ChatScreen';

import {getFormattedAddress} from '../helpers/chatAddressFormatter';
import {resolveCID} from '../helpers/chatResolver';
import {SingleChatItemProps} from '../types';

const formatTextData = (rawText: string) => {
  rawText = rawText.split('\n')[0];

  const MAX_TEXT_LEN = 25;
  if (rawText.length < MAX_TEXT_LEN) {
    return rawText;
  }
  return rawText.slice(0, MAX_TEXT_LEN).trim() + ' ...';
};

const ChatItem = (props: SingleChatItemProps) => {
  const navigation = useNavigation();
  const appContext = useContext(Context);
  const cid = props.text;
  if (!appContext) {
    throw new Error('Invalid context');
  }

  if (!appContext.connectedUser) {
    console.log('had to do this');
    return (
      <View>
        <Text>Err!! couldnot find user info</Text>
      </View>
    );
  }

  const [lastMessage, setLastMessage] = useState('decrypting....');
  const [messageType, setMessageType] = useState('Text');
  const [timeStamp, setTimeStamp] = useState('...');
  const [isLoading, setLoading] = useState(true);

  const handleChatDetail = async () => {
    if (isLoading) {
      return;
    }

    let isIntentSendPage = props.isIntentSendPage;
    let isIntenReceivePage = props.isIntentReceivePage;

    props.clearSearch();

    // @ts-ignore
    navigation.navigate(Globals.SCREENS.SINGLE_CHAT, {
      cid: cid,
      senderAddress: props.wallet,
      connectedUser: appContext.connectedUser,
      combinedDID: props.combinedDID,
      isIntentReceivePage: isIntenReceivePage,
      isIntentSendPage: isIntentSendPage,
      image: props.image,
    });
  };

  useEffect(() => {
    (async () => {
      if (!cid) {
        setLastMessage('Start new conversation');
        setLoading(false);
        return;
      }
      const [chatMessage] = await resolveCID(
        cid,
        appContext.connectedUser.privateKey,
      );

      setLastMessage(chatMessage.message);
      setTimeStamp(formatAMPM(chatMessage.time));
      setMessageType(chatMessage.messageType);
      setLoading(false);
    })();
  });

  return (
    <TouchableOpacity onPress={handleChatDetail}>
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
              {messageType === 'Text' && formatTextData(lastMessage)}
              {messageType === 'GIF' && 'GIF'}
              {messageType === 'File' && 'FILE'}
              {messageType === 'Image' && 'Image'}
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
    </TouchableOpacity>
  );
};

export default ChatItem;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 28,
    paddingVertical: 4,
    // backgroundColor: 'red',
  },

  chatContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
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
