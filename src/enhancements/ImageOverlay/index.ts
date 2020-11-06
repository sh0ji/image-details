import { ImageDetails, ImageDetailsOptions } from '../ImageDetails';
import { DescriptionAttribute, Description, noop } from '../../utilities';
import { makeDraggable } from './draggable';
import { createIcon } from './defaultIcons';

export interface ImageOverlayOptions {
	/**
	 * Indicates that the `Escape` key should close all `<details>`. Note that
	 * `Escape` will always close the `details` if focus is on the `<summary>`.
	 */
	closeAllOnEscape?: boolean;
	draggableClass?: string;
	draggingClass?: string;
	resizableClass?: string;
	onGetDescription?: (descriptions: Description[]) => void;
	marker?: ImageDetailsOptions['summaryMarker'] | Record<'open' | 'closed', ImageDetailsOptions['summaryMarker']>;
}

export class ImageOverlay {
	private enabled = false;
	public ImageDetails: ImageDetails | null = null;

	private static Instances = new Set<ImageOverlay>();

	public static defaultOptions: Required<ImageOverlayOptions> = {
		closeAllOnEscape: true,
		draggingClass: 'dragging',
		draggableClass: 'draggable',
		resizableClass: 'resizable',
		onGetDescription: noop,
		marker: {
			open: createIcon.bind(null, true),
			closed: createIcon.bind(null, false),
		},
	}

	protected constructor(
		public image: HTMLImageElement,
		public options: Required<ImageOverlayOptions>,
	) {
		ImageOverlay.Instances.add(this);
	}

	private get markerOpen(): string | HTMLElement | SVGSVGElement | null {
		const { marker } = this.options;
		if ('open' in marker && typeof marker.open === 'function') return marker.open();
		if (typeof marker === 'function') return marker();
		return null;
	}

	private get markerClosed(): string | HTMLElement | SVGSVGElement | null {
		const { marker } = this.options;
		if ('closed' in marker && typeof marker.closed === 'function') return marker.closed();
		if (typeof marker === 'function') return marker();
		return null;
	}

	public async enable(): Promise<void> {
		if (this.enabled) return;

		const { onGetDescription, draggingClass } = this.options;

		this.ImageDetails = await ImageDetails.enhance(this.image, {
			blockName: 'overlaid',
			displaySummaryText: false,
			summaryMarker: () => this.markerClosed,
			onGetDescription,
		});

		if (!this.ImageDetails) return;

		const { details, summary } = this.ImageDetails;

		makeDraggable({
			el: details,
			keyboardEl: summary,
			onDrag: () => {
				details.classList.add(draggingClass);
			},
			onRelease: () => {
				details.classList.remove(draggingClass);
			},
		});

		details.addEventListener('toggle', this.onToggle);
		document.addEventListener('keydown', this.onDocumentKeydown);

		this.enabled = true;
	}

	public disable(): this {
		if (!this.enabled || !this.ImageDetails) return this;
		const { details } = this.ImageDetails;
		details.removeEventListener('toggle', this.onToggle);
		document.removeEventListener('keydown', this.onDocumentKeydown);
		this.enabled = false;
		return this;
	}

	public destroy(): this {
		if (this.enabled) this.disable();
		if (this.ImageDetails) this.ImageDetails.destroy();
		ImageOverlay.Instances.delete(this);
		return this;
	}

	public get isOpen(): boolean {
		return (this.ImageDetails)
			? this.ImageDetails.details.open
			: false;
	}

	private onToggle = (): void => {
		if (!this.ImageDetails) return;
		const { draggableClass, resizableClass } = this.options;
		const { details } = this.ImageDetails;
		if (details.open) {
			details.classList.add(draggableClass);
			details.classList.add(resizableClass);
			this.ImageDetails.updateMarker(this.markerOpen);
		} else {
			details.classList.remove(draggableClass);
			details.classList.remove(resizableClass);
			details.removeAttribute('style');
			this.ImageDetails.updateMarker(this.markerClosed);
		}
	}

	private onDocumentKeydown = (e: KeyboardEvent): void => {
		if (!this.ImageDetails || e.key !== 'Escape') return;

		const { closeAllOnEscape } = this.options;
		const { details } = this.ImageDetails;
		if (closeAllOnEscape) details.removeAttribute('open');
	}

	public static async enhance(
		image: HTMLImageElement,
		options?: ImageOverlayOptions,
	): Promise<ImageOverlay | null> {
		const opts = { ...ImageOverlay.defaultOptions, ...options };
		const hasDesc = Object.values(DescriptionAttribute).some((attr) => image.getAttribute(attr));
		if (!hasDesc && !image.alt) return null;
		const instance = new ImageOverlay(image, opts);
		await instance.enable();
		return instance;
	}

	public static async enhanceAll(
		{ selector = 'img', ...options }: Partial<ImageOverlayOptions & { selector?: string }> = {},
	): Promise<typeof ImageOverlay.instances> {
		await Promise.all(Array.from(document.querySelectorAll<HTMLImageElement>(selector))
			.map(async (el) => ImageOverlay.enhance(el, options)));
		return ImageOverlay.instances;
	}

	public static get instances(): ImageOverlay[] {
		return Array.from(ImageOverlay.Instances);
	}
}
