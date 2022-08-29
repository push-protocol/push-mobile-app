/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { Animated, GestureResponderHandlers } from "react-native";
import { Position } from "../@types";
declare type Props = {
    initialScale: number;
    initialTranslate: Position;
    onZoom: (isZoomed: boolean) => void;
    doubleTapToZoomEnabled: boolean;
};
declare const useZoomPanResponder: ({ initialScale, initialTranslate, onZoom, doubleTapToZoomEnabled }: Props) => readonly [GestureResponderHandlers, Animated.Value, Animated.ValueXY];
export default useZoomPanResponder;
