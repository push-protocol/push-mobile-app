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

import GLOBALS from 'src/Globals';

export default class TextEntryPrompt extends Component {
  // Constructor
  constructor(props) {
    super(props);

    this.state = {
      fader: new Animated.Value(0),
      render: false,
      indicator: false,
      PassCode: '',
    }
  }

  // Validate Pass Code
  validatePassCode = (parentFunc, value) => {
    Keyboard.dismiss();
    parentFunc(value);
  }

  resetPassCode = (value) => {
    this.setState({
      PassCode: ''
    });
  }

  // Set Pass Code
  changePassCode = (parentFunc, value) => {
    // replace spaces
    value = value.replace(/ /g,'');

    this.setState({
      PassCode: value
    });

    if (value.length == 64) {
      this.validatePassCode(parentFunc, value);
    }
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
      PassCode: '',
      indicator: false
    });

    if (animate) {
      Animated.timing(
        this.state.fader, {
          toValue: 1,
          duration: 250,
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
      doneTitle,
      doneFunc,
      closeTitle,
      closeFunc
    } = this.props;

    let PassCodesegment = this.state.PassCode.split("");

    return (
      this.state.render == false
        ? null
        : <Animated.View
            style = {[ styles.container, {opacity: this.state.fader} ]}>

            <KeyboardAvoidingView
              style = {styles.keyboardAvoid}
              behavior = "height"
              enabled
            >
              <View style = {styles.modal}>
                <View style = {[ styles.titleArea ]}>
                  {
                    title == null
                      ? null
                      : <Text style = {[ styles.title ]}>{title}</Text>
                  }
                  {
                    subtitle == null
                      ? null
                      : <Text style = {[ styles.subtitle ]}>{subtitle}</Text>
                  }
                </View>
                <View style = {[ styles.optionsArea ]}>
                  {
                    this.state.indicator == true
                    ? <ActivityIndicator
                        style = {styles.activity}
                        size = "large"
                        color = {GLOBALS.COLORS.BLACK}
                      />
                    : <TextInput
                        style = {styles.input}
                        maxLength = {64}
                        contextMenuHidden = {true}
                        multiline = {true}
                        autoCapitalize = "characters"
                        autoCorrect = {false}
                        onChangeText = {(value) => (this.changePassCode(doneFunc, value))}
                        onSubmitEditing = {(event) => {
                          this.validatePassCode(doneFunc, event.nativeEvent.text);
                        }}
                        value = {this.state.PassCode}
                        returnKeyType = "done"
                        autoFocus
                      />
                }
                </View>
                <View style = {[ styles.doneArea ]}>
                  <TouchableHighlight
                    style = {[ styles.done ]}
                    underlayColor = {GLOBALS.COLORS.MID_GRAY}
                    onPress = {closeFunc}
                  >
                    <Text style = {[ styles.doneText ]} >{doneTitle}</Text>
                  </TouchableHighlight>
                </View>
                <View style = {[ styles.cancelArea ]}>
                  <TouchableHighlight
                    style = {[ styles.cancel ]}
                    underlayColor = {GLOBALS.COLORS.MID_GRAY}
                    onPress = {closeFunc}
                  >
                    <Text style = {[ styles.cancelText ]} >{closeTitle}</Text>
                  </TouchableHighlight>
                </View>
              </View>

            </KeyboardAvoidingView>
          </Animated.View>
    );
  }
}

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
    borderWidth: 1,
    borderColor: GLOBALS.COLORS.LIGHT_GRAY,
    minHeight: 80,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  doneArea: {

  },
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
  }
});
