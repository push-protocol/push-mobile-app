import React from 'react';
import {Image, Linking, StyleSheet, Text, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import SvgUri from 'react-native-svg-uri';
import Globals from 'src/Globals';

import {ChatMessage} from '../helpers/chatResolver';

type MessageComponentType = 'SENDER' | 'RECEIVER';

type MessageComponentProps = {
  chatMessage: ChatMessage;
  componentType: MessageComponentType;
};

export interface FileMessageContent {
  content: string;
  name: string;
  type: string;
  size: number;
}

export const FILE_ICON = (extension: string) =>
  `https://cdn.jsdelivr.net/gh/napthedev/file-icons/file/${extension}.svg`;

export const formatFileSize = (size: number): string => {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(1)} ${
    ['B', 'KB', 'MB', 'GB', 'TB'][i]
  }`;
};

const FileMessageComponent = ({file}: {file: string}) => {
  console.log('****This was called');

  const fileContent: FileMessageContent = JSON.parse(file);
  const name = fileContent.name;
  let modifiedName: string;
  if (name.length > 11) {
    modifiedName = name.slice(0, 11) + '...';
  } else {
    modifiedName = name;
  }
  const content = fileContent.content as string;
  const size = fileContent.size;

  console.log('*********got', size, name, modifiedName);

  console.log('got url', FILE_ICON(name.split('.').slice(-1)[0]));

  return (
    <View>
      <View>
        <SvgUri
          source={{uri: FILE_ICON(name.split('.').slice(-1)[0])}}
          width="100%"
          height="40"
        />
      </View>
      <View>
        <Text>{modifiedName}</Text>
        <Text>{formatFileSize(size)}</Text>
      </View>
      <TouchableOpacity onPress={() => Linking.openURL(content)}>
        <Text>Download</Text>
      </TouchableOpacity>
    </View>
  );
};

const MessageComponent = ({
  chatMessage,
  componentType,
}: MessageComponentProps) => {
  const styles = componentType === 'SENDER' ? SenderStyle : RecipientStyle;
  const {message, messageType, time} = chatMessage;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {messageType === 'GIF' && (
          <Image
            source={{
              uri: message,
            }}
            style={{width: '100%', height: 120}}
          />
        )}
        {messageType === 'Image' && (
          <Image
            source={{
              uri: JSON.parse(message).content,
            }}
            style={{width: '100%', height: 120}}
          />
        )}
        {messageType === 'Text' && <Text style={styles.text}>{message}</Text>}
        {messageType === 'File' && <FileMessageComponent file={message} />}
      </View>

      <Text style={styles.time}>{time}</Text>
    </View>
  );
};

export default MessageComponent;

const RecipientStyle = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    maxWidth: '75%',
    marginBottom: 25,
    padding: 15,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 20,
  },
  content: {
    marginBottom: 5,
  },

  text: {
    fontSize: 14,
    color: Globals.COLORS.BLACK,
    fontWeight: '400',
  },
  time: {fontSize: 13, textAlign: 'right', color: '#6F829E'},
});

const SenderStyle = StyleSheet.create({
  container: {
    backgroundColor: Globals.COLORS.PINK,
    width: '75%',
    marginBottom: 25,
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 20,
    alignSelf: 'flex-end',
  },
  content: {
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    color: 'white',
    fontWeight: '400',
    marginBottom: 5,
  },
  time: {fontSize: 13, textAlign: 'right', color: 'white'},
});
