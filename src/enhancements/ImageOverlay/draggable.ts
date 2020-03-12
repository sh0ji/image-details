import { getFocusable } from '../../utilities/elements';
import { setStyle, noop } from '../../utilities/misc';

interface DraggableOptions {
	/**
	 * A list of elements that will not initiate the `grab` action, which begins
	 * the element dragging.
	 */
	excludedElements?: HTMLElement[] | ((draggableElement: HTMLElement) => HTMLElement[]);
	/**
	 * Indicates that all focusable/interactive elements inside the draggable
	 * element should not initiate dragging. Default is `true`.
	 */
	excludeFocusable?: boolean;

	onDrag?: () => void;
	onGrab?: () => void;
	onMove?: () => void;
	onRelease?: () => void;
}

export interface DraggableOptionsRequired {
	el: HTMLElement;
	keyboardEl: HTMLElement;
}

export interface DraggablePosition {
	top: number | null;
	left: number | null;
}

class Draggable {
	public options: Required<DraggableOptions>;
	private moveX = 0;
	private moveY = 0;
	private canGrab = false;
	private grabbed = false;

	protected constructor(
		public el: HTMLElement,
		public keyboardEl: HTMLElement,
		options?: DraggableOptions,
	) {
		this.options = { ...Draggable.defaultOptions, ...options };

		this.el.addEventListener('pointerdown', this.grab);
		this.el.addEventListener('pointerleave', this.release);
		this.el.addEventListener('pointermove', this.pointermove);
		this.el.addEventListener('pointerup', this.release);

		this.keyboardEl.addEventListener('keydown', this.moveWithKeyboard);
	}

	public move(x: number, y: number): void {
		const { top, left } = this.pos;
		if (top !== null && left !== null) {
			setStyle(this.el, {
				position: 'absolute',
				left: `${left + x}px`,
				top: `${top + y}px`,
			});
		}
		this.options.onMove();
	}

	public resetPosition(): void {
		setStyle(this.el, {
			position: null,
			top: null,
			left: null,
		});
	}

	public get pos(): DraggablePosition {
		const { top = '0', left = '0' } = window.getComputedStyle(this.el);
		return {
			top: (top === 'auto') ? null : parseInt(top, 10),
			left: (top === 'auto') ? null : parseInt(left, 10),
		};
	}

	private grab = (e: MouseEvent): void => {
		if (!this.canGrab) return;

		this.moveX = e.clientX;
		this.moveY = e.clientY;
		this.grabbed = true;
		this.options.onGrab();
	};

	private release = (): void => {
		this.moveX = 0;
		this.moveY = 0;
		this.grabbed = false;
		this.options.onRelease();
	};

	private drag = ({ clientX, clientY }: MouseEvent): void => {
		this.move(clientX - this.moveX, clientY - this.moveY);
		this.moveX = clientX;
		this.moveY = clientY;
		this.options.onDrag();
	}

	private pointermove = (e: MouseEvent): void => {
		if (this.grabbed) {
			this.drag(e);
		} else {
			const {
				excludedElements,
				excludeFocusable,
			} = this.options;

			const excludedElements = [
				...((typeof excludedElements === 'function') ? excludedElements(this.el) : excludedElements),
				...((excludeFocusable) ? Array.from(getFocusable(this.el)) : []),
			].filter((el) => el && e.composedPath().includes(el));

			this.canGrab = !excludedElements.some(Boolean);
		}
	};

	private moveWithKeyboard = (e: KeyboardEvent): void => {
		const mod = e.shiftKey ? 20 : 1;
		const step = mod * 1;
		let left = 0;
		let top = 0;
		switch (e.key) {
			case 'ArrowRight':
				left = 5;
				break;
			case 'ArrowLeft':
				left = -5;
				break;
			case 'ArrowDown':
				top = 5;
				break;
			case 'ArrowUp':
				top = -5;
				break;
			case 'Home':
				e.preventDefault();
				this.resetPosition();
				return;
			default:
				return;
		}

		e.preventDefault();
		this.move(left * step, top * step);
	};

	public static defaultOptions: Required<DraggableOptions> = {
		excludedElements: [],
		excludeFocusable: true,

		onDrag: noop,
		onGrab: noop,
		onMove: noop,
		onRelease: noop,
	};

	public static makeDraggable(
		{ el, keyboardEl, ...options }: DraggableOptionsRequired & DraggableOptions,
	): Draggable {
		return new Draggable(el, keyboardEl, options);
	}
}

export default Draggable;

export const { makeDraggable } = Draggable;
