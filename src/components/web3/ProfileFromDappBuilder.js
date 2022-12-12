import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Peer from 'react-native-peerjs';
import SafeAreaView from 'react-native-safe-area-view';
import GLOBALS from 'src/Globals';
import ENSButton from 'src/components/buttons/ENSButton';
import Blockies from 'src/components/web3/Blockies';

import CryptoHelper from '../../helpers/CryptoHelper';

const ProfileFromDappBuilder = ({
  style,
  wallet,
  peerId,
  aes,
  setProfileComplete,
  setPgpPk,
}) => {
  // Setup state
  const [indicator, setIndicator] = useState(true);

  const peer = new Peer();

  React.useEffect(() => {
    console.log('Doing peer jsx');
    peer.on('open', function (id) {
      // connection done
      console.log('My peer ID is: ' + id);

      // connect to dapp
      console.log('communicating with dapp ', peerId);
      const conn = peer.connect(peerId);
      conn.on('open', function () {
        // send data to dapp
        conn.send({peerID: id});
      });
    });

    // handle data from dapp
    peer.on('connection', function (conn) {
      console.log('got connection from the dapp');
      conn.on('data', function (data) {
        console.log('got data from dapp');
        const {encryptedPgpKey} = data;
        const decryptedPgpKey = CryptoHelper.decryptWithAES(
          encryptedPgpKey,
          aes,
        );

        setPgpPk(decryptedPgpKey);
        setIndicator(false);
        setProfileComplete(true);
      });
    });
  }, []);

  // RENDER
  return (
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.profile}>
        <View style={styles.profile}>
          <Blockies
            style={styles.blockies}
            seed={wallet.toLowerCase()} //string content to generate icon
            dimension={128} // blocky icon size
          />
          <ENSButton
            style={styles.ensbox}
            loading={indicator}
            cns={''}
            ens={'Profile Synced'}
            wallet={wallet}
            fontSize={16}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  blockies: {
    borderRadius: 128,
    borderWidth: 4,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
    overflow: 'hidden',
    margin: 20,
  },
  profileErr: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
  },
  profileErrMsg: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    flex: 1,
  },
  paratop: {
    marginBottom: 0,
  },
  para: {
    marginBottom: 20,
  },
  paraend: {},
  reset: {
    marginBottom: 10,
  },
});

export default ProfileFromDappBuilder;
