import * as React from 'react';
import { View } from 'react-native';
export declare const PanGestureHandler: React.ComponentType<import("react-native-gesture-handler").PanGestureHandlerProps>;
export declare const GestureHandlerRootView: typeof View;
export declare const GestureState: {
    UNDETERMINED: number;
    FAILED: number;
    BEGAN: number;
    CANCELLED: number;
    ACTIVE: number;
    END: number;
};
export type { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
