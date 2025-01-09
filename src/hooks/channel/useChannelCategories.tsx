import {useEffect, useState} from 'react';
import Globals from 'src/Globals';
import {PillData} from 'src/components/pill';
import envConfig from 'src/env.config';

type ChannelCategoriesReturnType = {
  isLoading: boolean;
  channelCategories: PillData[];
};

const useChannelCategories = (): ChannelCategoriesReturnType => {
  const [channelCategories, setChannelCategories] = useState<PillData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    getChannelCategories();
  }, []);

  const getChannelCategories = async () => {
    setIsLoading(true);
    try {
      const requestURL =
        envConfig.EPNS_SERVER + envConfig.ENDPOINT_FETCH_CHANNEL_CATEGORIES;
      const resJson = await fetch(requestURL).then(response => response.json());
      //   Modify data for pill component
      const modifiedData = resJson?.tags?.tags.map((category: string) => ({
        label: category,
        value: category,
      }));
      setChannelCategories([
        {
          label: Globals.CONSTANTS.ALL_CATEGORIES,
          value: Globals.CONSTANTS.ALL_CATEGORIES,
        },
        ...modifiedData,
      ]);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  return {isLoading, channelCategories};
};

export {useChannelCategories};
