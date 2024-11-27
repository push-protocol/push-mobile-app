// RootNavigation.js
import {
  NavigationContainerRef,
  ParamListBase,
  createNavigationContainerRef,
} from '@react-navigation/native';

export const navigationRef =
  createNavigationContainerRef<NavigationContainerRef<ParamListBase>>();

export function navigate(name: any, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

// add other navigation functions that you need and export them

export const getCurrentRouteName = () => {
  return navigationRef?.current?.getCurrentRoute()?.name;
};
