import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import GLOBALS from 'src/Globals';
import PrimaryButton from 'src/components/buttons/PrimaryButton';
import ProfileFromDappBuilder from 'src/components/web3/ProfileFromDappBuilder';

const SignInScreen = props => {
  let {code} = props.route.params;
  console.log('got code', code);

  const [AES_KEY, PeerId, Wallet] = code.split('+');

  const [isComplete, setProfileComplete] = useState(false);
  // Load the Next Screen
  const loadNextScreen = async () => {
    // navigation.navigate(GLOBALS.SCREENS.CHATS, {focues: 'true'});
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Loading From Dapp</Text>
        <View style={styles.inner}>
          <ProfileFromDappBuilder
            aes={AES_KEY}
            peerId={PeerId}
            wallet={Wallet}
            setProfileComplete={setProfileComplete}
            style={styles.profile}
          />
        </View>
        {isComplete && (
          <PrimaryButton
            iconFactory="Ionicons"
            icon="ios-arrow-forward"
            iconSize={24}
            title="Continue"
            fontSize={16}
            fontColor={GLOBALS.COLORS.WHITE}
            bgColor={GLOBALS.COLORS.GRADIENT_THIRD}
            onPress={() => {
              loadNextScreen();
            }}
            style={styles.buttonStyle}
            disabled={!isComplete}
          />
        )}
      </SafeAreaView>
    </>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GLOBALS.COLORS.WHITE,
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    paddingTop: 40,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    top: 0,
    bottom: 0,
    padding: 20,
    maxWidth: 540,
  },
  para: {
    marginBottom: 20,
  },
  profile: {},
  insetAdjustment: {
    paddingBottom: 5,
  },
  noInsetAdjustment: {
    paddingBottom: 20,
  },
  buttonStyle: {
    bottom: '-35%',
    marginHorizontal: 20,
  },
});

export default SignInScreen;
