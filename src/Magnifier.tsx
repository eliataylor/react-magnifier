import React, { PureComponent } from "react";
import debounce from "lodash.debounce";
import throttle from "lodash.throttle";
import "./style.scss";

type mgShape = "circle" | "square";

interface Props {
	// Image
	src: string;
	trigger?: HTMLElement;
	debug:boolean | number;

	width?: string | number;
	height?: string | number;
	className?: string;

	// Zoom image
	zoomImgSrc?: string;
	zoomFactor?: number;

	// Magnifying glass
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
	showZoom: boolean,

	// Magnifying glass offset
	mgOffsetX: number,
	mgOffsetY: number,

	// Mouse position relative to image
	relX: number,
	relY: number,
}

export default class Magnifier extends PureComponent<Props, State> {
	state = {
		showZoom: false,
		mgOffsetX: 0,
		mgOffsetY: 0,
		relX: 0,
		relY: 0,
	};

	img: HTMLElement = null;
	trigger: HTMLElement = null;
	imgBounds: DOMRect | ClientRect = null;

	static defaultProps = {
		// Image
		width: "100%",
		height: "auto",
		className: "",
		debug:false,
		trigger : false,

		// Zoom image
		zoomFactor: 1.5,

		// Magnifying glass
		mgWidth: 150,
		mgHeight: 150,
		mgBorderWidth: 2,
		mgShape: "circle",
		mgShowOverflow: true,
		mgMouseOffsetX: 0,
		mgMouseOffsetY: 0,
		mgTouchOffsetX: -50,
		mgTouchOffsetY: -50,
	};

	constructor(props: Props) {
		super(props);

		// Function bindings
		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onMouseMove = throttle(this.onMouseMove.bind(this), 20, { trailing: false });
		this.onMouseOut = this.onMouseOut.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchMove = throttle(this.onTouchMove.bind(this), 20, { trailing: false });
		this.onTouchEnd = this.onTouchEnd.bind(this);
		this.calcImgBounds = this.calcImgBounds.bind(this);
		this.calcImgBoundsDebounced = debounce(this.calcImgBounds, 200);
	}

	componentDidMount(): void {
		// Add mouse/touch event listeners to image element (assigned in render function)
		// `passive: false` prevents scrolling on touch move
		if (!this.props.trigger) {
			this.trigger = this.img;
			if (this.props.debug > 0) console.log('magnifier: Using default event trigger (img)');
		} else {
			this.trigger = this.props.trigger;
			if (this.props.debug > 0) console.log('magnifier: Using custom event trigger: ', this.trigger);
		}
		this.trigger.addEventListener("mouseenter", this.onMouseEnter, { passive: false });
		this.trigger.addEventListener("mousemove", this.onMouseMove, { passive: false });
		this.trigger.addEventListener("mouseout", this.onMouseOut, { passive: false });
		this.trigger.addEventListener("touchstart", this.onTouchStart, { passive: false });
		this.trigger.addEventListener("touchmove", this.onTouchMove, { passive: false });
		this.trigger.addEventListener("touchend", this.onTouchEnd, { passive: false });

		// Re-calculate image bounds on window resize
		window.addEventListener("resize", this.calcImgBoundsDebounced);
		// Re-calculate image bounds on scroll (useCapture: catch scroll events in entire DOM)
		window.addEventListener("scroll", this.calcImgBoundsDebounced, true);
	}

	componentWillUnmount(): void {
		// Remove all event listeners
		this.trigger.removeEventListener("mouseenter", this.onMouseEnter);
		this.trigger.removeEventListener("mousemove", this.onMouseMove);
		this.trigger.removeEventListener("mouseout", this.onMouseOut);
		this.trigger.removeEventListener("touchstart", this.onTouchStart);
		this.trigger.removeEventListener("touchmove", this.onTouchMove);
		this.trigger.removeEventListener("touchend", this.onTouchEnd);
		window.removeEventListener("resize", this.calcImgBoundsDebounced);
		window.removeEventListener("scroll", this.calcImgBoundsDebounced, true);
	}

	onMouseEnter(e: MouseEvent): void {
		if (this.props.debug > 0) console.log('magnifier: onMouseEnter');
		this.calcImgBounds();
		this.imgHitTest(e);
	}
	onTouchStart(e: TouchEvent): void {
		e.preventDefault(); // Prevent mouse event from being fired
		if (this.props.debug > 0) console.log('magnifier: onTouchStart');
		this.calcImgBounds();
	}

