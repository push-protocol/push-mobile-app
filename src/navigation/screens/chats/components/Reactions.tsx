import React, {FC} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Globals from 'src/Globals';

import {MessageComponentType} from './MessageComponent';

type IReactions = {
  [key: string]: string[];
};

export type ReactionsProps = {
  chatReactions: any;
  componentType: MessageComponentType;
};

const Reactions: FC<ReactionsProps> = ({chatReactions, componentType}) => {
  // transform to IReactions
  const uniqueReactions = chatReactions.reduce((acc: any, reaction: any) => {
    const contentKey = (reaction as any).messageObj?.content || '';
    if (!acc[contentKey]) {
      acc[contentKey] = [];
    }

    // eliminate duplicate
    if (!acc[contentKey].includes((reaction as any).fromCAIP10)) {
      acc[contentKey].push((reaction as any).fromCAIP10);
    }

    return acc;
  }, {} as IReactions);

  // generate a unique key for the reactions
  const reactionsKey = chatReactions
    .map((reaction: any) => reaction.reference)
    .join('-');

  return (
    <View
      style={[
        styles.mainView,
        componentType === 'RECEIVER' ? styles.alignLeft : styles.alignRight,
      ]}>
      {Object.keys(uniqueReactions).length > 2 ? (
        <View key={`reactions-${reactionsKey}`} style={styles.reactionView}>
          <Text style={styles.emojiText}>
            {Object.keys(uniqueReactions).join(' ')}
          </Text>
          <Text style={styles.countText}>
            {' '}
            {String(
              Object.values(uniqueReactions).reduce(
                (total: any, reactions: any) => total + reactions.length,
                0,
              ),
            )}
          </Text>
        </View>
      ) : (
        Object.entries(uniqueReactions).map(([content, reactions]: any[]) => (
          <View
            key={`reactions-${content}-${reactionsKey}`}
            style={styles.reactionView}>
            <Text style={styles.emojiText}>{`${content} `}</Text>
            <Text style={styles.countText}>{reactions?.length}</Text>
          </View>
        ))
      )}
    </View>
  );
};

export {Reactions};

const styles = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 3,
    zIndex: 10,
    paddingHorizontal: 10,
  },
  alignLeft: {
    left: 0,
  },
  alignRight: {
    right: 0,
  },
  reactionView: {
    flexDirection: 'row',
    backgroundColor: Globals.COLORS.WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Globals.COLORS.REACTION_BORDER,
    marginLeft: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    height: 30,
  },
  emojiText: {
    fontSize: 14,
    lineHeight: 21,
  },
  countText: {
    fontSize: 14,
    color: Globals.COLORS.REACTION_TEXT,
    lineHeight: 21,
  },
});
