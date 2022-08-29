/// <reference types="react" />
import type { Layout, SceneProgress, StackHeaderOptions, StackHeaderStyleInterpolator } from '../../types';
declare type Props = Omit<StackHeaderOptions, 'headerStatusBarHeight'> & {
    headerStatusBarHeight: number;
    layout: Layout;
    title: string;
    modal: boolean;
    onGoBack?: () => void;
    progress: SceneProgress;
    styleInterpolator: StackHeaderStyleInterpolator;
};
export default function HeaderSegment(props: Props): JSX.Element;
export {};
