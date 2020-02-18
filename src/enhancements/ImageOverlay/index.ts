import parseDetails from '../../parsers/details';

export interface ImageOverlayOptions {
	contentsClass?: string;
	imageClass?: string;
	summaryClass?: string;
}

export default class ImageOverlay {
	public static baseName = 'overlaid';
	public details: HTMLDetailsElement;
	public summary: HTMLElement | null = null;
	public contents: HTMLElement | ChildNode[] | null = null;
	public img: HTMLImageElement | null = null;
	public options: ImageOverlayOptions;

	public constructor(
		details: HTMLDetailsElement,
		options: Partial<ImageOverlayOptions> = {},
	) {
		this.details = details;
		this.options = options;
	}

	async parse(): Promise<void> {
		const { contentsClass, imageClass, summaryClass } = this.options;

		this.summary = this.details.querySelector('summary');
		if (this.summary && summaryClass) this.summary.classList.add(summaryClass);

		this.contents = this.details.querySelector<HTMLElement>(`.${contentsClass}`);
		if (!this.contents) {
			const { contents } = await parseDetails(this.details);
			if (contents) {
				if (contents instanceof HTMLElement) {
					this.contents = contents;
				} else {
					this.contents = document.createElement('div');
					this.contents.append(...contents);
				}
				if (contentsClass) this.contents.classList.add(contentsClass);
			}
		}

		this.img = document.querySelector(`img[aria-details="${this.details.id}"]`);
		if (this.img && imageClass) this.img.classList.add(imageClass);
	}

	// enable(): this {
	// 	if (!this.img) {
	// 		// eslint-disable-next-line no-console
	// 		console.warn(
	// 			'No related image found.\n'
	// 			+ 'Associate an <img> with your <details> via aria-details.',
	// 			this.details,
	// 		);
	// 		return this;
	// 	}

	// 	if (!this.enabled) {
	// 		if (!this.summary) {
	// 			addDefaultSummary.call(this);
	// 		}
	// 		this.hasContents = this.details.lastChild !== this.summary;
	// 		describeSummary.call(this);
	// 		createContents.call(this);

	// 		if (this.copyAlt) {
	// 			addAltText.call(this);
	// 		}

	// 		this.transitionHandler.enable().bindTo('.detailed-marker');
	// 		this.contents.addEventListener('mousedown', this.dragstartHandler);
	// 		document.addEventListener('mouseup', this.dragendHandler);
	// 		document.addEventListener('mousemove', this.dragHandler);
	// 		this.details.addEventListener('toggle', this.toggleHandler);
	// 		this.details.addEventListener('closeend', this.closeendHandler);
	// 		this.summary.addEventListener('keydown', this.keydownHandler);
	// 		this.img.addEventListener('click', this.clickHandler);
	// 		this.enabled = true;
	// 	}
	// 	return this;
	// }

	// disable() {
	// 	if (this.enabled) {
	// 		this.transitionHandler.disable();
	// 		this.enabled = false;
	// 	}
	// 	return this;
	// }

	// destroy() {
	// 	if (this.enabled) this.disable();
	// 	this.transitionHandler.destroy();
	// 	instances.delete(this);
	// 	return this;
	// }

	// resetPosition() {
	// 	this.pos = {
	// 		top: 0,
	// 		left: 0,
	// 	};
	// }

	// // PROPERTIES

	// get copyAlt() {
	// 	return !(
	// 		this.details.getAttribute('data-noalt') !== null
	// 		|| this.options.noalt
	// 	);
	// }

	// get open() {
	// 	return this.details.open;
	// }

	// get dragging() {
	// 	return this.details.classList.contains('detailed-dragging');
	// }

	// get isValid() {
	// 	return Boolean(this.img);
	// }

	// get pos() {
	// 	const style = getComputedStyle(this.details);
	// 	const top = parseInt(style.top, 10);
	// 	const left = parseInt(style.left, 10);
	// 	return { top, left };
	// }

	// set pos({ top, left }) {
	// 	this.details.style.top = `${top}px`;
	// 	this.details.style.left = `${left}px`;
	// }

	// // STATIC METHODS (PRIMARY API)

	// static get instances() {
	// 	return instances;
	// }

	// static get Defaults() {
	// 	return Defaults;
	// }

	// static enhance(detailsElement, options = {}) {
	// 	const d = new Detailed(detailsElement, options);
	// 	d.enable();
	// 	return d;
	// }

	// static enhanceAll(selector, options = {}) {
	// 	let sel;
	// 	let opts;
	// 	if (typeof selector === 'string') {
	// 		sel = selector;
	// 		opts = options;
	// 	} else {
	// 		sel = Detailed.Defaults.selector;
	// 		opts = selector;
	// 	}
	// 	document.querySelectorAll(sel).forEach((el) => {
	// 		Detailed.enhance(el, opts);
	// 	});
	// 	return Detailed.instances;
	// }
}
