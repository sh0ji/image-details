import {
	DescriptionAttribute, getDescription, icons, createIcon,
} from '../../utilities';
import { makeDraggable } from './draggable';

type ImageOverlayAnatomy =
	| 'overlay'			// a <div> that wraps the <img> + <details>; used for positioning
	| 'image'			// <img>
	| 'details'			// <details>
	| 'summary'			// <summary> (first child of <details>)
	| 'marker'			// The first child of the <summary> (used instead of ::marker)
	| 'contents'		// The second child of the <details> (next sibling of <summary>)
	| 'altText'			// The first child <section> of the `contents`
	| 'description'		// The second child <section> of the `contents`

type SummaryMarker = string | HTMLElement | SVGSVGElement;
type MarkerState = Record<'open' | 'closed', SummaryMarker>;

interface ImageOverlayClasses extends Partial<Record<ImageOverlayAnatomy, string>> {
	draggable?: string;
	resizable?: string;
	dragging?: string;
	screenReaderOnly?: string;
}

export interface ImageOverlayOptions {
	/**
	 * Indicates that the image's `alt` contents should be copied to the
	 * <details> as its first child. This will be `aria-hidden` so that users
	 * who read it on the image don't have to read it again.
	 */
	addAltText?: boolean;
	/**
	 * HTML string heading for the alt text section of the `<details>`. Only used
	 * if `addAltText` is `true`. Default is `<h2>Alt Text</h2>`.
	 */
	altSectionHeading?: string;
	/**
	 * HTML string heading for the long description section of the `<details>`.
	 * Default is `<h2>Image Description</h2>`.
	 */
	descriptionHeading?: string;
	/**
	 * Indicates whether the summary's textual content should be visible. If
	 * `false`, the summary text will be set as both the `aria-label` and `title`.
	 */
	displaySummaryText?: boolean;
	/**
	 * A custom `summary::marker` element. If included, it will be added as the
	 * first child of the `<summary>` and will be accessible on the instance as
	 * `ImageOverlayInstance.marker`.
	 *
	 * To specify a different element on open and close, pass an object with
	 * `open` and `closed` values.
	 */
	summaryMarker?: SummaryMarker | MarkerState;
	/**
	 * Where the `<details>` should be placed relative to the image in the DOM.
	 *
	 * `after-image` indicates `img + details`.
	 *`before-image` indicates `details + img`.
	 */
	detailsPlacement?: 'after-image' | 'before-image';
	/** Text to display in the <summary> element. */
	summaryText?: string | ((hasDescription: boolean) => string);
	/**
	 * Indicates that the `Escape` key should close the `<details>`. Note that
	 * `Escape` will always close the `details` if focus is on the `<summary>`.
	 */
	closeOnEscape?: boolean;
}

interface EnhanceAllOptions extends ImageOverlayOptions, ImageOverlayClasses {
	selector?: string;
}

const ImageOverlayInstances = new Set<ImageOverlay>();

export class ImageOverlay {
	public options: Required<ImageOverlayOptions & ImageOverlayClasses>;
	public image: HTMLImageElement;
	public description?: HTMLElement | null;
	public overlay!: HTMLElement;
	public details!: HTMLDetailsElement;
	public summary!: HTMLElement;
	public marker!: HTMLSpanElement;
	public contents!: HTMLElement;
	public altSection!: HTMLElement;
	public descriptionAttribute!: DescriptionAttribute | null;
	private originalImage!: HTMLImageElement;
	private enabled = false;
	// private hasAdjacentDetails = false;
	// private existingDetailsDescription = false;

	protected constructor(
		image: HTMLImageElement,
		options: ImageOverlay['options'],
	) {
		this.image = image;
		this.options = options;

		ImageOverlayInstances.add(this);
	}

