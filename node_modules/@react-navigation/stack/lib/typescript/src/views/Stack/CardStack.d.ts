import type { ParamListBase, Route, StackNavigationState } from '@react-navigation/native';
import * as React from 'react';
import { Animated } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import type { Layout, Scene, StackDescriptorMap } from '../../types';
import type { Props as HeaderContainerProps } from '../Header/HeaderContainer';
declare type GestureValues = {
    [key: string]: Animated.Value;
};
declare type Props = {
    insets: EdgeInsets;
    state: StackNavigationState<ParamListBase>;
    descriptors: StackDescriptorMap;
    routes: Route<string>[];
    openingRouteKeys: string[];
    closingRouteKeys: string[];
    onOpenRoute: (props: {
        route: Route<string>;
    }) => void;
    onCloseRoute: (props: {
        route: Route<string>;
    }) => void;
    getPreviousRoute: (props: {
        route: Route<string>;
    }) => Route<string> | undefined;
    renderHeader: (props: HeaderContainerProps) => React.ReactNode;
    renderScene: (props: {
        route: Route<string>;
    }) => React.ReactNode;
    isParentHeaderShown: boolean;
    isParentModal: boolean;
    onTransitionStart: (props: {
        route: Route<string>;
    }, closing: boolean) => void;
    onTransitionEnd: (props: {
        route: Route<string>;
    }, closing: boolean) => void;
    onGestureStart: (props: {
        route: Route<string>;
    }) => void;
    onGestureEnd: (props: {
        route: Route<string>;
    }) => void;
    onGestureCancel: (props: {
        route: Route<string>;
    }) => void;
    detachInactiveScreens?: boolean;
};
declare type State = {
    routes: Route<string>[];
    descriptors: StackDescriptorMap;
    scenes: Scene[];
    gestures: GestureValues;
    layout: Layout;
    headerHeights: Record<string, number>;
};
export default class CardStack extends React.Component<Props, State> {
    static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null;
    constructor(props: Props);
    private handleLayout;
    private handleHeaderLayout;
    private getFocusedRoute;
    private getPreviousScene;
    render(): JSX.Element;
}
export {};
