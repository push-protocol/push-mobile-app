import {FontAwesome5} from '@expo/vector-icons';
import React, {useEffect, useState} from 'react';
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import * as PushNodeClient from 'src/apis';

interface EncryptionInfoProps {
  addrs: string;
  senderAddrs: string;
}

const DOC_URL =
  'https://push.org/docs/chat/concepts/encryption-version-in-push-chat';

const EncryptionInfo = ({addrs, senderAddrs}: EncryptionInfoProps) => {
  const [isAccepted, setIsAccepted] = useState(false);
  const openUrl = async () => {
    await Linking.openURL(DOC_URL);
  };

  useEffect(() => {
    (async () => {
      const _isAccepted = await PushNodeClient.isIntentAccepted(
        addrs,
        senderAddrs,
      );
      setIsAccepted(_isAccepted);
    })();
  }, []);

  return (
    <TouchableOpacity onPress={openUrl}>
      <View style={styles.container}>
        {isAccepted ? (
          <View style={styles.iconText}>
            <View style={styles.icon}>
              <FontAwesome5 name="lock" size={15} color="#657795" />
            </View>
            <Text style={styles.text}>
              Messages are end-to-end encrypted. Only users in this chat can
              view or listen to them. Click to learn more.
            </Text>
          </View>
        ) : (
          <View style={styles.iconText}>
            <View style={styles.iconUnlock}>
              <FontAwesome5 name="unlock" size={15} color="#657795" />
            </View>
            <Text style={styles.text}>
              Messages are not encrypted till the user accepts the chat request.
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: 'white',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
  },
  icon: {
    paddingRight: 4,
  },
  iconUnlock: {
    paddingRight: 2,
  },
  iconText: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    alignItems: 'flex-start',
  },
  text: {
    color: '#657795',
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 14,
  },
});

export {EncryptionInfo};
