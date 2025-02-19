import React, {FC, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import Globals from 'src/Globals';

import {DropdownProps} from './Dropdown.types';

const Dropdown: FC<DropdownProps> = ({style, data}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(data[0]);
  const [dropdownTop, setDropdownTop] = useState(0);
  const buttonRef = useRef<TouchableOpacity>(null);

  const openDropdown = () => {
    if (buttonRef.current) {
      buttonRef.current?.measure(
        (
          _fx: number,
          _fy: number,
          _width: number,
          height: number,
          _px: number,
          py: number,
        ) => {
          setDropdownTop(py + height - 10);
        },
      );
    }
    setTimeout(() => setIsVisible(true), 100);
  };

  const handleSelect = (option: any) => {
    setSelectedOption(option);
    setTimeout(() => setIsVisible(false), 100);
  };
  return (
    <>
      {/* Dropdown Field */}
      <TouchableOpacity
        onPress={openDropdown}
        ref={buttonRef}
        style={[styles.mainView, style]}>
        {selectedOption?.icon && (
          <Image source={selectedOption.icon} style={styles.optionIcon} />
        )}
        <Image
          style={[
            styles.caretIcon,
            {transform: [{rotate: isVisible ? '180deg' : '0deg'}]},
          ]}
          source={require('../../../assets/ui/icCaretDown.png')}
        />
      </TouchableOpacity>

      {/* Dropdown Options */}
      <Modal
        backdropOpacity={0}
        style={{margin: 0, paddingHorizontal: 16}}
        isVisible={isVisible}
        animationIn="fadeInDownBig"
        animationOut="fadeOutUpBig">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlay}
          onPress={() => setTimeout(() => setIsVisible(false), 100)}>
          <View style={[styles.dropdownContainer, {top: dropdownTop}]}>
            <FlatList
              data={data}
              keyExtractor={item => item.value}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === selectedOption.value && styles.activeOption,
                  ]}
                  onPress={() => handleSelect(item)}>
                  {item.icon && (
                    <Image source={item.icon} style={styles.optionIcon} />
                  )}
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.optionGap} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export {Dropdown};

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: Globals.COLORS.WHITE,
    borderWidth: 1.5,
    borderColor: Globals.COLORS.BORDER_DROPDOWN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  caretIcon: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
  },
  overlay: {
    flex: 1,
  },
  dropdownContainer: {
    backgroundColor: Globals.COLORS.WHITE,
    borderWidth: 1,
    borderColor: Globals.COLORS.BORDER_DROPDOWN,
    padding: 8,
    borderRadius: 12,
    maxHeight: 350,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 8,
  },
  activeOption: {
    backgroundColor: Globals.COLORS.PILL_BG_DEFAULT,
  },
  optionGap: {
    height: 12,
  },
  optionIcon: {
    height: 24,
    width: 24,
    resizeMode: 'contain',
  },
  optionText: {
    marginLeft: 4,
  },
});
