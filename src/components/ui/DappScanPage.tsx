import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const DappScanPage = () => {
  return (
    <View style={styles.container}>
      <Image source={require('assets/ui/push.png')} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.textHeader}>To use Push Chat on mobile</Text>
        <View style={{marginTop: 10, paddingHorizontal: 4}}>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <Text style={styles.lowerTextContainer}>1.</Text>
            <Text style={styles.lowerTextContainer}>
              Go to app.push.org in your computer
            </Text>
          </View>
          <View
            style={{marginVertical: 4, display: 'flex', flexDirection: 'row'}}>
            <Text style={styles.lowerTextContainer}>2.</Text>
            <Text style={styles.lowerTextContainer}>
              Open Push Chat and click on ⋮ next to your user profile
            </Text>
          </View>

          <View style={{display: 'flex', flexDirection: 'row'}}>
            <Text style={styles.lowerTextContainer}>3.</Text>
            <Text style={styles.lowerTextContainer}>
              Click on Link Mobile App and scan the code
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={{width: '100%', alignItems: 'center'}}>
        <Text
          style={styles.button}
          onPress={() => {
            console.log('add');
          }}>
          Link Push chat
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingVertical: 48,
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'flex-start',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 21,
    paddingVertical: 17,
  },
  textHeader: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
  },
  lowerTextContainer: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 24,
  },
  image: {
    backgroundColor: 'gray',
    width: 250,
    height: 250,
    aspectRatio: 1,
    padding: 20,
  },
  button: {
    marginTop: 18,
    backgroundColor: '#CF1C84',
    color: 'white',
    width: '80%',
    borderRadius: 15,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 16,
  },
});

export {DappScanPage};