	public async enable(): Promise<void> {
		if (this.enabled) return;

		this.originalImage = this.image.cloneNode() as HTMLImageElement;

		const { attr, desc } = await getDescription(this.image);
		this.descriptionAttribute = attr;
		this.description = desc;

		const { image, dragging } = this.options;
		this.image.classList.add(image);

		this.overlay = this.createOverlay();
		this.details = this.createDetails();
		this.summary = this.createSummary();
		this.marker = this.createMarker();
		this.contents = this.createContents(this.details);

		makeDraggable({
			el: this.details,
			keyboardEl: this.summary,
			onDrag: () => {
				this.details.classList.add(dragging);
			},
			onRelease: () => {
				this.details.classList.remove(dragging);
			},
		});

		this.details.addEventListener('toggle', this.onToggle);
		document.addEventListener('keydown', this.onDocumentKeydown);

		this.enabled = true;
	}

	public disable(): this {
		if (!this.enabled) return this;

		this.details.removeEventListener('toggle', this.onToggle);
		document.removeEventListener('keydown', this.onDocumentKeydown);

		this.enabled = false;
		return this;
	}

	public destroy(): this {
		if (this.enabled) this.disable();
		(this.overlay.parentNode || document).insertBefore(this.originalImage, this.overlay);
		this.overlay.remove();
		ImageOverlayInstances.delete(this);
		return this;
	}

	private createOverlay(): HTMLElement {
		if (this.overlay && this.overlay instanceof HTMLElement) return this.overlay;
		const { overlay: overlayClass } = this.options;
		const { parentElement } = this.image;
		const overlay = (
			parentElement instanceof HTMLElement && parentElement.classList.contains(overlayClass)
		) ? parentElement : document.createElement('div');
		overlay.classList.add(overlayClass);
		if (overlay.contains(this.image)) return overlay;

		// append to the document
		(parentElement || document).insertBefore(overlay, this.image);
		overlay.append(this.image);

		return overlay;
	}

	private createDetails(): HTMLDetailsElement {
		if (this.details instanceof HTMLDetailsElement) return this.details;
		const { detailsPlacement, screenReaderOnly, details: detailsClass } = this.options;

		if (this.description) {
			if (this.description instanceof HTMLDetailsElement) {
				// this.existingDetailsDescription = true;
			}
			if (screenReaderOnly && this.description.classList.contains(screenReaderOnly)) {
				this.description.classList.remove(screenReaderOnly);
			}
		}

		const { nextElementSibling } = this.image;

		// next element is a <details>
		if (nextElementSibling && nextElementSibling instanceof HTMLDetailsElement) {
			// this.hasAdjacentDetails = true;
			// next element is the description or contains it
			if (
				this.description
				&& (nextElementSibling === this.description
				|| nextElementSibling.contains(this.description))
			) {
				nextElementSibling.classList.add(detailsClass);
				return nextElementSibling;
			}
			// TODO: handle adjacent <details> that aren't the description?
		}

		const details = document.createElement('details');
		details.classList.add(detailsClass);

		// add to the document
		const refChild = (detailsPlacement === 'after-image')
			? this.image.nextSibling : this.image;
		(this.image.parentNode || document).insertBefore(details, refChild);

		return details;
	}

	private createSummary(): HTMLElement {
		const { summary: summaryClass, displaySummaryText, summaryText } = this.options;
		const existingSummary = this.details.querySelector<HTMLElement>('summary');
		if (existingSummary) {
			existingSummary.classList.add(summaryClass);
			return existingSummary;
		}

		const summary = document.createElement('summary');
		summary.classList.add(summaryClass);

		const text = (typeof summaryText === 'string')
			? summaryText
			: summaryText(Boolean(this.description));
		if (displaySummaryText) {
			summary.append(text);
		} else {
			summary.setAttribute('aria-label', text);
			summary.setAttribute('title', text);
		}

		// add to the document
		this.details.prepend(summary);

		return summary;
	}

	private createMarker(): HTMLSpanElement {
		const { marker: markerClass } = this.options;
		const marker = document.createElement('span');
		marker.classList.add(markerClass);

		// add to the document
		this.summary.prepend(this.updateMarker(marker));

		return marker;
	}

	private updateMarker(marker = this.marker): HTMLSpanElement {
		const { summaryMarker } = this.options;
		if (typeof summaryMarker === 'object' && 'open' in summaryMarker) {
			// remove current child and add the updated one
			while (marker.firstChild) marker.firstChild.remove();
			const { open, closed } = summaryMarker;
			marker.append((this.details.open) ? open : closed);
			return marker;
		}
		if (!marker.children.length) marker.append(summaryMarker);
		return marker;
	}

