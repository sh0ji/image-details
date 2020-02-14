/** All of the HTML attributes that can be used to reference a description. */
export enum DescriptionAttribute {
	ARIA_DETAILS = 'aria-details',
	ARIA_DESCRIBEDBY = 'aria-describedby',
	LONGDESC = 'longdesc',
}

export type Description = HTMLElement | DocumentFragment | string | null;
export type DescriptionTuple = [DescriptionAttribute, Description];
export type DescriptionRecord = Record<DescriptionAttribute, Description>;

/** Take an attribute value and return a Promised description. */
export type DescriptionParser = (
	attrVal: string,
) => Promise<Description>;

/** Define a description parser for a specified attribute. */
export interface AttributeParser {
	attr: DescriptionAttribute;
	parser: DescriptionParser;
}

/**
 * Parser for the `aria-details` attribute.
 *
 * Returns the `HTMLElement` that `aria-details` references if it exists.
 */
export const ariaDetails: AttributeParser = {
	attr: DescriptionAttribute.ARIA_DETAILS,
	parser: async (val: string) => document.getElementById(val),
};

/**
 * Parser for the `longdesc` attribute.
 *
 * If `longdesc` references a same-page element, returns that `HTMLElement`.
 * If `longdesc` references a different document, returns that document inside
 * a `DocumentFragment`
 */
export const longdesc: AttributeParser = {
	attr: DescriptionAttribute.LONGDESC,
	parser: async (ref: string) => {
		if (ref.startsWith('#')) return document.querySelector(ref) as HTMLElement;
		const res = await fetch(ref);
		if (res.status === 200) {
			const html = await res.json();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');
			const frag = new DocumentFragment();
			Array.from(doc.body.children).forEach((node) => {
				frag.appendChild(node);
			});
			return frag;
		}
		return null;
	},
};

/**
 * Parser for the `aria-describedby` attribute.
 *
 * Returns the description as a text string if it exists.
 */
export const ariaDescribedby: AttributeParser = {
	attr: DescriptionAttribute.ARIA_DESCRIBEDBY,
	parser: async (ref: string) => {
		const el = document.getElementById(ref);
		if (el) return el.textContent;
		return null;
	},
};

/** Get the image description with the specified attribute parser. */
export const getDescription = (
	image: HTMLImageElement,
	{ attr, parser }: AttributeParser,
): ReturnType<DescriptionParser> => {
	const val = image.getAttribute(attr);
	if (!val) return Promise.resolve(null);
	return parser(val);
};

/**
 * Get image descriptions for all attribute parsers.
 *
 * The resulting array will have pairs of `[attr, description]`.
 */
export const getAllDescriptions = (
	image: HTMLImageElement,
): Promise<DescriptionTuple[]> => {
	const allParsers = [
		ariaDescribedby,
		ariaDetails,
		longdesc,
	];

	return Promise.all(allParsers.map(async ({
		attr,
		parser,
	}): Promise<[DescriptionAttribute, Description]> => [
		attr,
		await getDescription(image, { attr, parser }),
	]));
};

/** Turn a `Description` into an HTML string. */
export const flattenDescription = (description: Description): string | null => {
	if (!description) return null;
	if (typeof description === 'string') return description;
	if (description instanceof HTMLElement) return description.innerHTML;
	const el = document.createElement('div');
	el.appendChild(description);
	return el.innerHTML;
};
