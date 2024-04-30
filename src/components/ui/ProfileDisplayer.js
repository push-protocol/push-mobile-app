import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';
import GLOBALS from 'src/Globals';
import ENSButton from 'src/components/buttons/ENSButton';
import OverlayBlur from 'src/components/modals/OverlayBlur';
import Blockies from 'src/components/web3/Blockies';
import {usePushApi} from 'src/contexts/PushApiContext';
import {usePushApiMode} from 'src/hooks/pushapi/usePushApiMode';

const MARGIN_RIGHT = 120;
const ProfileDisplayer = props => {
  const wallet = props.currentUser?.wallet?.toLowerCase() || null;
  const {isLoading, userInfo} = usePushApi();
  const {isGreenStatus} = usePushApiMode();

  const {style} = props;
  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      <SafeAreaView style={[styles.container, styles.safeContainer]}>
        <View>
          <TouchableOpacity
            style={[styles.header]}
            onPress={() => {
              props.toggleShow();
            }}
            pointerEvents="auto">
            {userInfo?.profile.picture ? (
              <Image
                source={{uri: userInfo.profile.picture}}
                style={styles.image}
                resizeMode={'cover'}
              />
            ) : (
              <Blockies
                style={styles.blockies}
                seed={wallet} //string content to generate icon
                dimension={40} // blocky icon size
              />
            )}
            {!isLoading && (
              <View
                style={[
                  styles.statusIcon,
                  {
                    backgroundColor: !isGreenStatus
                      ? GLOBALS.COLORS.STATUS_YELLOW
                      : GLOBALS.COLORS.STATUS_GREEN,
                  },
                ]}
              />
            )}
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
  statusIcon: {
    position: 'absolute',
    top: 28,
    left: 38,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: GLOBALS.COLORS.WHITE,
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
  image: {
    width: 40,
    height: 40,
    borderWidth: 1,
    marginRight: 10,
    overflow: 'hidden',
    resizeMode: 'contain',
    borderRadius: 40 / 2,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
  },
});

export default ProfileDisplayer;
