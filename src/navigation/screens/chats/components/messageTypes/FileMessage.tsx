import {FontAwesome} from '@expo/vector-icons';
import {IMessageIPFS} from '@pushprotocol/restapi';
import React from 'react';
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SvgUri} from 'react-native-svg';
import {formatAMPM} from 'src/helpers/DateTimeHelper';

export interface FileMessageContent {
  content: string;
  name: string;
  type: string;
  size: number;
}

const FILE_ICON = (extension: string) =>
  `https://cdn.jsdelivr.net/gh/napthedev/file-icons/file/${extension}.svg`;

const formatFileSize = (size: number): string => {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(1)} ${
    ['B', 'KB', 'MB', 'GB', 'TB'][i]
  }`;
};

export const FileMessageComponent = ({
  chatMessage,
}: {
  chatMessage: IMessageIPFS;
}) => {
  const fileContent: FileMessageContent = JSON.parse(
    chatMessage.messageContent,
  );
  const name = fileContent.name;
  let modifiedName: string;
  if (name.length > 11) {
    modifiedName = name.slice(0, 11) + '...';
  } else {
    modifiedName = name;
  }
  const content = fileContent.content as string;
  const size = fileContent.size;

  return (
    <View style={styles.container}>
      <View style={{width: 32}}>
        <SvgUri
          uri={FILE_ICON(name.split('.').slice(-1)[0])}
          width="100%"
          height="40"
        />
      </View>
      <Text style={styles.text}>{modifiedName}</Text>
      <Text style={styles.text}>{formatFileSize(size)}</Text>
      <TouchableOpacity
        onPress={() =>
          Linking.openURL(content).catch(e => {
            console.log('err', e);
          })
        }>
        <FontAwesome name="download" size={24} color="gray" />
      </TouchableOpacity>

      <Text style={styles.time}>{formatAMPM(chatMessage.timestamp!)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#343536',
    minWidth: '75%',
    maxWidth: '75%',
    height: 90,
    borderRadius: 8,
    padding: 15,
  },
  text: {
    color: 'white',
    fontWeight: '700',
  },
  time: {
    fontSize: 13,
    textAlign: 'right',
    position: 'absolute',
    right: 0,
    bottom: 4,
    backgroundColor: 'rgba(60, 60, 60, 0.65)',
    borderRadius: 8,
    paddingVertical: 1,
    paddingHorizontal: 10,
    color: 'rgba(256,256,256,0.8)',
  },
});
