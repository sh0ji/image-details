import { getAllDescriptions, DescriptionRecord } from './description';

export interface ImageContents {
	alt: string | null;
	hasLongDescription: boolean;
	descriptions: Partial<DescriptionRecord>;
}

const parse = async (image: HTMLImageElement): Promise<ImageContents> => {
	const d = await getAllDescriptions(image);
	const hasLongDescription = d.some(([, desc]) => desc);
	const descriptions: Partial<DescriptionRecord> = {};
	d.forEach(([attr, desc]) => {
		if (desc) {
			descriptions[attr] = desc;
		}
	});

	return {
		alt: image.getAttribute('alt'),
		hasLongDescription,
		descriptions,
	};
};

export default parse;
