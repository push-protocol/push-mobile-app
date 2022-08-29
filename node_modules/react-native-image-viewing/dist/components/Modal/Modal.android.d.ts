/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
/// <reference types="react" />
import { ModalProps } from "react-native";
declare type Props = ModalProps & {
    children: JSX.Element;
};
declare const Modal: ({ visible, children, presentationStyle, onRequestClose }: Props) => JSX.Element | null;
export default Modal;