	private createContents(details: NonNullable<ImageOverlay['details']>): HTMLDivElement {
		const { addAltText, contents: contentsClass } = this.options;
		const contents = document.createElement('div');
		contents.classList.add(contentsClass);

		const descSection = this.createDescSection();

		if (addAltText) contents.append(this.createAltSection());
		if (descSection) contents.append(descSection);

		// add to the details
		details.append(contents);

		return contents;
	}

	private createAltSection(): HTMLElement {
		const { altText: altClass, altSectionHeading } = this.options;
		const section = document.createElement('section');
		section.classList.add(altClass);
		section.setAttribute('aria-hidden', 'true');
		section.innerHTML = `${altSectionHeading}<p>${this.image.alt}</p>`;
		return section;
	}

	private createDescSection(): HTMLElement | null {
		if (!this.description) return null;
		const { descriptionHeading, description: descClass } = this.options;
		const section = document.createElement('section');
		section.classList.add(descClass);
		section.innerHTML = descriptionHeading;
		section.append(this.description);
		return section;
	}

	private onToggle = (): void => {
		const { draggable, resizable } = this.options;
		if (this.details.open) {
			this.details.classList.add(draggable);
			this.details.classList.add(resizable);
		} else {
			this.details.classList.remove(draggable);
			this.details.classList.remove(resizable);
			this.details.removeAttribute('style');
		}
		this.updateMarker();
	}

	private onDocumentKeydown = (e: KeyboardEvent): void => {
		if (e.key !== 'Escape') return;

		const { closeOnEscape } = this.options;
		if (closeOnEscape) this.details.open = false;
	}

	public static async enhance(
		image: HTMLImageElement,
		options?: Partial<ImageOverlay['options']>,
	): Promise<ImageOverlay | null> {
		const opts = {
			...ImageOverlay.defaultOptions,
			...ImageOverlay.defaultClasses,
			...options,
		};
		const hasDesc = Object.values(DescriptionAttribute).some((attr) => image.getAttribute(attr));
		if (!hasDesc && !image.alt) return null;
		const instance = new ImageOverlay(image, opts);
		await instance.enable();
		return instance;
	}

	public static async enhanceAll({
		selector = ImageOverlay.selector,
		...options
	}: EnhanceAllOptions = {}): Promise<typeof ImageOverlay.instances> {
		await Promise.all(Array.from(document.querySelectorAll<HTMLImageElement>(selector))
			.map(async (el) => ImageOverlay.enhance(el, options)));
		return ImageOverlay.instances;
	}

	public static selector = 'img';

	public static get instances(): ImageOverlay[] {
		return Array.from(ImageOverlayInstances);
	}

	public static baseName = 'overlaid';

	public static defaultClasses: Required<ImageOverlayClasses> = {
		overlay: ImageOverlay.baseName,
		image: `${ImageOverlay.baseName}__image`,
		details: `${ImageOverlay.baseName}__details`,
		summary: `${ImageOverlay.baseName}__summary`,
		marker: `${ImageOverlay.baseName}__marker`,
		contents: `${ImageOverlay.baseName}__contents`,
		altText: `${ImageOverlay.baseName}__alt`,
		description: `${ImageOverlay.baseName}__desc`,
		draggable: `${ImageOverlay.baseName}--draggable`,
		resizable: `${ImageOverlay.baseName}--resizable`,
		dragging: 'dragging',
		screenReaderOnly: 'sr-only',
	}

	public static defaultOptions: Required<ImageOverlayOptions> = {
		addAltText: true,
		altSectionHeading: '<h2>Alt Text</h2>',
		descriptionHeading: '<h2>Image Description</h2>',
		detailsPlacement: 'after-image',
		// getter used for summaryMarker so that icon elements are cloned
		get summaryMarker() {
			return {
				open: createIcon(icons.close),
				closed: createIcon(icons.details),
			};
		},
		summaryText: (hasDescription: boolean): string => {
			let text = 'Description';
			if (!hasDescription) text += ' (Only alt text)';
			return text;
		},
		displaySummaryText: false,
		closeOnEscape: true,
	}
}
