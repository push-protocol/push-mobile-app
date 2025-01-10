// RootNavigation.js
import {
  NavigationContainerRef,
  ParamListBase,
  createNavigationContainerRef,
} from '@react-navigation/native';

export const navigationRef =
  createNavigationContainerRef<NavigationContainerRef<ParamListBase>>();

/**************************************************************/
/**  This function will redirect to desired screen if exist  **/
/**************************************************************/
export function navigate(name: any, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

/***********************************************************/
/**  This function will return the name of current route  **/
/***********************************************************/
export const getCurrentRouteName = (): string | undefined => {
  return navigationRef.getCurrentRoute()?.name;
};

/*************************************************************/
/**  This function will return the params of current route  **/
/*************************************************************/
export const getCurrentRouteParams = (): any => {
  return navigationRef.getCurrentRoute()?.params;
};

/************************************************************/
/**   This function will set the params in current route   **/
/************************************************************/
export const setCurrentRouteParams = (params: any) => {
  if (navigationRef.isReady()) {
    navigationRef.setParams(params);
  }
};

/************************************************************/
/**  This function will replace the params of given route  **/
/**          Pass the route name in @param name            **/
/************************************************************/
export function replaceRoute(name: any, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.current?.dispatch({
      type: 'REPLACE',
      payload: {name, params},
    });
  }
}
