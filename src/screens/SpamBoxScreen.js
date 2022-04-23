import SpamFeed from '../components/ui/SpamFeed'

import React from 'react'
import {
  StatusBar,
  View,
  Text,
  Image,
  StyleSheet,
  Button,
  TouchableOpacity,
} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'

import {
  useWalletConnect,
  withWalletConnect,
  RenderQrcodeModalProps,
  WalletService,
} from '@walletconnect/react-native-dapp'
import { ethers } from 'ethers'

import 'src/components/ui/SpamFeed'

import GLOBALS from 'src/Globals'

const SpamBoxScreen = ({ style, route }) => {
  const {
    createSession,
    killSession,
    session,
    signTransaction,
    signMessage,
    signTypedData,
  } = useWalletConnect()
  const hasWallet = !!session.length
  const connector = useWalletConnect()

  const signMessageFunc = async () => {
    const message = {
      channel: '0x2aecb6dee3652da1dd6b54d5fd4f7d8f43daeb78',
      subscriber: connector.accounts[0],
      action: 'Subscribe',
    }

    // const typedData = {
    //   types: {
    //     EIP712Domain: [
    //       { name: "name", type: "string" },
    //       { name: "version", type: "string" },
    //       { name: "chainId", type: "uint256" },
    //       { name: "verifyingContract", type: "address" },
    //     ],
    //     Subscribe: [
    //       { name: "channel", type: "address" },
    //       { name: "subscriber", type: "address" },
    //       { name: "action", type: "string" },
    //     ]
    //   },
    //   domain: {
    //     name: "EPNS COMM V1",
    //     chainId: 42,
    //     verifyingContract: '0x87da9Af1899ad477C67FeA31ce89c1d2435c77DC',
    //     version: "1",
    //   },
    //   message: message,
    // };

    const EPNS_DOMAIN = {
      name: 'EPNS',
      version: '1.0.0',
      chainId: '42',
      verifyingContract: '0x628E3191dE173d40b9fcDc171557958267c475a6',
    }
    const subType = {
      Subscribe: [
        { name: 'channel', type: 'address' },
        { name: 'subscriber', type: 'address' },
        { name: 'action', type: 'string' },
      ],
    }
    const unsubType = {
      Unsubscribe: [
        { name: 'channel', type: 'address' },
        { name: 'unsubscriber', type: 'address' },
        { name: 'action', type: 'string' },
      ],
    }

    const subMessage = {
      channel: '0x2aecb6dee3652da1dd6b54d5fd4f7d8f43daeb78',
      subscriber: connector.accounts[0],
      action: 'Subscribe',
    }
    const unsubMessage = {
      channel: '0x2aecb6dee3652da1dd6b54d5fd4f7d8f43daeb78',
      unsubscriber: connector.accounts[0],
      action: 'Unsubscribe',
    }

    const typedData = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Subscribe: [
          { name: 'channel', type: 'address' },
          { name: 'subscriber', type: 'address' },
          { name: 'action', type: 'string' },
        ],
      },
      primaryType: 'Subscribe',
      domain: {
        name: 'EPNS',
        version: '1.0.0',
        chainId: '42',
        verifyingContract: '0x5b995e9831be34aea8ee38e0389245b6a35493fd',
      },
      message: {
        channel: '0x2aecb6dee3652da1dd6b54d5fd4f7d8f43daeb78',
        subscriber: connector.accounts[0],
        action: 'Subscribe',
      },
    }

    const msgParams = [
      connector.accounts[0], // Required
      typedData, // Required
    ]

    connector
      .signTypedData(msgParams)
      .then((signature) => {
        // Returns signature.
        console.log('Signed EIP712')
        console.log(signature)

        // send it to server
        console.log('Sending to server')
        // https://backend-kovan.epns.io/apis/channels/unsubscribe_offchain

        const apiURL =
          'https://backend-kovan.epns.io/apis/channels/subscribe_offchain'

        fetch(
          'https://backend-kovan.epns.io/apis/channels/subscribe_offchain',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              signature: signature,
              message: subMessage,
              contractAddress: '0x5b995e9831be34aea8ee38e0389245b6a35493fd',
              chainId: 42,
              op: 'write',
            }),
          },
        )
          .then((response) => response.json())
          .then((resJson) => {
            console.log(resJson)
          })
          .catch((error) => {
            console.warn(error)
          })
      })
      .catch((error) => {
        // Error returned when rejected
        console.error(error)
      })

    const rawMessage = 'Hello'
    // connector
    //   .signPersonalMessage([ethers.utils.hexlify(ethers.utils.toUtf8Bytes(rawMessage)), connector.accounts[0]])
    //   .then(async data => {
    //     console.log('Success ---', data);
    //   })
    //   .catch(err => {
    //     console.log('Error ---', err);
    //   });
  }

  return (
    <SafeAreaView style={[styles.container, style]}>
      <StatusBar
        barStyle={'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <SpamFeed wallet={route.params.wallet} />
    </SafeAreaView>
  )
}

{
  /*
  <Text style={styles.textStyle}>Greetings! Started with ReactNative</Text>
  <Text style={styles.subHeaderStyle}>My name is {name}</Text>
    <TouchableOpacity
      style={styles.button1}
      onPress={() => {connector.connect()}}
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
        <Button title="Sign Message" onPress={() => signMessageFunc()} />
        <Button title="Kill Session" onPress={() => connector.killSession()} />
      </>
    }
    */
}

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  textStyle: {
    fontSize: 45,
  },
  subHeaderStyle: {
    fontSize: 20,
  },
})

export default SpamBoxScreen
