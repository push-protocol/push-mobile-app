import React, {useEffect, useState} from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import GLOBALS from 'src/Globals';

const ConfirmResetWallet = ({
  closeFunc,
  closeTitle,
  subtitle,
  title,
  cancelTitle,
  cancelFunc,
}) => {
  const [state, setState] = useState({
    fader: new Animated.Value(1),
    render: false,
    indicator: false,
    _isMounted: false,
  });

  useEffect(() => {
    setState({
      ...state,
      _isMounted: true,
    });

    return () => {
      setState({
        ...state,
        _isMounted: false,
      });
    };
  }, []);

  return (
    //@ts-ignore
    <Animated.View style={[styles.container, {opacity: state.fader}]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior="height"
        enabled>
        <View style={styles.modal}>
          <View style={[styles.titleArea]}>
            {title == null ? null : <Text style={[styles.title]}>{title}</Text>}
            {subtitle == null ? null : (
              <Text style={[styles.subtitle]}>{subtitle}</Text>
            )}
          </View>

          <View style={[styles.cancelArea]}>
            <TouchableHighlight
              style={[styles.cancel]}
              underlayColor={GLOBALS.COLORS.LIGHT_GRAY}
              onPress={cancelFunc}>
              <Text style={[styles.closeText]}>{cancelTitle}</Text>
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
};

// Styling
const styles = StyleSheet.create({
  container: {
    //@ts-ignore
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
  },
  keyboardAvoid: {
    //@ts-ignore
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
  cancelArea: {marginBottom: 2},
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
  closeText: {
    color: GLOBALS.COLORS.PINK,
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ConfirmResetWallet;
