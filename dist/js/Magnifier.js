

function _interopDefault(ex) {
	return ex && typeof ex === "object" && "default" in ex ? ex.default : ex;
}

const React = require("react");

const React__default = _interopDefault(React);
const debounce = _interopDefault(require("lodash.debounce"));
const throttle = _interopDefault(require("lodash.throttle"));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
	extendStatics =
		Object.setPrototypeOf ||
		({ __proto__: [] } instanceof Array &&
			function(d, b) {
				d.__proto__ = b;
			}) ||
		function(d, b) {
			for (const p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
		};
	return extendStatics(d, b);
};

function __extends(d, b) {
	extendStatics(d, b);
	function __() {
		this.constructor = d;
	}
	d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
}

var __assign = function() {
	__assign =
		Object.assign ||
		function __assign(t) {
			for (var s, i = 1, n = arguments.length; i < n; i++) {
				s = arguments[i];
				for (const p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
			}
			return t;
		};
	return __assign.apply(this, arguments);
};

function __rest(s, e) {
	const t = {};
	for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
	if (s != null && typeof Object.getOwnPropertySymbols === "function")
		for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)
			if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
	return t;
}

function styleInject(css, ref) {
	if (ref === void 0) ref = {};
	const {insertAt} = ref;

	if (!css || typeof document === "undefined") {
		return;
	}

	const head = document.head || document.getElementsByTagName("head")[0];
	const style = document.createElement("style");
	style.type = "text/css";

	if (insertAt === "top") {
		if (head.firstChild) {
			head.insertBefore(style, head.firstChild);
		} else {
			head.appendChild(style);
		}
	} else {
		head.appendChild(style);
	}

	if (style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		style.appendChild(document.createTextNode(css));
	}
}

const css =
	".magnifier {\n  position: relative;\n  display: inline-block;\n  line-height: 0; }\n\n.magnifier-image {\n  cursor: none; }\n\n.magnifying-glass {\n  position: absolute;\n  z-index: 1;\n  background: #e5e5e5 no-repeat;\n  border: solid #ebebeb;\n  box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.3);\n  opacity: 0;\n  transition: opacity 0.3s;\n  pointer-events: none; }\n  .magnifying-glass.circle {\n    border-radius: 50%; }\n  .magnifying-glass.visible {\n    opacity: 1; }\n";
styleInject(css);

