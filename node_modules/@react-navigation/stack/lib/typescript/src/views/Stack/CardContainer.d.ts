import { Route } from '@react-navigation/native';
import * as React from 'react';
import { Animated } from 'react-native';
import type { Layout, Scene } from '../../types';
import type { Props as HeaderContainerProps } from '../Header/HeaderContainer';
declare type Props = {
    interpolationIndex: number;
    index: number;
    active: boolean;
    focused: boolean;
    closing: boolean;
    modal: boolean;
    layout: Layout;
    gesture: Animated.Value;
    scene: Scene;
    headerDarkContent: boolean | undefined;
    safeAreaInsetTop: number;
    safeAreaInsetRight: number;
    safeAreaInsetBottom: number;
    safeAreaInsetLeft: number;
    getPreviousScene: (props: {
        route: Route<string>;
    }) => Scene | undefined;
    getFocusedRoute: () => Route<string>;
    renderHeader: (props: HeaderContainerProps) => React.ReactNode;
    renderScene: (props: {
        route: Route<string>;
    }) => React.ReactNode;
    onOpenRoute: (props: {
        route: Route<string>;
    }) => void;
    onCloseRoute: (props: {
        route: Route<string>;
    }) => void;
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
    hasAbsoluteFloatHeader: boolean;
    headerHeight: number;
    onHeaderHeightChange: (props: {
        route: Route<string>;
        height: number;
    }) => void;
    isParentHeaderShown: boolean;
    isNextScreenTransparent: boolean;
    detachCurrentScreen: boolean;
};
declare function CardContainer({ interpolationIndex, index, active, closing, gesture, focused, modal, getPreviousScene, getFocusedRoute, headerDarkContent, hasAbsoluteFloatHeader, headerHeight, onHeaderHeightChange, isParentHeaderShown, isNextScreenTransparent, detachCurrentScreen, layout, onCloseRoute, onOpenRoute, onGestureCancel, onGestureEnd, onGestureStart, onTransitionEnd, onTransitionStart, renderHeader, renderScene, safeAreaInsetBottom, safeAreaInsetLeft, safeAreaInsetRight, safeAreaInsetTop, scene, }: Props): JSX.Element;
declare const _default: React.MemoExoticComponent<typeof CardContainer>;
export default _default;
