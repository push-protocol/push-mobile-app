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

import MaskedView from '@react-native-community/masked-view'
import { LinearGradient } from 'expo-linear-gradient'

import StylishLabel from 'src/components/labels/StylishLabel'
import PrimaryButton from 'src/components/buttons/PrimaryButton'
import EPNSActivity from 'src/components/loaders/EPNSActivity'

import OverlayBlur from 'src/components/modals/OverlayBlur'
import Blockies from 'src/components/web3/Blockies'
import ENSButton from 'src/components/buttons/ENSButton'

import Web3Helper from 'src/helpers/Web3Helper'

import GLOBALS from 'src/Globals'
import { switchUser } from 'src/redux/authSlice'
import { connect } from 'react-redux'

const MARGIN_RIGHT = 120

class ProfileDisplayer extends Component {
  // CONSTRUCTOR
  constructor(props) {
    super(props)

    this.state = {
      cns: '',
      ens: '',
      loading: true,
      active: false,

      fader: new Animated.Value(0),
    }
  }

  // COMPONENT MOUNTED
  async componentDidMount() {
    // do for CNS
    let walletObject = await Web3Helper.updateCNSAndFetchWalletInfoObject()
    let cns = ''

    if (walletObject.cns !== '') {
      cns = walletObject.cns
    }

    // do for ENS
    walletObject = await Web3Helper.updateENSAndFetchWalletInfoObject()
    let ens = ''

    if (walletObject.ens !== '') {
      ens = walletObject.ens
    }

    this.setState({
      cns: cns,
      ens: ens,
      loading: false,
    })
  }

  // To toggle Active Status
  toggleActive = (toggle) => {
    this.setState({
      active: toggle,
    })

    // DEPRECATED
    // Commented out till we find how to cover the entire screen
    //this.refs.OverlayBlur.changeRenderState(toggle, true);
    // DEPRECATION ENDS HERE

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
    const { style, lockApp, auth } = this.props
    const wallet = auth.users[auth.currentUser].wallet

    return (
      <View style={[styles.container, style]} pointerEvents="box-none">
        <SafeAreaView style={[styles.container, styles.safeContainer]}>
          <View style={[styles.innerContainer]}>
            <TouchableOpacity
              style={[styles.header]}
              onPress={() => {
                this.toggleActive(!this.state.active)
              }}
              pointerEvents="auto"
            >
              <Blockies
                style={styles.blockies}
                seed={wallet ? wallet.toLowerCase() : null} //string content to generate icon
                dimension={40} // blocky icon size
              />
              <ENSButton
                style={styles.ens}
                innerStyle={styles.ensbox}
                loading={this.state.loading}
                cns={this.state.cns}
                ens={this.state.ens}
                wallet={wallet}
                fontSize={14}
                forProfile={true}
              />
            </TouchableOpacity>
            {this.state.active == false ? null : (
              <Animated.View
                style={[styles.activeProfile, { opacity: this.state.fader }]}
                pointerEvents="box-none"
              >
                <View style={styles.upArrow} />
                <View style={styles.content}>
                  {auth.users.map(({ wallet, index }) => {
                    const isActive = auth.activeUser === index
                    const onPress = () => {
                      this.props.switchUser(index)
                    }

                    return isActive ? (
                      <TouchableOpacity style={styles.activeWalletInfo}>
                        <StylishLabel
                          style={styles.para}
                          fontSize={16}
                          title="[t:Connected Wallet]"
                        />
                        <Text style={styles.activeWalletText}>{wallet}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.walletInfo}
                        onPress={onPress}
                      >
                        <Text style={styles.walletText}>{wallet}</Text>
                      </TouchableOpacity>
                    )
                  })}

                  {/* 
                  <View style={styles.interestEarned}>
                    <View style={styles.interestEarnedTitle}>
                      <MaskedView
                        style={styles.maskedView}
                        maskElement={
                          <View style={styles.maskedElementView}>
                            <Text style={styles.maskedTitle}>
                              Interest Earned
                            </Text>
                          </View>
                        }
                      >
                        <LinearGradient
                          colors={[
                            GLOBALS.COLORS.GRADIENT_PRIMARY,
                            GLOBALS.COLORS.GRADIENT_SECONDARY,
                          ]}
                          style={styles.fullgradient}
                          start={[0.1, 0.3]}
                          end={[1, 1]}
                        ></LinearGradient>
                      </MaskedView>
                    </View>
                    <View style={styles.interestEarnedText}>
                      <EPNSActivity style={styles.activity} size="small" />
                    </View>
                  </View> */}

                  <View style={styles.settings}>
                    <PrimaryButton
                      iconFactory="Ionicons"
                      icon="md-lock"
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
})

const mapStateToProps = (state) => ({
  auth: state.auth,
})

export default connect(mapStateToProps, { switchUser })(ProfileDisplayer)
