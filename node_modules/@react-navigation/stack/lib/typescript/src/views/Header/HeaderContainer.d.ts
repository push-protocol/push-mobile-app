/// <reference types="react" />
import { Route } from '@react-navigation/native';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import type { Layout, Scene, StackHeaderMode } from '../../types';
export declare type Props = {
    mode: StackHeaderMode;
    layout: Layout;
    scenes: (Scene | undefined)[];
    getPreviousScene: (props: {
        route: Route<string>;
    }) => Scene | undefined;
    getFocusedRoute: () => Route<string>;
    onContentHeightChange?: (props: {
        route: Route<string>;
        height: number;
    }) => void;
    style?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
};
export default function HeaderContainer({ mode, scenes, layout, getPreviousScene, getFocusedRoute, onContentHeightChange, style, }: Props): JSX.Element;
