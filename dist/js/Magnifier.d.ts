import React, { PureComponent } from "react";
import "./style.scss";
declare type mgShape = "circle" | "square";
interface Props {
    src: string;
    trigger?: HTMLElement;
    debug: boolean | number;
    width?: string | number;
    height?: string | number;
    className?: string;
    zoomImgSrc?: string;
    zoomFactor?: number;
    mgWidth?: number;
    mgHeight?: number;
    mgBorderWidth?: number;
    mgShape?: mgShape;
    mgShowOverflow?: boolean;
    mgMouseOffsetX?: number;
    mgMouseOffsetY?: number;
    mgTouchOffsetX?: number;
    mgTouchOffsetY?: number;
}
interface State {
    showZoom: boolean;
    mgOffsetX: number;
    mgOffsetY: number;
    relX: number;
    relY: number;
}
export default class Magnifier extends PureComponent<Props, State> {
    state: {
        showZoom: boolean;
        mgOffsetX: number;
        mgOffsetY: number;
        relX: number;
        relY: number;
    };
    img: HTMLElement;
    trigger: HTMLElement;
    imgBounds: DOMRect | ClientRect;
    static defaultProps: {
        width: string;
        height: string;
        className: string;
        debug: boolean;
        trigger: boolean;
        zoomFactor: number;
        mgWidth: number;
        mgHeight: number;
        mgBorderWidth: number;
        mgShape: string;
        mgShowOverflow: boolean;
        mgMouseOffsetX: number;
        mgMouseOffsetY: number;
        mgTouchOffsetX: number;
        mgTouchOffsetY: number;
    };
    constructor(props: Props);
    componentDidMount(): void;
    componentWillUnmount(): void;
    onMouseEnter(e: MouseEvent): void;
    onTouchStart(e: TouchEvent): void;
    onMouseOut(e: MouseEvent): void;
    onTouchEnd(e: TouchEvent): void;
    onMouseMove(e: MouseEvent): void;
    onTouchMove(e: TouchEvent): void;
    calcImgBounds(): void;
    imgHitTest(e: MouseEvent | TouchEvent): void;
    calcImgBoundsDebounced: () => void;
    render(): React.ReactElement;
}
export {};
//# sourceMappingURL=Magnifier.d.ts.map