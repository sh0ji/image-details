import { getFocusable, setStyle, noop } from '../../utilities';

export interface DraggablePosition {
	top: number | null;
	left: number | null;
}

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

export class Draggable {
	public options: Required<DraggableOptions>;
	private moveX = 0;
	private moveY = 0;
	private canGrab = false;
	private grabbed = false;

	protected constructor(
		public el: HTMLElement,
		public keyboardEl: HTMLElement | null,
		options?: Partial<DraggableOptions>,
	) {
		this.options = { ...Draggable.defaultOptions, ...options };

		this.el.addEventListener('pointerdown', this.grab);
		this.el.addEventListener('pointerleave', this.release);
		this.el.addEventListener('pointermove', this.pointermove);
		this.el.addEventListener('pointerup', this.release);

		if (this.keyboardEl) {
			this.keyboardEl.addEventListener('keydown', this.moveWithKeyboard);
		}
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
			const { excludedElements, excludeFocusable } = this.options;

			const excluded = [
				...((typeof excludedElements === 'function') ? excludedElements(this.el) : excludedElements),
				...((excludeFocusable) ? Array.from(getFocusable(this.el)) : []),
			].filter((el) => el && e.composedPath().includes(el));

			this.canGrab = !excluded.some(Boolean);
		}
	};

	private moveWithKeyboard = (e: KeyboardEvent): void => {
		const mod = e.shiftKey ? 20 : 1;
		const pos = Draggable.getKeyboardPosition(e.key, 5 * mod);
		if (!pos) return;
		e.preventDefault();
		if (pos === 'reset') this.resetPosition();
		else {
			const { left, top } = pos;
			this.move(left, top);
		}
	};

	private static getKeyboardPosition(
		key: KeyboardEvent['key'],
		step: number,
	): { top: number; left: number } | 'reset' | null {
		switch (key) {
			case 'ArrowRight': return { left: step, top: 0 };
			case 'ArrowLeft': return { left: -step, top: 0 };
			case 'ArrowDown': return { left: 0, top: step };
			case 'ArrowUp': return { left: 0, top: -step };
			case 'Home': return 'reset';
			default: return null;
		}
	}

	public static defaultOptions: Required<DraggableOptions> = {
		excludedElements: [],
		excludeFocusable: true,

		onDrag: noop,
		onGrab: noop,
		onMove: noop,
		onRelease: noop,
	};

	public static makeDraggable = ({ el, keyboardEl, ...options }: DraggableOptions & {
		el: HTMLElement;
		keyboardEl: HTMLElement | null;
	}): Draggable => new Draggable(el, keyboardEl, options);
}

export const { makeDraggable } = Draggable;
