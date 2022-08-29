/// <reference types="react" />
import { DefaultNavigatorOptions, ParamListBase, StackNavigationState, StackRouterOptions } from '@react-navigation/native';
import type { StackNavigationConfig, StackNavigationEventMap, StackNavigationOptions } from '../types';
declare type Props = DefaultNavigatorOptions<ParamListBase, StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap> & StackRouterOptions & StackNavigationConfig;
declare function StackNavigator({ id, initialRouteName, children, screenListeners, screenOptions, ...rest }: Props): JSX.Element;
declare const _default: <ParamList extends ParamListBase>() => import("@react-navigation/native").TypedNavigator<ParamList, StackNavigationState<ParamListBase>, StackNavigationOptions, StackNavigationEventMap, typeof StackNavigator>;
export default _default;
