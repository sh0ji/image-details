import {
	DescriptionAttribute,
	Description,
	getDescription,
	appendContent,
	noop,
} from '../../utilities';

export interface ImageDetailsOptions {
	/**
	 * Indicates that the image's `alt` contents should be copied to the
	 * <details> as its first child. This will be `aria-hidden` so that users
	 * who read it on the image don't have to read it again.
	 */
	addAltText?: boolean;
	/**
	 * Where the `<details>` should be placed relative to the image in the DOM.
	 *
	 * * `after-image` indicates `img + details`.
	 * * `before-image` indicates `details + img`.
	 */
	detailsPlacement?: 'after-image' | 'before-image';
	/**
	 * Indicates whether the summary's textual content should be visible. If
	 * `false`, the summary text will be set as both the `aria-label` and `title`.
	 */
	displaySummaryText?: boolean;
	/**
	 * Indicates that the `Escape` key should close the `<details>`. Note that
	 * `Escape` will always close the `details` if focus is on the `<summary>`.
	 */
	closeOnEscape?: boolean;
	/**
	 * HTML string heading for the alt text section of the `<details>`. Only used
	 * if `addAltText` is `true`. Default is `<h2>Alt Text</h2>`.
	 */
	altSectionHeading?: () => string | HTMLElement;
	/**
	 * HTML string heading for the long description section of the `<details>`.
	 * Default is `<h2>Image Description</h2>`.
	 */
	descriptionHeading?: () => string | HTMLElement;
	/**
	 * A custom `summary::marker` element. If included, it will be added as the
	 * first child of the `<summary>` and will be accessible on the instance as
	 * `ImageDetailsInstance.marker`.
	 *
	 * To specify a different element on open and close, pass an object with
	 * `open` and `closed` values.
	 */
	summaryMarker?: () => string | HTMLElement | SVGSVGElement | null;
	/** Text to display in the <summary> element. */
	summaryText?: (
		/** Indicates whether a long description exists. */
		hasDescription: boolean
	) => string;
	/**
	 * The class for the `<div>` that wraps the `<img> + <details>`. This will
	 * also be used as the "block" name in the BEM class naming for child elements.
	 */
	blockName?: string;
	onGetDescription?: (descriptions: Description[]) => void;
}

export class ImageDetails {
	public description?: string | Node | null;
	public container: HTMLElement;
	public details: HTMLDetailsElement;
	public summary!: HTMLElement;
	public marker!: HTMLSpanElement;
	public contents!: HTMLDivElement;
	public descriptionSection: HTMLElement | null = null;
	public descriptionAttribute: DescriptionAttribute | null = null;
	private originalImage: HTMLImageElement;
	private originalDetails: HTMLDetailsElement | null = null;
	private descriptionAdded = false;
	// private hasAdjacentDetails = false;
	// private existingDetailsDescription = false;

	private static Instances = new Set<ImageDetails>();
	public static baseName = 'image-details';
	public static defaultOptions: Required<ImageDetailsOptions> = {
		addAltText: true,
		detailsPlacement: 'after-image',
		displaySummaryText: true,
		closeOnEscape: true,
		altSectionHeading: () => '<h2>Short description</h2>',
		descriptionHeading: () => '<h2>Long description</h2>',
		summaryMarker: () => null,
		summaryText: (hasDescription: boolean): string => {
			let text = 'Description';
			if (!hasDescription) text += ' (only alt text)';
			return text;
		},

		blockName: 'image-details',

		onGetDescription: noop,
	}

	protected constructor(
		public image: HTMLImageElement,
		public options: Required<ImageDetailsOptions>,
	) {
		this.originalImage = this.image.cloneNode(true) as HTMLImageElement;

		this.image.classList.add(this.getClass('image'));

		this.container = this.createContainer();
		this.details = this.createDetails();

		this.container.append(this.image, this.details);

		ImageDetails.Instances.add(this);
	}

	public get hasDescription(): boolean {
		return Object.values(DescriptionAttribute)
			.some((attr) => this.image.getAttribute(attr));
	}

	public async addDescription(description?: string | Node): Promise<void> {
		if (this.descriptionAdded) return;
		const { descriptionHeading, onGetDescription = noop } = this.options;

		if (description) {
			this.description = description;
		} else {
			const descriptions = await getDescription(this.image);
			onGetDescription.call(this, descriptions);
			if (descriptions.length) {
				const [{ attr, value }] = descriptions;
				this.descriptionAttribute = attr;
				this.description = value;
			}
		}

		if (this.description && this.descriptionSection) {
			appendContent(this.descriptionSection, descriptionHeading(), this.description);
			this.descriptionAdded = true;
		}
	}

