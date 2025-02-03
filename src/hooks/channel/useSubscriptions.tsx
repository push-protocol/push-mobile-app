import type {UserSetting as PushUserSetting} from '@pushprotocol/restapi';
import {channels} from '@pushprotocol/restapi';
import {PushNotificationBaseClass} from '@pushprotocol/restapi/src/lib/pushNotification/pushNotificationBase';
import {ENV} from '@pushprotocol/socket/src/lib/constants';
import {useWalletConnectModal} from '@walletconnect/modal-react-native';
import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ToasterOptions} from 'src/components/indicators/Toaster';
import {UserSetting} from 'src/components/sheets/NFSettingSheet';
import {usePushApi} from 'src/contexts/PushApiContext';
import {useToaster} from 'src/contexts/ToasterContext';
import envConfig from 'src/env.config';
import {caip10ToWallet} from 'src/helpers/CAIPHelper';
import {
  SubscriptionsMapping,
  addChannelSubscription,
  removeChannelSubscription,
  selectSubscriptions,
  setLoadingSubscriptions,
  setSubscriptions,
} from 'src/redux/channelSlice';

import {usePushApiMode} from '../pushapi/usePushApiMode';
import {useSigner} from '../pushapi/useSigner';
import useModalBlur from '../ui/useModalBlur';

const useSubscriptions = () => {
  const [loaded, setLoaded] = useState(false);
  const {userPushSDKInstance} = usePushApi();
  const {isSignerEnabled} = usePushApiMode();
  const subscriptions = useSelector(selectSubscriptions);
  const dispatch = useDispatch();
  const {open} = useWalletConnectModal();
  const {toastRef} = useToaster();
  const {getPushSigner} = useSigner();

  const subscribe = async (channel: string, settings?: UserSetting[]) => {
    const channelCaip = `eip155:${envConfig.CHAIN_ID}:${channel}`;
    const pushSettings: PushUserSetting[] | undefined = settings?.map(
      setting => {
        if (setting.type === 1) return {enabled: setting.user};
        else
          return {
            enabled: setting.enabled,
            value: setting.user,
          };
      },
    );
    const isAlreadySubscribed = subscriptions?.[channel] !== undefined;
    const onSuccess = () => {
      dispatch(
        addChannelSubscription({
          channel,
          user_settings: settings ?? null,
        }),
      );
      toastRef.current?.showToast(
        isAlreadySubscribed
          ? 'Successfully updated channel preferences'
          : 'Successfully subscribed to channel',
        '',
        ToasterOptions.TYPE.GRADIENT_PRIMARY,
      );
    };
    const onError = () => {
      toastRef.current?.showToast(
        `Error subscribing to channel`,
        '',
        ToasterOptions.TYPE.ERROR,
      );
    };

    const {account, signer} = await getPushSigner();
    if (isSignerEnabled && signer && account) {
      try {
        const baseClass = new PushNotificationBaseClass(
          signer,
          envConfig.ENV as ENV,
          account,
        );
        const settings = pushSettings
          ? // @ts-ignore
            baseClass.getMinimalUserSetting(pushSettings)
          : null;
        const pgpPrivateKey = userPushSDKInstance?.decryptedPgpPvtKey;
        await channels.subscribeV2({
          channelAddress: channelCaip,
          signer: signer,
          userAddress: account,
          env: envConfig.ENV as ENV,
          settings: settings,
          onSuccess: onSuccess,
          onError: onError,
          pgpPrivateKey,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      await open();
    }
  };

  const unsubscribe = async (channel: string) => {
    const channelCaip = `eip155:${envConfig.CHAIN_ID}:${channel}`;
    const onSuccess = () => {
      dispatch(removeChannelSubscription({channel}));
      toastRef.current?.showToast(
        `Successfully unsubscribed from channel`,
        '',
        ToasterOptions.TYPE.GRADIENT_PRIMARY,
      );
    };

    const onError = () => {
      toastRef.current?.showToast(
        `Error unsubscribing from channel`,
        '',
        ToasterOptions.TYPE.ERROR,
      );
    };

    const {account, signer} = await getPushSigner();
    if (isSignerEnabled && signer && account) {
      try {
        const pgpPrivateKey = userPushSDKInstance?.decryptedPgpPvtKey;
        await channels.unsubscribeV2({
          channelAddress: channelCaip,
          signer,
          userAddress: account,
          env: envConfig.ENV as ENV,
          onSuccess: onSuccess,
          onError: onError,
          pgpPrivateKey,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      await open();
    }
  };

  const refreshSubscriptions = async (force = false) => {
    try {
      if (loaded && !force) return;
      console.log('Refreshing subscriptions');
      dispatch(setLoadingSubscriptions(true));
      const response = await userPushSDKInstance?.notification.subscriptions({
        account: caip10ToWallet(userPushSDKInstance?.account),
        limit: 100,
        page: 1,
      });
      const subscriptionsMapping: SubscriptionsMapping = {};
      response.forEach((subscription: any) => {
        subscriptionsMapping[subscription.channel] = {
          channel: subscription.channel,
          user_settings: subscription.user_settings
            ? JSON.parse(subscription.user_settings)
            : null,
        };
      });
      dispatch(setSubscriptions(subscriptionsMapping));
      setLoaded(true);
    } catch (e) {
    } finally {
      dispatch(setLoadingSubscriptions(false));
    }
  };

  return {subscribe, unsubscribe, subscriptions, refreshSubscriptions};
};

export default useSubscriptions;
