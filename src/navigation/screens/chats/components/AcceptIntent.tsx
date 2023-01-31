import {AntDesign} from '@expo/vector-icons';
import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

interface Props {
  onAccept: () => void;
  onDecline: () => void;
  isAccepting: boolean;
}

const AcceptIntent = (props: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.textView}>
        <Text>Please accept to enable push chat from this wallet</Text>
      </View>

      <View style={styles.buttons}>
        {/* <AntDesign
          name="closecircleo"
          size={24}
          color="#657795"
          style={styles.closeButton}
          onPress={props.onDecline}
        /> */}
        {props.isAccepting ? (
          <View>
            <Image
              source={require('assets/chat/loading.gif')}
              style={{width: 35, height: 35}}
            />
          </View>
        ) : (
          <AntDesign
            name="checkcircle"
            size={38}
            color="#30CC8B"
            style={styles.acceptButton}
            onPress={props.onAccept}
          />
        )}
      </View>
    </View>
  );
};

export default AcceptIntent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    maxWidth: '85%',
    width: '85%',
    marginBottom: 25,
    padding: 15,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 20,
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    display: 'flex',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  closeButton: {
    marginRight: 10,
  },
  acceptButton: {
    borderBottomColor: 'pink',
  },
  textView: {
    width: '70%',
  },
});
