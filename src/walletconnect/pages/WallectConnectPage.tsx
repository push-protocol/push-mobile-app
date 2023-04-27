import {useWalletConnect} from '@walletconnect/react-native-dapp';
import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {handleWalletConnectChatLogin} from '../chat/loginUser';

const WallectConnectPage = ({initalizate}: any) => {
  const connector = useWalletConnect();
  const handle = async () => {
    let chatInfoLoaded = false;
    try {
      chatInfoLoaded = await handleWalletConnectChatLogin(connector);
    } catch (error) {
      console.log(error);
    }
    if (chatInfoLoaded) {
      initalizate();
    } else {
      return;
    }
  };
  return (
    <View style={styles.container}>
      <Image source={require('assets/ui/pgp_dapp.png')} style={styles.image} />

      <TouchableOpacity
        style={{width: '100%', alignItems: 'center', overflow: 'hidden'}}
        onPress={handle}>
        <Text style={styles.button}>Continue with Wallet Connect</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: '25%',
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    aspectRatio: 1,
    resizeMode: 'contain',
    paddingVertical: 20,
  },
  button: {
    marginTop: 18,
    backgroundColor: '#CF1C84',
    color: 'white',
    width: '80%',
    borderRadius: 15,
    overflow: 'hidden',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 16,
  },
});

export {WallectConnectPage};
