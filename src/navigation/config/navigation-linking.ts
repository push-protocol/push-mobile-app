import {LinkingOptions} from '@react-navigation/native';
import * as Linking from 'expo-linking';

export const linkingConfig: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [Linking.createURL('/'), 'https://app.push.org', 'app.push.org://'],
  subscribe(_) {},
};
