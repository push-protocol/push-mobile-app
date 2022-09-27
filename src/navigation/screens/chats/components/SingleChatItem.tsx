import React, {useContext, useEffect, useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Globals from 'src/Globals';
import * as PushNodeClient from 'src/apis';
import CryptoHelper from 'src/helpers/CryptoHelper';
import {pgpDecrypt} from 'src/helpers/w2w/pgp';
import {Context} from 'src/navigation/screens/chats/ChatScreen';

import {SingleChatItemProps} from '../types';

const MAX_ADDRESS_LEN = 21;
const getFormattedAddress = (originalAddress: string) => {
  const addrsLen = originalAddress.length;
  if (addrsLen >= MAX_ADDRESS_LEN) {
    return `${originalAddress.substring(0, 8)}...${originalAddress.substring(
      addrsLen - 7,
    )}`;
  }
  return originalAddress;
};

const getAES = async (pgpSecret: string, pgpPrivateKey: string) => {
  const AES_KEY = await pgpDecrypt(pgpSecret, pgpPrivateKey);
  return AES_KEY;
};

const resolveCID = async (cid: string, pgpPrivateKey: string) => {
  const res = await PushNodeClient.getFromIPFS(cid);

  const timeStamp = res.timestamp ? res.timestamp : 0;
  const formatedTime = parseTimeStamp(timeStamp);

  const AES_KEY = await getAES(res.encryptedSecret, pgpPrivateKey);
  const messageToDecrypt = res.messageContent;
  const encryptedMessage = CryptoHelper.decryptWithAES(
    messageToDecrypt,
    AES_KEY,
  );

  const nextMessage = res.link;

  return [formatedTime, encryptedMessage, nextMessage];
};

const parseTimeStamp = (timestamp: number) => {
  const time = new Date(timestamp);
  const date =
    time.toLocaleTimeString('en-US').slice(0, -6) +
    ':' +
    time.toLocaleTimeString('en-US').slice(-2);

  return date;
};

const ChatItem = (props: SingleChatItemProps) => {
  const appContext = useContext(Context);
  const cid = props.text;
  if (!appContext) {
    throw new Error('Invalid context');
  }

  const [lastMessage, setLastMessage] = useState('decrypting....');
  const [timeStamp, setTimeStamp] = useState('...');

  useEffect(() => {
    (async () => {
      const [_timestamp, encryptedMessage] = await resolveCID(
        cid,
        appContext.connectedUser.privateKey,
      );

      setLastMessage(encryptedMessage);
      setTimeStamp(_timestamp);
    })();
  });

  return (
    <TouchableWithoutFeedback onPress={props.onPress}>
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
