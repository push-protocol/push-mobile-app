import {FontAwesome} from '@expo/vector-icons';
import {IMessageIPFS} from '@pushprotocol/restapi';
import React from 'react';
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ActivityIndicator} from 'react-native';
import {SvgUri} from 'react-native-svg';
import {useToaster} from 'src/contexts/ToasterContext';
import {formatAMPM} from 'src/helpers/DateTimeHelper';

import {useFileDownload} from '../../helpers/useFileDownload';

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
  messageType,
}: {
  chatMessage: IMessageIPFS;
  messageType?: 'reply';
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

  const {toastRef} = useToaster();
  const [isDownloading, saveBase64File] = useFileDownload(
    content,
    name,
    toastRef,
  );

  return (
    <View
      style={
        messageType === 'reply' ? styles.replyContainer : styles.container
      }>
      <View style={{width: messageType === 'reply' ? 25 : 32}}>
        <SvgUri
          uri={FILE_ICON(name.split('.').slice(-1)[0])}
          width="100%"
          height={messageType === 'reply' ? '30' : '40'}
        />
      </View>
      <View style={styles.middleView}>
        <Text numberOfLines={1} style={styles.text}>
          {modifiedName}
        </Text>
        <Text style={[styles.text, styles.textAlignment]}>
          {formatFileSize(size)}
        </Text>
      </View>
      {!messageType &&
        (isDownloading ? (
          <ActivityIndicator color="gray" size={'small'} />
        ) : (
          <TouchableOpacity onPress={() => saveBase64File()}>
            <FontAwesome name="download" size={24} color="gray" />
          </TouchableOpacity>
        ))}

      {!messageType && (
        <Text style={styles.time}>{formatAMPM(chatMessage.timestamp!)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#343536',
    width: '100%',
    height: 90,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#343536',
    maxWidth: '100%',
    height: 60,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  middleView: {
    paddingHorizontal: 8,
  },
  text: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
  },
  textAlignment: {
    textAlign: 'center',
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
