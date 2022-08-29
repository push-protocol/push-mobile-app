/// <reference types="react" />
import type { EdgeInsets } from 'react-native-safe-area-context';
import type { Layout } from '../types';
declare type Props = {
    dark: boolean | undefined;
    layout: Layout;
    insets: EdgeInsets;
    style: any;
};
export default function ModalStatusBarManager({ dark, layout, insets, style, }: Props): JSX.Element;
export {};