	onMouseOut(e: MouseEvent): void {
		this.imgHitTest(e);
		if (this.props.debug > 0) console.log('magnifier: onMouseOut');
	}
	onTouchEnd(e: TouchEvent): void {
		if (this.props.debug > 0) console.log('magnifier: onTouchEnd');
		this.imgHitTest(e);
	}


	onMouseMove(e: MouseEvent): void {
		this.imgHitTest(e);
	}
	onTouchMove(e: TouchEvent): void {
		e.preventDefault(); // Disable scroll on touch
		this.imgHitTest(e);
	}

	calcImgBounds(): void {
		if (this.img) {
			this.imgBounds = this.img.getBoundingClientRect(); // WARN: is this polyfilled?
		}
	}

	imgHitTest(e: MouseEvent | TouchEvent): void {

		if (this.imgBounds) {
			const { mgMouseOffsetX, mgMouseOffsetY } = this.props;
			//const target = e.target as HTMLElement;
			const target = this.img;
			let relY, relX;
			if (e instanceof TouchEvent) {
				relX = (e.targetTouches[0].clientX - this.imgBounds.left) / target.clientWidth;
				relY = (e.targetTouches[0].clientY - this.imgBounds.top) / target.clientHeight;
			} else {
				relX = (e.clientX - this.imgBounds.left) / target.clientWidth;
				relY = (e.clientY - this.imgBounds.top) / target.clientHeight;
			}

			if (relX >= 0 && relY >= 0 && relX <= 1 && relY <= 1) {
				const s = {
					mgOffsetX: mgMouseOffsetX,
					mgOffsetY: mgMouseOffsetY,
					relX,
					relY,
					showZoom: true,
				};
				this.setState(s);
				if (this.props.debug > 1) console.log('magnifier: hit! relX ' + relX + ', relY ' + relY, e, this.imgBounds);
			} else {
				this.setState({
					showZoom: false,
				});
				if (this.props.debug > 2) console.log('magnifier: out of bounds relX ' + relX + ', relY ' + relY, e, this.imgBounds);
			}
		} else if (this.props.debug > 0) {
			console.log('magnifier: imgBounds undefined?');
		}

	}

	calcImgBoundsDebounced: () => void;

	render(): React.ReactElement {
		/* eslint-disable @typescript-eslint/no-unused-vars */
		const {
			src,
			width,
			height,
			className,
			zoomImgSrc,
			zoomFactor,
			mgHeight,
			mgWidth,
			mgBorderWidth,
			mgMouseOffsetX,
			mgMouseOffsetY,
			mgTouchOffsetX,
			mgTouchOffsetY,
			mgShape,
			mgShowOverflow,
			...otherProps
		} = this.props;
		/* eslint-enable @typescript-eslint/no-unused-vars */
		const { mgOffsetX, mgOffsetY, relX, relY, showZoom } = this.state;

		// Show/hide magnifying glass (opacity needed for transition)
		let mgClasses = "magnifying-glass";
		if (showZoom) {
			mgClasses += " visible";
		}
		if (mgShape === "circle") {
			mgClasses += " circle";
		}

		return (
			<div
				className={`magnifier ${className}`}
				style={{
					width,
					height,
					overflow: mgShowOverflow ? "visible" : "hidden",
				}}
			>
				<img // eslint-disable-line jsx-a11y/alt-text
					className="magnifier-image"
					src={src}
					width="100%"
					height="100%"
					{...otherProps}
					onLoad={() => {
						this.calcImgBounds();
					}}
					ref={e => {
						this.img = e;
					}}
				/>
				{this.imgBounds && (
					<div
						className={mgClasses}
						style={{
							width: mgWidth,
							height: mgHeight,
							left: `calc(${relX * 100}% - ${mgWidth / 2}px + ${mgOffsetX}px - ${mgBorderWidth}px)`,
							top: `calc(${relY * 100}% - ${mgHeight / 2}px + ${mgOffsetY}px - ${mgBorderWidth}px)`,
							backgroundImage: `url(${zoomImgSrc || src})`,
							backgroundPosition: `calc(${relX * 100}% + ${mgWidth / 2}px - ${relX *
								mgWidth}px) calc(${relY * 100}% + ${mgHeight / 2}px - ${relY * mgWidth}px)`,
							backgroundSize: `${zoomFactor * this.imgBounds.width}% ${zoomFactor *
								this.imgBounds.height}%`,
							borderWidth: mgBorderWidth,
						}}
					/>
				)}
			</div>
		);
	}
}
