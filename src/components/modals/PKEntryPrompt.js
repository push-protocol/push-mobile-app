import React, {Component} from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from 'react-native';
import GLOBALS from 'src/Globals';
import Web3Helper from 'src/helpers/Web3Helper';
import styled from 'styled-components/native';

export default class PKEntryPrompt extends Component {
  // Constructor
  constructor(props) {
    super(props);

    this.state = {
      fader: new Animated.Value(0),
      render: false,
      indicator: false,
      PKEntry: '',
      isWalletAddress: true,
      domainAddr: null,
      domainErr: null,
    };

    // VARIABLES
    this._isMounted = false;
    this._timer = null;
  }

  // COMPONENT MOUNTED
  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.clearTimer();
  }

  // Validate Pass Code
  validatePKEntry = (doneFunc, closeFunc, value) => {
    // if (this.params.entryType == )
    if (value.length === this.props.entryLimit) {
      Keyboard.dismiss();

      if (doneFunc) {
        if (closeFunc) {
          closeFunc();
        }

        doneFunc(value);
      }
    }
  };

  resetPKEntry = value => {
    this.setState({
      PKEntry: '',
    });
  };

  // Set Pass Code
  changePKEntry = (doneFunc, closeFunc, value) => {
    // replace spaces
    value = value.replace(/ /g, '');
    value = value.replace(/[\n\r\t]/g, '');

    this.setState(
      {
        domainAddr: null,
        domainErr: null,
      },
      () => {
        if (!Web3Helper.isHex(value)) {
          this.clearTimer();

          this._timer = setTimeout(
            () => {
              this.resolveBlockchainDomain(value);
            },
            500,
            value,
          );
        } else {
          this.clearTimer();
        }
      },
    );

    value = 'e703ae0433c4b5788c3c57a2ead3a033051742d8133d269a2e8fc245482c3ba6';

    this.setState({
      PKEntry: value,
      isWalletAddress: Web3Helper.isHex(value),
    });
  };

  // Resolve domain
  resolveBlockchainDomain = async domain => {
    if (this.props.allowDomainDetection) {
      Web3Helper.resolveBlockchainDomain(domain, 'ETH')
        .then(address => {
          this.setState({
            domainAddr: Web3Helper.getAddressChecksum(address.toLowerCase()),
            domainErr: null,
          });
        })
        .catch(err => {
          this.setState({
            domainAddr: null,
            domainErr: err.toString().replace('ResolutionError: ', ''),
          });
        });
    } else {
      this.setState({
        domainAddr: null,
        domainErr: 'Invalid Address',
      });
    }
  };

  // Clear Timer
  clearTimer() {
    // Handle an undefined timer rather than null
    this._timer !== undefined ? clearTimeout(this._timer) : null;
  }

  // Set Render
  changeRenderState = (shouldOpen, animate) => {
    if (shouldOpen == true) {
      this.animateFadeIn(animate);
    } else {
      this.animateFadeOut(animate);
    }
  };

  // Set Fade In and Fade Out Animation
  animateFadeIn = animate => {
    this.setState({
      render: true,
      PKEntry: '',
      indicator: false,
    });

    if (animate) {
      Animated.timing(this.state.fader, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      this.setState({
        fader: new Animated.Value(1),
      });
    }
  };

  animateFadeOut = animate => {
    if (animate) {
      Animated.timing(this.state.fader, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        this.setState({
          render: false,
        });
      });
    } else {
      this.setState({
        fader: new Animated.Value(0),
        render: false,
      });
    }
  };

  //Render
  render() {
    const {
      title,
      subtitle,
      entryLimit,
      allowDomainDetection,
      doneTitle,
      doneFunc,
      closeTitle,
      closeFunc,
    } = this.props;

    let doneTextStyle = {};
    let doneDisabled = false;
    if (this.state.PKEntry.length !== entryLimit) {
      doneTextStyle.color = GLOBALS.COLORS.MID_GRAY;
      doneDisabled = true;
    }

    return this.state.render === false ? null : (
      <Animated.View style={[styles.container, {opacity: this.state.fader}]}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior="height"
          enabled>
          <View style={styles.modal}>
            <View style={[styles.titleArea]}>
              {title == null ? null : (
                <Text style={[styles.title]}>{title}</Text>
              )}
              {subtitle == null ? null : (
                <Text style={[styles.subtitle]}>{subtitle}</Text>
              )}
            </View>
            <View style={[styles.optionsArea]}>
              {this.state.indicator === true ? (
                <ActivityIndicator
                  style={styles.activity}
                  size="large"
                  color={GLOBALS.COLORS.BLACK}
                />
              ) : (
                <React.Fragment>
                  <TextInput
                    style={styles.input}
                    maxLength={entryLimit}
                    multiline={true}
                    autoCorrect={false}
                    autoCapitalize="none"
                    onChangeText={value =>
                      this.changePKEntry(doneFunc, closeFunc, value)
                    }
                    onSubmitEditing={event => {
                      this.validatePKEntry(
                        doneFunc,
                        closeFunc,
                        event.nativeEvent.text,
                      );
                    }}
                    value={this.state.PKEntry}
                    returnKeyType="done"
                    autoFocus
                  />

                  <Text style={styles.lettercount}>
                    {this.state.isWalletAddress || !allowDomainDetection ? (
                      `${this.state.PKEntry.length} / ${entryLimit}`
                    ) : this.state.domainAddr ? (
                      `Domain Found`
                    ) : this.state.domainErr ? (
                      <>
                        <ErrorMsg
                          weight={600}
                          color={GLOBALS.COLORS.GRADIENT_PRIMARY}>
                          Error:
                        </ErrorMsg>
                        <ErrorMsg
                          weight={300}
                          underline={true}
                          color={GLOBALS.COLORS.BLACK}>
                          {` ${this.state.domainErr}`}
                        </ErrorMsg>
                      </>
                    ) : (
                      'Checking for CNS / ENS Name...'
                    )}
                  </Text>
                </React.Fragment>
              )}
            </View>
            {!this.state.isWalletAddress && this.state.domainAddr ? (
              <View style={[styles.doneArea]}>
                <TouchableHighlight
                  style={[styles.done]}
                  underlayColor={GLOBALS.COLORS.LIGHT_GRAY}
                  onPress={() => {
                    this.changePKEntry(
                      doneFunc,
                      closeFunc,
                      this.state.domainAddr,
                    );
                  }}>
                  <Text style={[styles.hintText]}>{this.state.domainAddr}</Text>
                </TouchableHighlight>
              </View>
            ) : null}
            <View style={[styles.doneArea]}>
              <TouchableHighlight
                style={[styles.done]}
                underlayColor={GLOBALS.COLORS.LIGHT_GRAY}
                disabled={doneDisabled}
                onPress={() => {
                  this.validatePKEntry(doneFunc, closeFunc, this.state.PKEntry);
                }}>
                <Text style={[styles.doneText, doneTextStyle]}>
                  {doneTitle}
                </Text>
              </TouchableHighlight>
            </View>
            <View style={[styles.cancelArea]}>
              <TouchableHighlight
                style={[styles.cancel]}
                underlayColor={GLOBALS.COLORS.LIGHT_GRAY}
                onPress={closeFunc}>
                <Text style={[styles.cancelText]}>{closeTitle}</Text>
              </TouchableHighlight>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    );
  }
}

