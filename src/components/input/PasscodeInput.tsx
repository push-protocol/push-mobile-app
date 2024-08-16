import React, {forwardRef} from 'react';
import {StyleSheet, Text, TextInput, TextInputProps, View} from 'react-native';
import GLOBALS from 'src/Globals';

interface PasscodeInputProps extends TextInputProps {
  passcode: string;
}

const PasscodeInputBox = ({char}: {char: string}) => {
  return (
    <View style={styles.passcodeInputBox}>
      <Text style={styles.passcodeInputBoxDigit}>{char}</Text>
    </View>
  );
};

const PasscodeInput = forwardRef<TextInput, PasscodeInputProps>(
  ({passcode, ...props}, ref) => {
    return (
      <>
        <View style={styles.passcodeContainer}>
          {passcode.split('').map((char, index) => (
            <PasscodeInputBox key={index} char={char} />
          ))}
          {Array.from({length: 6 - passcode.length}, (_, index) => (
            <PasscodeInputBox key={index} char="" />
          ))}
        </View>
        <View removeClippedSubviews={true}>
          <TextInput
            ref={ref}
            {...props}
            style={styles.passcodeInput}
            maxLength={GLOBALS.CONSTANTS.PASSCODE_LENGTH}
            contextMenuHidden={true}
            autoCorrect={false}
            keyboardType="numeric"
            value={passcode}
          />
        </View>
      </>
    );
  },
);

export default PasscodeInput;

const styles = StyleSheet.create({
  passcodeInput: {
    height: 50,
    width: 306,
    opacity: 0,
    alignSelf: 'center',
  },
  passcodeInputBox: {
    width: 44,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEDFE1',
    borderRadius: 8,
    backgroundColor: GLOBALS.COLORS.WHITE,
  },
  passcodeInputBoxDigit: {
    color: GLOBALS.COLORS.BLACK,
    fontSize: 20,
    fontWeight: '500',
  },
  passcodeContainer: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
});
