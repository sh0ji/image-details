import { createSummary } from './elements';
import { styleString, icons } from '../../utilities';

export interface ImageOverlayOptions {
	contentsClass?: string;
	imageClass?: string;
	summaryClass?: string;
	summaryIconClass?: string;
	altTextClass?: string;
	draggableClass?: string;
	resizableClass?: string;

	defaultSummary?: string;
	addAltText?: boolean;
}

export interface ImageOverlayElements {
	summary: HTMLElement;
	contents: HTMLElement;
	img: HTMLImageElement;
}

export interface ImageOverlayPosition {
	top: number | null;
	left: number | null;
}

export type Listener = Parameters<HTMLElement['addEventListener']>;
export type CSSRecord = Record<keyof CSSStyleDeclaration, string | null>;

const ImageOverlayInstances = new Set<ImageOverlay>();

class ImageOverlay {
	public static baseName = 'overlaid';
	public options: Required<ImageOverlayOptions>;
	public details: HTMLDetailsElement;
	public summary = document.createElement('summary');
	public contents: HTMLElement = document.createElement('div');
	public img: HTMLImageElement;
	private altSection?: HTMLElement;
	private enabled = false;
	private dragging = false;

	public constructor(
		details: HTMLDetailsElement,
		options: ImageOverlayOptions = {},
	) {
		this.details = details;
		this.options = { ...ImageOverlay.defaultOptions, ...options };

		const img = document.querySelector<HTMLImageElement>(
			`img[aria-details="${this.details.id}"]`,
		);
		if (!img) {
			// eslint-disable-next-line no-console
			console.error(
				'No related image found.', this.details,
				'\nAssociate an <img> with your <details> via aria-details.'
				+ '\nSee https://w3c.github.io/aria/#aria-details',
			);
		} else {
			this.img = img;
		}

		ImageOverlay.instances.add(this);
	}

	private get detailsListeners(): Listener[] {
		return [
			['toggle', this.onToggle],
			['mousedown', this.onDragstart],
			['mouseup', this.onDragend],
			['mouseleave', this.onDragend],
			['mousemove', this.onDrag],
		];
	}

	private get summaryListeners(): Listener[] {
		return [
			['keydown', this.onKeydown],
		];
	}

	private onDragstart = (e: MouseEvent): void => {
		const path = (e.composedPath && e.composedPath());
		const { top } = this.details.getBoundingClientRect();
		const exclude = [
			// don't drag when the user is clicking the summary
			path.includes(this.summary),
			// only allow dragging on the top 32px
			(e.clientY - top) >= 32,
		];
		if (!exclude.some(Boolean)) {
			this.dragging = true;
		}
	}

	private onDragend = (): void => {
		this.dragging = false;
	}

	private onDrag = ({ movementX, movementY }: MouseEvent): void => {
		if (this.enabled && this.dragging) {
			this.move({ movementX, movementY });
		}
	}

	private onToggle = (): void => {
		if (this.details.open) {
			this.details.classList.add(this.options.draggableClass);
			this.details.classList.add(this.options.resizableClass);
		} else {
			this.details.classList.remove(this.options.draggableClass);
			this.details.classList.remove(this.options.resizableClass);
			this.details.removeAttribute('style');
		}
	}

	private onKeydown = (e: KeyboardEvent): void => {
		const mod = (e.shiftKey) ? 20 : 1;
		const step = mod * 1;
		let left;
		let top;
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
			case 'Escape':
				this.details.open = false;
				return;
			default:
				return;
		}

