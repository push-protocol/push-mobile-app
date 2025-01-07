import React, {FC, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import Globals from 'src/Globals';
import {useChannelCategories} from 'src/hooks/channel/useChannelCategories';

import {Pill} from '../pill';

type ChannelCategoriesProps = {
  onChangeCategory: (category: string) => void;
  value: string;
};

const ChannelCategories: FC<ChannelCategoriesProps> = ({
  onChangeCategory,
  value,
}) => {
  const {isLoading, channelCategories} = useChannelCategories();

  if (!isLoading && channelCategories?.length > 0) {
    return (
      <View style={styles.mainView}>
        <ScrollView showsHorizontalScrollIndicator={false} horizontal>
          {channelCategories.map((item, index) => (
            <Pill
              key={`${index}_pill_keys`}
              value={value}
              data={item}
              onChange={category => {
                onChangeCategory(category.value as string);
              }}
            />
          ))}
        </ScrollView>
      </View>
    );
  }
  return null;
};

export {ChannelCategories};

const styles = StyleSheet.create({
  mainView: {
    height: 40,
    width: '100%',
    flexDirection: 'row',
    marginBottom: 16,
  },
});
