import { getAllDescriptions, DescriptionRecord } from './description';

export interface ImageDetails {
	alt: string | null;
	hasLongDescription: boolean;
	descriptions: Partial<DescriptionRecord>;
}

export interface ImageParserOptions {
	validateAlt?: boolean;
}

class ImageParser {
	public options: Required<ImageParserOptions>;

	constructor({
		validateAlt = true,
	}: ImageParserOptions = {}) {
		this.options = {
			validateAlt,
		};
	}

	public async parse(image: HTMLImageElement): Promise<ImageDetails> {
		const { validateAlt } = this.options;

		const d = await getAllDescriptions(image);
		const hasLongDescription = d.some(([, desc]) => desc);
		const descriptions: Partial<DescriptionRecord> = {};
		d.forEach(([attr, desc]) => {
			if (desc) {
				descriptions[attr] = desc;
			}
		});

		const details: ImageDetails = {
			alt: image.getAttribute('alt'),
			hasLongDescription,
			descriptions,
		};

		if (validateAlt) {
			// TODO: implement alt text validation
		}

		return details;
	}
}

export const parse = (
	image: HTMLImageElement,
	options?: ImageParserOptions,
): Promise<ImageDetails> => {
	const parser = new ImageParser(options);
	return parser.parse(image);
};

export default ImageParser;
