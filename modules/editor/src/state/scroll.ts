import { assert } from "../assert";
import { rowHeight, viewport } from "./dom";
import { stat } from "./stat";

declare global {
	interface WheelEvent {
		readonly wheelDelta: number;
		readonly wheelDeltaX: number;
		readonly wheelDeltaY: number;
	}
}

const handleMinimum = 16.5;

export const scrollBarY = assert.return(document.querySelector<HTMLElement>(".scrollbar.vertical"));
export const scrollHandleY = assert.return(scrollBarY.querySelector<HTMLElement>(".handle"));

const scrollBarX = assert.return(document.querySelector<HTMLElement>(".scrollbar.horizontal"));
const scrollHandleX = assert.return(scrollBarX.querySelector<HTMLElement>(".handle"));

export let viewportHeight = 0;
export let contentHeight = 0;
export let scrollFactorY = 0;

let scrollTop = 0;
let yHandleReal = 0;
let yHandleHeight = 0;
let scrollAnchorY = 0;

let viewportWidth = 0;
let contentWidth = 0;
let scrollFactorX = 0;
let scrollLeft = 0;
let xHandleReal = 0;
let xHandleWidth = 0;
let scrollAnchorX = 0;

function scrollX(left: number): void {
	const leftMax = viewportWidth - xHandleWidth;
	scrollLeft = Math.max(0, Math.min(left, leftMax));
	scrollFactorX = (scrollLeft + (scrollLeft / leftMax) * (xHandleWidth - xHandleReal)) / viewportWidth;
	viewport.style.transform = `translateX(-${contentWidth * scrollFactorX}px)`;
	scrollHandleX.style.left = `${scrollLeft}px`;
}

function scrollY(top: number): void {
	const topMax = viewportHeight - yHandleHeight;
	scrollTop = Math.max(0, Math.min(top, viewportHeight - yHandleHeight));
	scrollFactorY = (scrollTop + (scrollTop / topMax) * (yHandleHeight - yHandleReal)) / viewportHeight;
	document.body.style.setProperty("--content-translate", `-${contentHeight * scrollFactorY}px`);
	scrollHandleY.style.top = `${scrollTop}px`;
	window.dispatchEvent(new CustomEvent("content-scroll"));
}

export function goToOffset(offset: number): void {
	const rowIndex = Math.floor(offset / 0x10);
	const factor = (rowHeight * rowIndex) / contentHeight;
	const topMax = viewportHeight - yHandleHeight;
	const top = (factor * topMax * viewportHeight) / (yHandleHeight - yHandleReal + topMax);
	scrollY(top);
}

export function updateScrollHandle(entries?: readonly ResizeObserverEntry[]): void {
	viewportHeight = entries?.[0]?.contentRect.height ?? scrollBarY.getBoundingClientRect().height;
	contentHeight = (stat.fileRows + 1) * rowHeight;

	if (contentHeight < viewportHeight) {
		document.body.style.removeProperty("--scrollbar-size-vertical");
	} else {
		document.body.style.setProperty("--scrollbar-size-vertical", "10px");
		yHandleReal = viewportHeight ** 2 / contentHeight;
		yHandleHeight = Math.max(handleMinimum, yHandleReal);
		scrollHandleY.style.height = `${yHandleHeight}px`;
		scrollY(scrollFactorY * viewportHeight);
	}
}

new ResizeObserver(updateScrollHandle).observe(scrollBarY);

new ResizeObserver((entries) => {
	viewportWidth = entries[0]?.contentRect.width ?? scrollBarX.getBoundingClientRect().width;
	contentWidth = viewport.getBoundingClientRect().width;

	if (contentWidth < viewportWidth) {
		document.body.style.removeProperty("--scrollbar-size-horizontal");
	} else {
		document.body.style.setProperty("--scrollbar-size-horizontal", "10px");
		xHandleReal = viewportWidth ** 2 / contentWidth;
		xHandleWidth = Math.max(handleMinimum, xHandleReal);
		scrollHandleX.style.width = `${xHandleWidth}px`;
		scrollX(scrollLeft);
	}
}).observe(scrollBarX);

scrollHandleY.addEventListener("mousedown", (event) => {
	scrollHandleY.classList.add("active");
	scrollAnchorY = event.clientY - scrollHandleY.getBoundingClientRect().top;
});

scrollHandleX.addEventListener("mousedown", (event) => {
	scrollHandleX.classList.add("active");
	viewportWidth = scrollBarX.getBoundingClientRect().width;
	scrollAnchorX = event.clientX - scrollHandleX.getBoundingClientRect().left;
});

window.addEventListener("mouseup", () => {
	scrollHandleY.classList.remove("active");
	scrollHandleX.classList.remove("active");
});

window.addEventListener("mousemove", (event) => {
	if (scrollHandleY.classList.contains("active")) {
		scrollY(event.clientY - scrollAnchorY);
	}

	if (scrollHandleX.classList.contains("active")) {
		scrollX(event.clientX - scrollAnchorX);
	}
});

window.addEventListener("wheel", (event) => {
	const { wheelDelta, wheelDeltaX, wheelDeltaY, deltaY, deltaX, deltaMode, shiftKey, } = event;

	// https://stackoverflow.com/questions/10744645/detect-touchpad-vs-mouse-in-javascript/62415754#62415754
	const isTouchpad = (() => {
		if (wheelDelta) {
			return (wheelDeltaX && wheelDeltaX === deltaX * -3) || (wheelDeltaY && wheelDeltaY === deltaY * -3);
		}

		return deltaMode === event.DOM_DELTA_PIXEL;
	})();

	if (xHandleWidth && (Math.abs(deltaX) > Math.abs(deltaY) || (!isTouchpad && deltaY && shiftKey))) {
		const dx = (shiftKey ? deltaY : deltaX) / devicePixelRatio;
		const dw = contentWidth / viewportWidth;
		scrollX(scrollLeft + dx / dw);
	}

	if (yHandleHeight && Math.abs(deltaY) > Math.abs(deltaX) && (isTouchpad || !shiftKey)) {
		const dy = deltaY / devicePixelRatio;
		const dh = contentHeight / viewportHeight;
		scrollY(scrollTop + dy / dh);
	}
});
