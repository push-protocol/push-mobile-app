import React, {FC} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Globals from 'src/Globals';

import {MessageComponentType} from './MessageComponent';

export type ReactionItemType = {
  id: number | string;
  reaction: string;
};

type ReactionPickerProps = {
  onChangeValue: (reaction: ReactionItemType) => void;
  reactions?: ReactionItemType[];
  isVisible: boolean;
  componentType: MessageComponentType;
};

const defaultReactions = [
  {id: 1, reaction: '👍'},
  {id: 2, reaction: '❤️'},
  {id: 3, reaction: '🔥'},
  {id: 4, reaction: '😲'},
  {id: 5, reaction: '😂'},
  {id: 6, reaction: '😢'},
];

const ReactionPicker: FC<ReactionPickerProps> = ({
  onChangeValue,
  reactions = defaultReactions,
  isVisible,
  componentType,
}) => {
  const styles = reactionPickerStyles(componentType);
  if (isVisible) {
    return (
      <View style={styles.mainView}>
        {reactions?.map(item => (
          <Pressable
            style={styles.emojiWrapper}
            key={`chat_reaction_${item.id}`}
            onPress={() => onChangeValue(item)}>
            <Text style={styles.emojiText}>{item?.reaction}</Text>
          </Pressable>
        ))}
      </View>
    );
  }
  return null;
};

export {ReactionPicker};

const reactionPickerStyles = (componentType: MessageComponentType) =>
  StyleSheet.create({
    mainView: {
      flexDirection: 'row',
      borderRadius: 12,
      backgroundColor: Globals.COLORS.WHITE,
      padding: 8,
      position: 'absolute',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
      zIndex: 1000,
      top: -55,
      left: componentType === 'RECEIVER' ? 0 : 'auto',
      right: componentType === 'SENDER' ? 0 : 'auto',
    },
    emojiWrapper: {
      paddingHorizontal: 3,
    },
    emojiText: {fontSize: 24},
  });
