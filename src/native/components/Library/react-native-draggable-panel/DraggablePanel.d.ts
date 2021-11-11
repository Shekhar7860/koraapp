import * as React from 'react';
import { ReactNode } from 'react';
export declare type ReactNativeDraggablePanelRef = {
    show: () => void;
    hide: () => void;
};
declare type Props = {
    children: ReactNode;
    visible?: boolean;
    animationDuration?: number;
    expandable?: boolean;
    hideable?: boolean;
    hideOnPressOutside?: boolean;
    overlayBackgroundColor?: string;
    overlayOpacity?: number;
    borderRadius?: number;
    initialHeight?: number;
    hideOnBackButtonPressed?: boolean;
    onDismiss?: () => void;
};
export declare const DraggablePanel: React.ForwardRefExoticComponent<Props & React.RefAttributes<ReactNativeDraggablePanelRef>>;
export {};
