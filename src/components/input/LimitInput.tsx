import React, {useState} from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import Globals from 'src/Globals';

interface LimitInputProps extends React.ComponentProps<typeof TextInput> {
  title: string;
  limit?: number;
  optional?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  value: string;
}

const LimitInput: React.FC<LimitInputProps> = ({
  title,
  limit,
  optional = false,
  containerStyle,
  value,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
      <View style={[styles.container, containerStyle]}>
        <View style={styles.flexRow}>
          <Text>{title}</Text>
          <Text style={styles.optionalTag}>{optional && 'optional'}</Text>
        </View>
        {limit && <Text>{limit - value.length}</Text>}
      </View>
      <TextInput
        style={[styles.input, isFocused && styles.isFocused, style]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={limit}
        {...rest}
      />
    </>
  );
};

export default LimitInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionalTag: {
    color: 'gray',
    marginLeft: 5,
    fontSize: 12,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Globals.COLORS.CHAT_LIGHT_GRAY,
    color: Globals.COLORS.BLACK,
    fontSize: 16,
    minHeight: 48,
    marginVertical: 4,
    width: '100%',
    minWidth: '100%',
    alignSelf: 'center',
    textAlignVertical: 'center',
    padding: 8,
  },
  isFocused: {
    borderColor: Globals.COLORS.PINK,
  },
});
