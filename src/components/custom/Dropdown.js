import React, { useRef, useState } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  View,
} from 'react-native'
import { Entypo, MaterialIcons } from '@expo/vector-icons'
import GLOBALS from 'src/Globals'
import { useDispatch } from 'react-redux'
import { deleteUser } from 'src/redux/authSlice'

import LinearGradient from 'react-native-linear-gradient'
import MaskedView from '@react-native-community/masked-view'

const size = 30

const Dropdown = ({ label, data }) => {
  const dispatch = useDispatch()
  const DropdownButton = useRef()
  const [visible, setVisible] = useState(false)
  const [dropdownTop, setDropdownTop] = useState(0)

  const toggleDropdown = () => {
    visible ? setVisible(false) : openDropdown()
  }

  const openDropdown = () => {
    DropdownButton.current.measure((_fx, _fy, _w, h, _px, py) => {
      setDropdownTop(py + h)
    })
    setVisible(true)
  }

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => dispatch(deleteUser(item.index))}
      >
        <Text style={styles.itemText}>{item.wallet}</Text>
      </TouchableOpacity>
    )
  }

  const renderDropdown = () => {
    return (
      <Modal visible={visible} transparent animationType="none">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <View style={[styles.dropdown, { top: dropdownTop }]}>
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }

  return (
    <TouchableOpacity
      ref={DropdownButton}
      style={styles.button}
      onPress={toggleDropdown}
    >
      {renderDropdown()}
      <View style={{ width: size }}>
        <MaskedView
          style={{ flex: 1, flexDirection: 'row', height: size }}
          maskElement={
            <View
              style={{
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <MaterialIcons
                name="logout"
                size={24}
                color="black"
                style={styles.icon}
              />
            </View>
          }
        >
          <LinearGradient
            colors={[
              GLOBALS.COLORS.GRADIENT_PRIMARY,
              GLOBALS.COLORS.GRADIENT_SECONDARY,
            ]}
            style={{ flex: 1 }}
          />
        </MaskedView>
      </View>

      <Text style={styles.buttonText}>{label}</Text>

      <View style={{ width: size }}>
        <MaskedView
          style={{ flex: 1, flexDirection: 'row', height: size }}
          maskElement={
            <View
              style={{
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Entypo
                name="chevron-down"
                size={24}
                color="black"
                style={styles.icon}
              />
            </View>
          }
        >
          <LinearGradient
            colors={[
              GLOBALS.COLORS.GRADIENT_PRIMARY,
              GLOBALS.COLORS.GRADIENT_SECONDARY,
            ]}
            style={{ flex: 1 }}
          />
        </MaskedView>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    height: 50,
    zIndex: 1,
    padding: 10,
    paddingLeft: 15,
    display: 'flex',
    justifyContent: 'space-between',
  },
  buttonText: {
    flex: 1,
    marginTop: 3,
    margin: 10,
    fontSize: 14,
    fontWeight: '400',
    fontWeight: '200',
  },
  icon: {
    marginRight: 7,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: '100%',
    shadowColor: '#000000',
    shadowRadius: 4,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.5,
  },
  overlay: {
    width: '100%',
    height: '100%',
  },
  item: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  itemText: {
    flex: 1,
    padding: 10,
    textAlign: 'left',
    fontSize: 12,
    color: GLOBALS.COLORS.GRADIENT_PRIMARY,
  },
  shadow: {
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },
})

export default Dropdown
