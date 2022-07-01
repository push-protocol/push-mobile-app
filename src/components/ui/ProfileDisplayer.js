import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native'
import SafeAreaView from 'react-native-safe-area-view'

import StylishLabel from 'src/components/labels/StylishLabel'
import PrimaryButton from 'src/components/buttons/PrimaryButton'

import OverlayBlur from 'src/components/modals/OverlayBlur'
import Blockies from 'src/components/web3/Blockies'
import ENSButton from 'src/components/buttons/ENSButton'


import GLOBALS from 'src/Globals'
import { switchUser } from 'src/redux/authSlice'
import { fetchFeedData, clearFeed } from 'src/redux/feedSlice'
import { connect } from 'react-redux'

const MARGIN_RIGHT = 120

getProperAddressLabel = (wallet,ens,cns) => ens || cns || wallet;


class ProfileDisplayer extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props)

    this.state = {
      cns: this.props.auth.users[this.props.auth.currentUser].cns,
      ens: this.props.auth.users[this.props.auth.currentUser].ens,
      loading: false,
      active: false,
      fader: new Animated.Value(0),
      wallet: this.props.auth.users[this.props.auth.currentUser].wallet,
    }
  }

  setWalletState(idx){
    this.setState({
      cns: this.props.auth.users[idx].cns,
      ens: this.props.auth.users[idx].ens,
      wallet: this.props.auth.users[idx].wallet,
    })
  }

  // To toggle Active Status
  toggleActive = (toggle) => {
    this.setState({
      active: toggle,
    })

    if (toggle) {
      // Fade In
      Animated.timing(this.state.fader, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start()
    } else {
      // Fade Out
      Animated.timing(this.state.fader, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }

  // RENDER
  render() {
    const { style, lockApp, auth, navigation } = this.props

    return (
      <View style={[styles.container, style]} pointerEvents="box-none">
        <SafeAreaView style={[styles.container, styles.safeContainer]}>
          <View style={[styles.innerContainer]}>
            <TouchableOpacity
              style={[styles.header]}
              onPress={() => {
                this.toggleActive(!this.state.active)
                console.log('Press')
              }}
              pointerEvents="auto"
            >
              <Blockies
                style={styles.blockies}
                seed={
                  this.state.wallet ? this.state.wallet.toLowerCase() : null
                } //string content to generate icon
                dimension={40} // blocky icon size
              />
              <ENSButton
                style={styles.ens}
                innerStyle={styles.ensbox}
                loading={this.state.loading}
                cns={this.state.cns}
                ens={this.state.ens}
                wallet={this.state.wallet}
                fontSize={14}
                forProfile={true}
                dropdownIcon={auth.users.length > 1}
              />
            </TouchableOpacity>
            {this.state.active == false ? null : (
              <Animated.View
                style={[styles.activeProfile, { opacity: this.state.fader }]}
                pointerEvents="box-none"
              >
                <View style={styles.upArrow} />
                <View style={styles.content}>
                  {auth.users.map(({ wallet, index, ens, cns }) => {
                    let isActive = auth.currentUser === index

                    const onPress = () => {
                      this.props.switchUser(index)
                      navigation.navigate(GLOBALS.SCREENS.FEED, {
                        refreshNotifFeed: true,
                      })
                      navigation.setParams({ refreshNotifFeed: true })
                      this.props.clearFeed(null)
                      this.props.fetchFeedData({
                        rewrite: true,
                        wallet,
                      })

                      this.setWalletState(index)
                      this.toggleActive(!this.state.active)
                    }

                    return isActive ? (
                      <TouchableOpacity style={styles.activeWalletInfo}>
                        <StylishLabel
                          style={styles.para}
                          fontSize={16}
                          title="[t:Connected Wallet]"
                        />
                        <Text style={styles.activeWalletText}>{getProperAddressLabel(wallet,ens,cns)}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.walletInfo}
                        onPress={onPress}
                      >
                        <Text style={styles.walletText}>{getProperAddressLabel(wallet,ens,cns)}</Text>
                      </TouchableOpacity>
                    )
                  })}

                  <View style={styles.settings}>
                    <PrimaryButton
                      iconFactory="Ionicons"
                      icon=""
                      iconSize={24}
                      title="Lock App"
                      fontSize={16}
                      fontColor={GLOBALS.COLORS.WHITE}
                      bgColor={GLOBALS.COLORS.GRADIENT_PRIMARY}
                      disabled={false}
                      onPress={() => {
                        lockApp()
                      }}
                    />
                  </View>
                </View>
              </Animated.View>
            )}
          </View>
        </SafeAreaView>

        {/* Overlay Blur to show incase need to emphasize on something */}
        <OverlayBlur
          style={{ backgroundColor: 'black' }}
          ref="OverlayBlur"
          onPress={() => {
            // Exit Intent
            this.toggleActive(!this.state.active)
          }}
          pointerEvents="box-only"
        />
      </View>
    )
  }
}

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
  activeProfile: {
    position: 'absolute',
    width: Math.round(Dimensions.get('window').width) - 75,
    backgroundColor: GLOBALS.COLORS.WHITE,
    top: 70,
    left: 20,
    borderRadius: 10,
    shadowColor: GLOBALS.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    elevation: 10,
    zIndex: 2,
    maxWidth: 500,
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
  closeIcon: {
    alignSelf: 'center',
    backgroundColor: GLOBALS.COLORS.LIGHT_GRAY,
    paddingTop: 1,
    paddingHorizontal: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  content: {
    marginTop: GLOBALS.ADJUSTMENTS.SCREEN_GAP_VERTICAL,
    marginBottom: GLOBALS.ADJUSTMENTS.SCREEN_GAP_VERTICAL,
    marginHorizontal: GLOBALS.ADJUSTMENTS.SCREEN_GAP_HORIZONTAL,
  },
  walletInfo: {
    padding: 10,
    backgroundColor: GLOBALS.COLORS.DARK_BLACK_TRANS,
    borderRadius: GLOBALS.ADJUSTMENTS.DEFAULT_MID_RADIUS,
    marginBottom: 10,
  },
  activeWalletInfo: {
    padding: 10,
    backgroundColor: GLOBALS.COLORS.LIGHT_GRAY,
    borderRadius: GLOBALS.ADJUSTMENTS.DEFAULT_MID_RADIUS,
    marginBottom: 10,
  },
  upArrow: {
    position: 'absolute',
    top: -8,
    left: 3,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: GLOBALS.COLORS.WHITE,
  },
  walletText: {
    marginTop: 10,
    color: GLOBALS.COLORS.WHITE,
    marginBottom: 5,
  },
  activeWalletText: {
    marginTop: 10,
    color: GLOBALS.COLORS.DARKER_GRAY,
    marginBottom: 5,
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
})

const mapStateToProps = (state) => ({
  auth: state.auth,
})

export default connect(mapStateToProps, {
  switchUser,
  fetchFeedData,
  clearFeed,
})(ProfileDisplayer)
