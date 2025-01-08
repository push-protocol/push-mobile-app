import React, {FC, useMemo} from 'react';
import {Pressable, StyleSheet, Text, TouchableOpacity} from 'react-native';
import Globals from 'src/Globals';

import {PillProps} from '.';

const Pill: FC<PillProps> = ({data, value, onChange, disabled}) => {
  const isActive = useMemo(() => data.value === value, [value]);
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onChange(data)}
      style={[
        styles.mainView,
        isActive ? styles.activeView : styles.inactiveView,
      ]}>
      <Text
        style={[
          styles.labelText,
          isActive ? styles.activeText : styles.inactiveText,
        ]}>
        {data.label}
      </Text>
    </Pressable>
  );
};

export {Pill};

const styles = StyleSheet.create({
  mainView: {
    height: 40,
    borderRadius: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeView: {
    backgroundColor: Globals.COLORS.BLACK,
  },
  inactiveView: {
    backgroundColor: Globals.COLORS.PILL_BG_DEFAULT,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  activeText: {
    color: Globals.COLORS.WHITE,
  },
  inactiveText: {
    color: Globals.COLORS.PILL_TEXT_DEFAULT,
  },
});
