import { DescriptionAttribute } from '../../utilities';

interface EnhanceAllOptions {
	selector?: string;
}

interface ImageModalOptions {
	foo?: string;
}

/**
 * TODO: implement an enhancement that displays the image and its description in
 * a modal dialog interface.
 */
export class ImageModal {
	private static Instances = new Set<ImageModal>();

	protected constructor(
		public image: HTMLImageElement,
		public options: Required<ImageModalOptions>,
	) {
		ImageModal.Instances.add(this);
	}

	}

	public static selector = 'img';

	public static get instances(): ImageModal[] {
		return Array.from(ImageModal.Instances);
	}

	public static async enhance(
		image: HTMLImageElement,
		options?: Partial<ImageModal['options']>,
	): Promise<ImageModal | null> {
		const opts = {
			...ImageModal.defaultOptions,
			...options,
		};
		const hasDesc = Object.values(DescriptionAttribute).some((attr) => image.getAttribute(attr));
		if (!hasDesc && !image.alt) return null;
		const instance = new ImageModal(image, opts);
		await instance.enable();
		return instance;
	}

	public static async enhanceAll({
		selector = ImageModal.selector,
		...options
	}: EnhanceAllOptions = {}): Promise<typeof ImageModal.instances> {
		await Promise.all(Array.from(document.querySelectorAll<HTMLImageElement>(selector))
			.map(async (el) => ImageModal.enhance(el, options)));
		return ImageModal.instances;
	}

	public static defaultOptions: Required<ImageModalOptions> = {
		foo: '',
	}
}
