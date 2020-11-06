import { ImageDetails } from '../ImageDetails';
import {
	DescriptionAttribute, createIcon, icons, Description, noop,
} from '../../utilities';
import { makeDraggable } from './draggable';

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
	}

	protected constructor(
		public image: HTMLImageElement,
		public options: Required<ImageOverlayOptions>,
	) {
		ImageOverlay.Instances.add(this);
	}

	}

	public async enable(): Promise<void> {
		if (this.enabled) return;

		this.ImageDetails = await ImageDetails.enhance(this.image, {
			blockName: 'overlaid',
			displaySummaryText: false,
			summaryMarker: () => createIcon(icons.details),
			onGetDescription: this.options.onGetDescription,
		});

		if (!this.ImageDetails) return;

		const { details, summary } = this.ImageDetails;
		const { draggingClass } = this.options;

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
		const { details, marker } = this.ImageDetails;
		if (details.open) {
			details.classList.add(draggableClass);
			details.classList.add(resizableClass);
			marker.innerHTML = createIcon(icons.close).outerHTML;
		} else {
			details.classList.remove(draggableClass);
			details.classList.remove(resizableClass);
			details.removeAttribute('style');
			marker.innerHTML = createIcon(icons.details).outerHTML;
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