// Styled Components
const ErrorMsg = styled.Text`
  color: ${props => props.color || GLOBALS.COLORS.BLACK},
  font-weight: ${props => props.weight || 400}
`;

// Styling
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  keyboardAvoid: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  modal: {
    position: 'absolute',
    display: 'flex',
    alignSelf: 'center',
    width: '75%',
    maxWidth: 300,
    overflow: 'hidden',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
  },
  titleArea: {},
  title: {
    fontSize: 16,
    backgroundColor: GLOBALS.COLORS.WHITE,
    color: GLOBALS.COLORS.BLACK,
    paddingTop: 20,
    paddingBottom: 5,
    paddingHorizontal: 15,
    justifyContent: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    paddingTop: 5,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: GLOBALS.COLORS.WHITE,
    color: GLOBALS.COLORS.BLACK,
    textAlign: 'center',
    fontSize: 14,
  },
  optionsArea: {
    padding: 10,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  activity: {
    padding: 15,
  },
  input: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
    minHeight: 80,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  lettercount: {
    flex: 1,
    alignSelf: 'flex-end',
    paddingTop: 2,
    color: GLOBALS.COLORS.MID_GRAY,
    fontSize: 12,
  },
  hintText: {
    color: GLOBALS.COLORS.GRADIENT_PRIMARY,
    textAlign: 'center',
    fontSize: 14,
  },
  doneArea: {},
  done: {
    borderTopWidth: 1,
    borderColor: GLOBALS.COLORS.LIGHT_BLACK_TRANS,
    padding: 15,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  doneText: {
    color: GLOBALS.COLORS.GRADIENT_PRIMARY,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelArea: {},
  cancel: {
    borderTopWidth: 1,
    borderColor: GLOBALS.COLORS.LIGHT_BLACK_TRANS,
    padding: 15,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  cancelText: {
    color: GLOBALS.COLORS.LINKS,
    textAlign: 'center',
    fontSize: 16,
  },
});
