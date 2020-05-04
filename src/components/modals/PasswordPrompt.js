import React, { Component } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Keyboard,
  Animated
} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import GLOBALS from 'src/global/Globals';

export default class PasswordPrompt extends Component {
  // Constructor
  constructor(props) {
    super(props);

    this.state = {
      fader: new Animated.Value(0),
      render: false,
      indicator: false,
      passcode: '',
    }
  }

  // Validate Pass Code
  validatePassCode = (parentFunc, value) => {
    Keyboard.dismiss();
    parentFunc(value);
  }

  resetPassCode = (value) => {
    this.setState({
      passcode: ''
    });
  }

  // Set Pass Code
  changePassCode = (parentFunc, value) => {
    // replace spaces
    value = value.replace(/ /g,'');

    this.setState({
      passcode: value
    });

    if (value.length == 6) {
      this.validatePassCode(parentFunc, value);
    }
  }

  // Set Loading
  changeIndicator = (showIndicator) => {
    this.setState({
      indicator: showIndicator
    })
  }

  // Set Render
  changeRenderState = (shouldOpen, animate) => {
    if (shouldOpen == true) {
      this.animateFadeIn(animate);
    }
    else {
      this.animateFadeOut(animate);
    }
  }

  // Set Fade In and Fade Out Animation
  animateFadeIn = (animate) => {
    this.setState({
      render: true,
      passcode: '',
      indicator: false
    });

    if (animate) {
      Animated.timing(
        this.state.fader, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }
      ).start();
    }
    else {
      this.setState({
          fader: new Animated.Value(1)
      })
    }

  }

  animateFadeOut = (animate) => {
    if (animate) {
      Animated.timing(
        this.state.fader, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }
      ).start(() => {
        this.setState({
          render: false
        });
      });
    }
    else {
      this.setState({
          fader: new Animated.Value(0),
          render: false
      })
    }
  }

  //Render
  render() {
    const {
      title,
      subtitle,
      doneFunc,
      closeTitle,
      closeFunc
    } = this.props;

    let passcodeSegment = this.state.passcode.split("");

    return (
      this.state.render == false
        ? null
        : <Animated.View
            style={[ styles.container, {opacity: this.state.fader} ]}>

            <KeyboardAvoidingView
              style={styles.keyboardAvoid}
              behavior="height"
              enabled
            >
              <View style={styles.modal}>
                <View style={[ styles.titleArea ]}>
                  {
                    title == null
                      ? null
                      : <Text style={[ styles.title ]}>{title}</Text>
                  }
                  {
                    subtitle == null
                      ? null
                      : <Text style={[ styles.subtitle ]}>{subtitle}</Text>
                  }
                </View>
                <View style={[ styles.optionsArea ]}>
                  {
                    this.state.indicator == true
                    ? null
                    : <TextInput
                        style={styles.input}
                        maxLength={6}
                        contextMenuHidden={true}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        onChangeText={(value) => (this.changePassCode(doneFunc, value))}
                        onSubmitEditing={(event) => {
                          this.validatePassCode(doneFunc, event.nativeEvent.text);
                        }}
                        value={this.state.passcode}
                        returnKeyType="done"
                        autoFocus
                      />
                }
                {
                  this.state.indicator == true
                  ? <ActivityIndicator
                      style={styles.activity}
                      size="large"
                      color={GLOBALS.COLORS.BLACK}
                    />
                  : <View
                      style={styles.fancyTextContainer}
                      pointerEvents="none"
                    >
                      <View style={styles.fancyTextView}>
                        <Text style={styles.fancyText}>{passcodeSegment[0]}</Text>
                      </View>
                      <View style={styles.fancyTextView}>
                        <Text style={styles.fancyText}>{passcodeSegment[1]}</Text>
                      </View>
                      <View style={styles.fancyTextView}>
                        <Text style={styles.fancyText}>{passcodeSegment[2]}</Text>
                      </View>
                      <View style={styles.fancyTextView}>
                        <Text style={styles.fancyText}>{passcodeSegment[3]}</Text>
                      </View>
                      <View style={styles.fancyTextView}>
                        <Text style={styles.fancyText}>{passcodeSegment[4]}</Text>
                      </View>
                      <View style={styles.fancyTextView}>
                        <Text style={styles.fancyText}>{passcodeSegment[5]}</Text>
                      </View>
                    </View>
                }
                </View>
                <View style={[ styles.cancelArea ]}>
                  <TouchableHighlight
                    style={[ styles.cancel ]}
                    underlayColor={GLOBALS.COLORS.LIGHT_GRAY}
                    onPress={closeFunc}
                  >
                    <Text style={[ styles.cancelText ]} >{closeTitle}</Text>
                  </TouchableHighlight>
                </View>
              </View>

            </KeyboardAvoidingView>
          </Animated.View>
    );
  }
}

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
  titleArea: {

  },
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
    paddingBottom: 20,
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
    padding: 15
  },
  input: {
    padding: 15,
    borderBottomWidth: 2,
    borderColor: GLOBALS.COLORS.BLACK,
    opacity: 0
  },
  fancyTextContainer: {
    ...StyleSheet.absoluteFill,
    position: 'absolute',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row'
  },
  fancyTextView: {
    borderBottomWidth: 1,
    borderColor: GLOBALS.COLORS.BLACK,
  },
  fancyText: {
    fontSize: 24,
    minWidth: 20,
    minHeight: 30,
    textAlign: 'center',
    color: GLOBALS.COLORS.BLACK
  },
  cancelArea: {

  },
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
    fontWeight: 'bold',
  }
});
