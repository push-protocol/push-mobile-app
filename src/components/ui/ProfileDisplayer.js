import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import ENSButton from 'src/components/buttons/ENSButton';
import OverlayBlur from 'src/components/modals/OverlayBlur';
import Blockies from 'src/components/web3/Blockies';
import GLOBALS from 'src/Globals';

const MARGIN_RIGHT = 120;
const ProfileDisplayer = props => {
  const {style} = props;
  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      <SafeAreaView style={[styles.container, styles.safeContainer]}>
        <View style={[styles.innerContainer]}>
          <TouchableOpacity
            style={[styles.header]}
            onPress={() => {
              props.toggleShow();
            }}
            pointerEvents="auto">
            <Blockies
              style={styles.blockies}
              seed={props.wallet ? props.wallet.toLowerCase() : null} //string content to generate icon
              dimension={40} // blocky icon size
            />
            <ENSButton
              style={styles.ens}
              innerStyle={styles.ensbox}
              loading={props.loading}
              cns={props.currentUser.cns}
              ens={props.currentUser.ens}
              wallet={props.currentUser.wallet}
              fontSize={14}
              forProfile={true}
              dropdownIcon={props.numUsers > 1}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Overlay Blur to show incase need to emphasize on something */}
      <OverlayBlur
        style={{backgroundColor: 'black'}}
        onPress={() => {
          props.toggleActive();
        }}
        pointerEvents="box-only"
      />
    </View>
  );
};
// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  safeContainer: {
    width: '100%',
    alignSelf: 'flex-start',
    zIndex: 3,
  },
  header: {
    width: Math.round(Dimensions.get('window').width) - MARGIN_RIGHT,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: GLOBALS.ADJUSTMENTS.SCREEN_GAP_VERTICAL,
    paddingHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
  },
  blockies: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
    overflow: 'hidden',
    marginRight: 10,
  },
  ens: {
    flex: 1,
    alignItems: 'flex-start',
    marginBottom: 0,
    padding: 0,
  },
  ensbox: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 5,
  },
  headerActive: {
    marginTop: GLOBALS.ADJUSTMENTS.SCREEN_GAP_VERTICAL / 2,
    marginRight: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
  },
  blockiesActive: {
    marginTop: 4,
    marginLeft: 4,
  },
  content: {
    marginTop: GLOBALS.ADJUSTMENTS.SCREEN_GAP_VERTICAL,
    marginBottom: GLOBALS.ADJUSTMENTS.SCREEN_GAP_VERTICAL,
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
  },
  interestEarned: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  interestEarnedTitle: {
    flex: 1,
  },
  maskedView: {
    flex: 1,
    height: '100%',
  },
  maskedElementView: {
    backgroundColor: 'transparent',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  maskedTitle: {
    color: 'black',
    fontWeight: 'bold',
  },
  fullgradient: {
    height: 20,
    flex: 1,
  },
  interestEarnedText: {},
  settings: {
    marginTop: 10,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    top: 50,
  },
});

export default ProfileDisplayer;