	public destroy(): this {
		(this.container.parentNode || document).insertBefore(this.originalImage, this.container);
		if (this.originalDetails) {
			const { detailsPlacement } = this.options;
			const refChild = (detailsPlacement === 'after-image')
				? this.originalImage.nextSibling
				: this.originalImage;
			(this.originalImage.parentNode || document).insertBefore(this.originalDetails, refChild);
		}
		this.container.remove();
		ImageDetails.Instances.delete(this);
		return this;
	}

	// element constructors

	private createContainer(): HTMLElement {
		if (this.container) return this.container;
		const { blockName } = this.options;
		const { parentElement } = this.image;
		const container = (
			parentElement instanceof HTMLElement && parentElement.classList.contains(blockName)
		) ? parentElement : document.createElement('div');
		container.classList.add(blockName);
		if (container.contains(this.image)) return container;

		// append to the document
		(parentElement || document).insertBefore(container, this.image);

		return container;
	}

	private createDetails(): HTMLDetailsElement {
		if (this.details) return this.details;
		const { detailsPlacement } = this.options;

		let details = document.createElement('details');

		const detailsCandidate = (detailsPlacement === 'after-image')
			? this.image.nextElementSibling
			: this.image.previousElementSibling;

		if (detailsCandidate instanceof HTMLDetailsElement) {
			// `img + details` already exists so use it, storing a copy of the original
			this.originalDetails = detailsCandidate.cloneNode(true) as HTMLDetailsElement;
			details = detailsCandidate;
		} else {
			// add the new details to the document
			const refChild = (detailsPlacement === 'after-image')
				? this.image.nextSibling : this.image;
			(this.image.parentNode || document).insertBefore(details, refChild);

			// create the summary
			this.summary = this.createSummary();
			details.prepend(this.summary);

			// create the summary marker
			this.marker = this.createMarker();
			this.summary.prepend(this.marker);

			// create the contents
			this.contents = this.createContents();
			details.append(this.contents);
		}

		details.classList.add(this.getClass('details'));

		return details;
	}

	private createSummary(): HTMLElement {
		const { displaySummaryText, summaryText } = this.options;

		const summary = document.createElement('summary');
		summary.classList.add(this.getClass('summary'));
		const text = summaryText(this.hasDescription);
		if (!displaySummaryText) {
			summary.setAttribute('aria-label', text);
			summary.setAttribute('title', text);
		} else {
			const span = document.createElement('span');
			appendContent(span, text);
			summary.append(span);
		}

		return summary;
	}

	private createMarker(): HTMLSpanElement {
		const { summaryMarker } = this.options;

		const innerMarker = summaryMarker();
		const marker = document.createElement('span');
		marker.classList.add(this.getClass('marker'));
		if (innerMarker) marker.append(innerMarker);

		return marker;
	}

	private createContents(): HTMLDivElement {
		const { addAltText } = this.options;

		const contents = document.createElement('div');
		contents.classList.add(this.getClass('contents'));
		if (addAltText) contents.append(this.createAltSection());
		contents.append(this.createDescriptionSection());

		return contents;
	}

	private createAltSection(): HTMLElement {
		const { altSectionHeading } = this.options;
		const section = document.createElement('section');
		section.classList.add(this.getClass('alt'));
		section.setAttribute('aria-hidden', 'true');
		appendContent(section, altSectionHeading(), `<p>${this.image.alt}</p>`);
		return section;
	}

	private createDescriptionSection(): HTMLElement {
		const section = document.createElement('section');
		section.classList.add(this.getClass('desc'));
		this.descriptionSection = section;
		return section;
	}

	public updateMarker(marker: ReturnType<NonNullable<ImageDetailsOptions['summaryMarker']>>): this {
		while (this.marker.firstChild) {
			this.marker.removeChild(this.marker.firstChild);
		}
		if (marker) this.marker.append(marker);
		return this;
	}

	private getClass(element: string, asSelector = false): string {
		const { blockName } = this.options;
		const className = `${blockName}__${element}`;
		if (asSelector) return `.${className}`;
		return className;
	}

	public static async enhance(
		image: HTMLImageElement,
		options?: ImageDetailsOptions,
	): Promise<ImageDetails | null> {
		const opts = { ...ImageDetails.defaultOptions, ...options };
		const hasDesc = Object.values(DescriptionAttribute).some((attr) => image.getAttribute(attr));
		if (!hasDesc && !image.alt) return null;
		const instance = new ImageDetails(image, opts);
		await instance.addDescription();
		return instance;
	}

	public static async enhanceAll(
		{ selector = 'img', ...options }: ImageDetailsOptions & { selector?: string } = {},
	): Promise<typeof ImageDetails.instances> {
		await Promise.all(Array.from(document.querySelectorAll<HTMLImageElement>(selector))
			.map(async (el) => ImageDetails.enhance(el, options)));
		return ImageDetails.instances;
	}

	public static get instances(): ImageDetails[] {
		return Array.from(ImageDetails.Instances);
	}
}
