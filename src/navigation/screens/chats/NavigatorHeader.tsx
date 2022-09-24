import {Entypo} from '@expo/vector-icons';
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import Globals from 'src/Globals';

const Header = () => {
  return (
    <View style={styles.header}>
      <View style={styles.info}>
        <Image style={styles.image} source={require('assets/ui/bell.png')} />
        <Text style={styles.headerText}>Chat</Text>
      </View>

      <View>
        <Entypo name="menu" size={28} color="black" style={styles.menuIcon} />
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    display: 'flex',
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderBottomColor: Globals.COLORS.LIGHT_GRAY,
    borderBottomWidth: 0.5,
    paddingBottom: 20,
    shadowColor: '#470000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    elevation: 1,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  headerText: {
    fontSize: 20,
    color: Globals.COLORS.DARKER_GRAY,
  },
  image: {
    height: 30,
    width: 30,
    marginRight: 10,
  },
  menuIcon: {
    marginTop: 10,
  },
});
