
import SpamFeed from "../components/ui/SpamFeed";

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Button,
  TouchableOpacity
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useWalletConnect,
  withWalletConnect,
  RenderQrcodeModalProps,
  WalletService,
} from '@walletconnect/react-native-dapp';
import { ethers } from 'ethers';

import GLOBALS from 'src/Globals';

const SpamBox = ({ style }) => {
  const initiateWalletConnect = async () => {
    const connector = useWalletConnect();
    connector.connect()
  }

  const signMessage = async (connector) => {
    // connector
    //   .signPersonalMessage(["Hello", connector.accounts[0]])
    //   .then(async data => {
    //     console.log('Success ---', data);
    //   })
    //   .catch(err => {
    //     console.log('Error ---', err);
    //   });

    const rawMessage = "Hello"
    connector
      .signPersonalMessage([ethers.utils.hexlify(ethers.utils.toUtf8Bytes(rawMessage)), connector.accounts[0]])
      .then(async data => {
        console.log('Success ---', data);
      })
      .catch(err => {
        console.log('Error ---', err);
      });
  }

  const {
    createSession,
    killSession,
    session,
    signTransaction,
  } = useWalletConnect();
  const hasWallet = !!session.length;
  const connector = useWalletConnect();

  return (<SafeAreaView style={[ styles.container, style ]}>
    <Text style={styles.textStyle}>Greetings! Started with ReactNative</Text>
    <Text style={styles.subHeaderStyle}>My name is {name}</Text>
      <TouchableOpacity
        style={styles.button1}
        onPress={() => {initiateWalletConnect()}}
      >
        <Text style={styles.textStyle}>
          Sign In with Wallet Connect.{"  "}
        </Text>
      </TouchableOpacity>
      {!connector.connected &&
        <Button title="Connect" onPress={() => connector.connect()} />
      }

      {connector.connected &&
        <>
          <Button title="Sign Message" onPress={() => signMessage(connector)} />
          <Button title="Kill Session" onPress={() => connector.killSession()} />
        </>
      }

  </SafeAreaView>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  textStyle: {
    fontSize: 45
  },
  subHeaderStyle: {
    fontSize: 20
  }
});

export default SpamBox;
