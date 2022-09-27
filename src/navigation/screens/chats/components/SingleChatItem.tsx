import React, {useContext, useEffect} from 'react';
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
  console.log('pkey\n', pgpPrivateKey);
  console.log('sec\n', pgpSecret);

  const AES_KEY = await pgpDecrypt(pgpSecret, pgpPrivateKey);
  console.log('got aes key', AES_KEY);
  console.log('ended decryption');

  return AES_KEY;
};

const ChatItem = (props: SingleChatItemProps) => {
  const appContext = useContext(Context);

  if (!appContext) {
    throw new Error('Invalid context');
  }

  const cid = props.text;
  useEffect(() => {
    (async () => {
      console.log('calling...', cid);
      const res = await PushNodeClient.getFromIPFS(cid);
      // const encryptedSec = res.encryptedSecret;
      console.log('cid res', Object.keys(res));
      console.log(res);

      console.log('\n\n\n****all good***\n\n\n');
      const AES_KEY = await getAES(
        res.encryptedSecret,
        appContext.connectedUser.privateKey,
      );

      const messageToDecrypt = res.messageContent;
      console.log('now break this', messageToDecrypt);
      console.log('\n\n\n****all good***\n\n\n');

      const final = CryptoHelper.decryptWithAES(messageToDecrypt, AES_KEY);
      console.log('res', final);

      // console.log('content', res.messageContent);
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
              {props.text}
            </Text>
          </View>

          <View>
            <Text style={props.count ? styles.activeTime : styles.time}>
              {props.time}
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
