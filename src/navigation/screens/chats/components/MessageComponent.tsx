import {IMessageIPFS} from '@pushprotocol/restapi';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ProfilePicture from 'src/components/custom/ProfilePicture';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import {formatAMPM, formatDate} from 'src/helpers/DateTimeHelper';

import {getTrimmedAddress} from '../helpers/chatAddressFormatter';
import {FileMessageComponent, TextMessage} from './messageTypes';
import {ImageMessage} from './messageTypes/ImageMessage';

export type MessageComponentType = 'SENDER' | 'RECEIVER';

type MessageComponentProps = {
  chatMessage: IMessageIPFS;
  componentType: MessageComponentType;
  includeDate: boolean;
  isGroupMessage?: boolean;
};

const MessageComponent = ({
  chatMessage,
  componentType,
  includeDate,
  isGroupMessage = false,
}: MessageComponentProps) => {
  const time = formatAMPM(chatMessage.timestamp || 0);
  const date = formatDate(chatMessage.timestamp || 0);

  const styles = componentType === 'SENDER' ? SenderStyle : RecipientStyle;
  const {messageContent, messageType, fromDID} = chatMessage;

  return (
    <View style={{marginHorizontal: 22}}>
      {includeDate && (
        <View style={{paddingBottom: 18, paddingVertical: 4}}>
          <Text
            style={{
              textAlign: 'center',
              color: '#657795',
              fontSize: 12,
              fontWeight: '400',
            }}>
            {date}
          </Text>
        </View>
      )}
      <View style={styles.container}>
        {isGroupMessage && componentType === 'RECEIVER' && (
          <ProfilePicture address={caip10ToWallet(fromDID)} />
        )}

        <View style={styles.textContainer}>
          {isGroupMessage && componentType === 'RECEIVER' && (
            <Text style={MessageStyle.groupAddress}>
              {getTrimmedAddress(caip10ToWallet(fromDID))}
            </Text>
          )}
          {messageType === 'GIF' && (
            <ImageMessage imageSource={messageContent} time={time} />
          )}
          {messageType === 'Image' && (
            <ImageMessage
              imageSource={JSON.parse(messageContent).content}
              time={time}
            />
          )}
          {messageType === 'Text' && (
            <TextMessage
              chatMessage={messageContent}
              componentType={componentType}
              time={time}
            />
          )}
          {messageType === 'File' && (
            <FileMessageComponent chatMessage={chatMessage} />
          )}
        </View>
      </View>
    </View>
  );
};

export default MessageComponent;

const RecipientStyle = StyleSheet.create({
  container: {
    marginBottom: 17,
    flexDirection: 'row',
    display: 'flex',
  },
  textContainer: {
    alignSelf: 'flex-start',
  },
});

const SenderStyle = StyleSheet.create({
  container: {
    marginBottom: 17,
  },
  textContainer: {
    alignSelf: 'flex-end',
  },
});

const MessageStyle = StyleSheet.create({
  groupAddress: {
    color: '#657795',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '400',
  },
});