const Magnifier = (function(_super) {
	__extends(Magnifier, _super);
	function Magnifier(props) {
		const _this = _super.call(this, props) || this;
		_this.state = {
			showZoom: false,
			mgOffsetX: 0,
			mgOffsetY: 0,
			relX: 0,
			relY: 0,
		};
		_this.img = null;
		_this.trigger = null;
		_this.imgBounds = null;
		_this.onMouseEnter = _this.onMouseEnter.bind(_this);
		_this.onMouseMove = throttle(_this.onMouseMove.bind(_this), 20, { trailing: false });
		_this.onMouseOut = _this.onMouseOut.bind(_this);
		_this.onTouchStart = _this.onTouchStart.bind(_this);
		_this.onTouchMove = throttle(_this.onTouchMove.bind(_this), 20, { trailing: false });
		_this.onTouchEnd = _this.onTouchEnd.bind(_this);
		_this.calcImgBounds = _this.calcImgBounds.bind(_this);
		_this.calcImgBoundsDebounced = debounce(_this.calcImgBounds, 200);
		return _this;
	}
	Magnifier.prototype.componentDidMount = function() {
		if (!this.props.trigger) {
			this.trigger = this.img;
			if (this.props.debug > -1) console.log("magnifier: Using default event trigger (img)");
		} else {
			this.trigger = this.props.trigger;
			if (this.props.debug > -1)
				console.log("magnifier: Using custom event trigger: ", this.trigger);
		}
		this.trigger.addEventListener("mouseenter", this.onMouseEnter, { passive: false });
		this.trigger.addEventListener("mousemove", this.onMouseMove, { passive: false });
		this.trigger.addEventListener("mouseout", this.onMouseOut, { passive: false });
		this.trigger.addEventListener("touchstart", this.onTouchStart, { passive: false });
		this.trigger.addEventListener("touchmove", this.onTouchMove, { passive: false });
		this.trigger.addEventListener("touchend", this.onTouchEnd, { passive: false });
		window.addEventListener("resize", this.calcImgBoundsDebounced);
		window.addEventListener("scroll", this.calcImgBoundsDebounced, true);
	};
	Magnifier.prototype.componentWillUnmount = function() {
		this.trigger.removeEventListener("mouseenter", this.onMouseEnter);
		this.trigger.removeEventListener("mousemove", this.onMouseMove);
		this.trigger.removeEventListener("mouseout", this.onMouseOut);
		this.trigger.removeEventListener("touchstart", this.onTouchStart);
		this.trigger.removeEventListener("touchmove", this.onTouchMove);
		this.trigger.removeEventListener("touchend", this.onTouchEnd);
		window.removeEventListener("resize", this.calcImgBoundsDebounced);
		window.removeEventListener("scroll", this.calcImgBoundsDebounced, true);
	};
	Magnifier.prototype.onMouseEnter = function() {
		if (this.props.debug > -1) console.log("magnifier: onMouseEnter");
		this.calcImgBounds();
	};
	Magnifier.prototype.onMouseMove = function(e) {
		const _a = this.props;
			const {mgMouseOffsetX} = _a;
			const {mgMouseOffsetY} = _a;
		if (this.imgBounds) {
			const {target} = e;
			const relX = (e.clientX - this.imgBounds.left) / target.clientWidth;
			const relY = (e.clientY - this.imgBounds.top) / target.clientHeight;
			const s = {
				mgOffsetX: mgMouseOffsetX,
				mgOffsetY: mgMouseOffsetY,
				relX,
				relY,
				showZoom: true,
			};
			this.setState(s);
			if (this.props.debug > 1) {
				console.log(s);
			}
		} else if (this.props.debug > 2) {
			console.log("out of bounds", e);
		}
	};
	Magnifier.prototype.onMouseOut = function() {
		this.setState({
			showZoom: false,
		});
		if (this.props.debug > -1) console.log("magnifier: onMouseOut");
	};
	Magnifier.prototype.onTouchStart = function(e) {
		e.preventDefault();
		if (this.props.debug > -1) console.log("magnifier: onTouchStart");
		this.calcImgBounds();
	};
	Magnifier.prototype.onTouchMove = function(e) {
		e.preventDefault();
		if (this.imgBounds) {
			const {target} = e;
			const _a = this.props;
				const {mgTouchOffsetX} = _a;
				const {mgTouchOffsetY} = _a;
			const relX = (e.targetTouches[0].clientX - this.imgBounds.left) / target.clientWidth;
			const relY = (e.targetTouches[0].clientY - this.imgBounds.top) / target.clientHeight;
			if (relX >= 0 && relY >= 0 && relX <= 1 && relY <= 1) {
				this.setState({
					mgOffsetX: mgTouchOffsetX,
					mgOffsetY: mgTouchOffsetY,
					relX,
					relY,
					showZoom: true,
				});
			} else {
				this.setState({
					showZoom: false,
				});
			}
		} else if (this.props.debug > 2) {
			console.log("out of bounds", e);
		}
	};
	Magnifier.prototype.onTouchEnd = function() {
		if (this.props.debug > -1) console.log("magnifier: onTouchEnd");
		this.setState({
			showZoom: false,
		});
	};
	Magnifier.prototype.calcImgBounds = function() {
		if (this.img) {
			this.imgBounds = this.img.getBoundingClientRect();
		}
	};
	Magnifier.prototype.render = function() {
		const _this = this;
		const _a = this.props;
			const {src} = _a;
			const {width} = _a;
			const {height} = _a;
			const {className} = _a;
			const {zoomImgSrc} = _a;
			const {zoomFactor} = _a;
			const {mgHeight} = _a;
			const {mgWidth} = _a;
			const {mgBorderWidth} = _a;
			const {mgMouseOffsetX} = _a;
			const {mgMouseOffsetY} = _a;
			const {mgTouchOffsetX} = _a;
			const {mgTouchOffsetY} = _a;
			const {mgShape} = _a;
			const {mgShowOverflow} = _a;
			const otherProps = __rest(_a, [
				"src",
				"width",
				"height",
				"className",
				"zoomImgSrc",
				"zoomFactor",
				"mgHeight",
				"mgWidth",
				"mgBorderWidth",
				"mgMouseOffsetX",
				"mgMouseOffsetY",
				"mgTouchOffsetX",
				"mgTouchOffsetY",
				"mgShape",
				"mgShowOverflow",
			]);
		const _b = this.state;
			const {mgOffsetX} = _b;
			const {mgOffsetY} = _b;
			const {relX} = _b;
			const {relY} = _b;
			const {showZoom} = _b;
		let mgClasses = "magnifying-glass";
		if (showZoom) {
			mgClasses += " visible";
		}
		if (mgShape === "circle") {
			mgClasses += " circle";
		}
		return React__default.createElement(
			"div",
			{
				className: `magnifier ${  className}`,
				style: {
					width,
					height,
					overflow: mgShowOverflow ? "visible" : "hidden",
				},
			},
			React__default.createElement(
				"img",
				__assign(
					{ className: "magnifier-image", src, width: "100%", height: "100%" },
					otherProps,
					{
						onLoad() {
							_this.calcImgBounds();
						},
						ref(e) {
							_this.img = e;
						},
					},
				),
			),
			this.imgBounds &&
				React__default.createElement("div", {
					className: mgClasses,
					style: {
						width: mgWidth,
						height: mgHeight,
						left:
							`calc(${ 
							relX * 100 
							}% - ${ 
							mgWidth / 2 
							}px + ${ 
							mgOffsetX 
							}px - ${ 
							mgBorderWidth 
							}px)`,
						top:
							`calc(${ 
							relY * 100 
							}% - ${ 
							mgHeight / 2 
							}px + ${ 
							mgOffsetY 
							}px - ${ 
							mgBorderWidth 
							}px)`,
						backgroundImage: `url(${  zoomImgSrc || src  })`,
						backgroundPosition:
							`calc(${ 
							relX * 100 
							}% + ${ 
							mgWidth / 2 
							}px - ${ 
							relX * mgWidth 
							}px) calc(${ 
							relY * 100 
							}% + ${ 
							mgHeight / 2 
							}px - ${ 
							relY * mgWidth 
							}px)`,
						backgroundSize:
							`${zoomFactor * this.imgBounds.width  }% ${  zoomFactor * this.imgBounds.height  }%`,
						borderWidth: mgBorderWidth,
					},
				}),
		);
	};
	Magnifier.defaultProps = {
		width: "100%",
		height: "auto",
		className: "",
		debug: false,
		trigger: false,
		zoomFactor: 1.5,
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
	return Magnifier;
})(React.PureComponent);

module.exports = Magnifier;