		if (left && top) {
			e.preventDefault();
			this.move({
				movementX: left * step,
				movementY: top * step,
			});
		}
	}

	public move({ movementX, movementY }: Pick<MouseEvent, 'movementX' | 'movementY'>): void {
		const { top, left } = this.pos;
		if (top && left) {
			this.details.setAttribute('style', styleString({
				position: 'absolute',
				top: `${top + movementY}px`,
				left: `${left + movementX}px`,
			}));
		}
	}

	public resetPosition(): void {
		this.details.setAttribute('style', styleString({
			position: null,
			top: null,
			left: null,
		}));
	}

	private getSummary(): HTMLElement {
		const {
			summaryClass, summaryIconClass,
			defaultSummary,
		} = this.options;
		let summary = this.details.querySelector<HTMLElement>(
			(summaryClass) ? `.${summaryClass}` : 'summary',
		);
		if (!summary || !summary.textContent) {
			summary = createSummary({
				text: defaultSummary,
				className: summaryClass,
				iconClass: summaryIconClass,
				icon: icons.details,
			});
		}

		return summary;
	}

	private getContents(): HTMLElement {
		const { contentsClass } = this.options;

		let contents: HTMLElement | ChildNode[] | null = this.details.querySelector<HTMLElement>(
			`.${contentsClass}`,
		);

		if (contents === null) {
			contents = this.contents;
			const startingNode = this.summary.nextSibling;
			if (startingNode) {
				if (startingNode instanceof HTMLElement && startingNode.nextSibling === null) {
					contents = startingNode;
				} else {
					const internals = [];
					let current = startingNode;
					while (current.nextSibling) {
						internals.push(current.nextSibling);
						current = current.nextSibling;
					}
					contents.append(...internals);
				}
			}
		}

		return contents;
	}

	private addAltText(): void {
		if (this.altSection) return;
		const { altTextClass } = this.options;
		this.altSection = document.createElement('section');
		this.altSection.setAttribute('aria-hidden', 'true');
		this.altSection.innerHTML = `<h3>Alt Text</h3><p>${this.img.alt}</p>`;
		if (altTextClass) this.altSection.classList.add(altTextClass);
		this.contents.prepend(this.altSection);
	}

	public enable(): this {
		if (this.enabled) return this;
		const {
			contentsClass, imageClass, summaryClass,
			addAltText,
		} = this.options;
		this.summary = this.getSummary();
		this.contents = this.getContents();

		if (summaryClass) this.summary.classList.add(summaryClass);
		if (contentsClass) this.contents.classList.add(contentsClass);
		if (imageClass) this.img.classList.add(imageClass);

		if (addAltText) this.addAltText();

		// TODO: add document listeners, if any

		this.detailsListeners.forEach(([...args]) => {
			this.details.addEventListener(...args);
		});

		this.summaryListeners.forEach(([...args]) => {
			this.summary.addEventListener(...args);
		});
		this.enabled = true;
		return this;
	}

	public disable(): this {
		if (!this.enabled) return this;

		this.detailsListeners.forEach(([...args]) => {
			this.details.removeEventListener(...args);
		});

		this.summaryListeners.forEach(([...args]) => {
			this.summary.removeEventListener(...args);
		});

		this.enabled = false;
		return this;
	}

	public destroy(): this {
		if (this.enabled) this.disable();
		ImageOverlay.instances.delete(this);
		return this;
	}

	get pos(): ImageOverlayPosition {
		const { top = '0', left = '0' } = window.getComputedStyle(this.details);
		return {
			top: (top === 'auto') ? null : parseInt(top, 10),
			left: (top === 'auto') ? null : parseInt(left, 10),
		};
	}

	public static enhance(
		detailsElement: HTMLDetailsElement,
		options?: ImageOverlayOptions,
	): ImageOverlay {
		const d = new ImageOverlay(detailsElement, options);
		d.enable();
		return d;
	}

	public static enhanceAll(
		selector: string,
		options?: ImageOverlayOptions,
	): typeof ImageOverlayInstances {
		let sel: typeof selector;
		let opts: ImageOverlayOptions | undefined;
		if (typeof selector === 'string') {
			sel = selector;
			opts = options;
		} else {
			sel = ImageOverlay.selector;
			opts = selector;
		}
		document.querySelectorAll<HTMLDetailsElement>(sel).forEach((el) => {
			ImageOverlay.enhance(el, opts);
		});
		return ImageOverlay.instances;
	}

	public static selector = 'details[id]';
	public static get instances(): typeof ImageOverlayInstances {
		return ImageOverlayInstances;
	}

	public static defaultOptions: Required<ImageOverlayOptions> = {
		contentsClass: '',
		summaryClass: '',
		imageClass: '',
		altTextClass: '',
		summaryIconClass: 'marker',
		draggableClass: 'draggable',
		resizableClass: 'resizable',

		defaultSummary: 'More information',
		addAltText: true,
	}
}

export default ImageOverlay;
