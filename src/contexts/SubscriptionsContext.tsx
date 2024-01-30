import {NotificationSettings} from '@pushprotocol/restapi';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import React, {createContext, useEffect, useState} from 'react';
import envConfig from 'src/env.config';

import {usePushApi} from './PushApiContext';

interface ISubscription {
  channel: string;
  user_settings: NotificationSettings | null;
}

type SubscriptionsMapping = {[key: string]: ISubscription | undefined};

type SubscriptionsContextType = {
  subscriptions: SubscriptionsMapping;
  refreshSubscriptions: () => Promise<void>;
  toggleSubscription: (channel: string) => Promise<void>;
  isLoading: boolean;
};

export const SubscriptionsContext = createContext<SubscriptionsContextType>({
  subscriptions: {},
  refreshSubscriptions: () => Promise.resolve(),
  toggleSubscription: () => Promise.resolve(),
  isLoading: false,
});

export const useSubscriptions = () => {
  const context = React.useContext(SubscriptionsContext);
  if (!context)
    throw new Error(
      'useSubscriptions must be used within a SubscriptionsContextProvider',
    );

  return context;
};

const SubscriptionsContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionsMapping>({});
  const {userPushSDKInstance, fakeSigner} = usePushApi();
  const wc_connector = useWalletConnectModal();

  const refreshSubscriptions = async () => {
    try {
      const response = await userPushSDKInstance?.notification.subscriptions();
      const subscriptionsMapping: SubscriptionsMapping = {};
      response.forEach((subscription: any) => {
        subscriptionsMapping[subscription.channel] = {
          channel: subscription.channel,
          user_settings: subscription.user_settings
            ? JSON.parse(subscription.user_settings)
            : null,
        };
      });
      setSubscriptions(subscriptionsMapping);
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubscription = async (channel: string) => {
    if (userPushSDKInstance?.readMode || fakeSigner) {
      await wc_connector?.open();
      return;
    }
    try {
      const subscription = subscriptions?.[channel];
      const channelCaip = `eip155:${envConfig.CHAIN_ID}:${channel}`;
      if (subscription) {
        await userPushSDKInstance?.notification.unsubscribe(channelCaip, {
          onSuccess: () => {
            setSubscriptions({
              ...subscriptions,
              [channel]: undefined,
            });
          },
        });
      } else {
        await userPushSDKInstance?.notification.subscribe(channelCaip, {
          onSuccess: () => {
            setSubscriptions({
              ...subscriptions,
              [channel]: {
                channel,
                user_settings: null,
              },
            });
          },
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (userPushSDKInstance) refreshSubscriptions();
  }, [userPushSDKInstance]);

  return (
    <SubscriptionsContext.Provider
      value={{
        subscriptions,
        refreshSubscriptions,
        toggleSubscription,
        isLoading,
      }}>
      {children}
    </SubscriptionsContext.Provider>
  );
};

export default SubscriptionsContextProvider;
