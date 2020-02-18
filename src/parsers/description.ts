/** All of the HTML attributes that can be used to reference a description. */
export enum DescriptionAttribute {
	ARIA_DETAILS = 'aria-details',
	ARIA_DESCRIBEDBY = 'aria-describedby',
	LONGDESC = 'longdesc',
}

export type Description = (HTMLElement | ChildNode)[] | string | null;
export type DescriptionTuple = [DescriptionAttribute, Description];
export type DescriptionRecord = Record<DescriptionAttribute, Description>;

/** Take an attribute value and return a Promised description. */
export type DescriptionParser = (attrVal: string) => Promise<Description>;

/** Define a description parser for a specified attribute. */
export interface AttributeParser {
	attr: DescriptionAttribute;
	parser: DescriptionParser;
}

const fromEl = (node: HTMLElement | null): HTMLElement[] | null => ((node) ? [node] : null);

const filterTagNames = (...tagNames: string[]) => (n: Node): boolean => {
	if (n instanceof HTMLElement) {
		return tagNames.some((tagName) => tagName.toUpperCase() === n.tagName.toUpperCase());
	}
	return false;
};

type NodeFilter = (n: Node) => boolean;

/** Fetch an array of nodes from a given url. Returns `null` if nothing is found. */
export const fetchNodes = async (
	url: string,
	init?: Parameters<typeof fetch>[1],
	filters: NodeFilter[] = [
		filterTagNames('script', 'style'),
	],
): Promise<(HTMLElement | ChildNode)[] | null> => {
	const req = new Request(url);
	const { hash, origin, pathname } = new URL(req.url);
	const currentPage = window.location.origin + window.location.pathname;

	// same-page reference
	if ((origin + pathname) === currentPage) {
		return fromEl(document.querySelector<HTMLElement>(hash));
	}

	// reference to another page
	const res = await fetch(req, init);
	if (res.status === 200) {
		const html = await res.text();

		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');

		// a fragment on another page
		if (hash) return fromEl(doc.querySelector<HTMLElement>(hash));

		// the body doesn't have any contents
		if (doc.body.firstChild === null) return null;

		const contents: ChildNode[] = [];
		Array.from(doc.body.childNodes).forEach((node) => {
			if (!filters.some((test) => test(node))) {
				contents.push(node);
			}
		});
		return contents;
	}

	return null;
};

/**
 * Parser for the `aria-details` attribute.
 *
 * Returns the `HTMLElement` that `aria-details` references if it exists.
 */
export const ariaDetails: AttributeParser = {
	attr: DescriptionAttribute.ARIA_DETAILS,
	parser: async (val: string) => fromEl(document.getElementById(val)),
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
	parser: fetchNodes,
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

/** Turn a `Description` into an HTML string. */
export const flattenDescription = (description: Description): string | null => {
	if (!description) return null;
	if (typeof description === 'string') return description;
	const el = document.createElement('div');
	description.forEach((node) => {
		el.append(node.cloneNode(true));
	});
	return el.innerHTML;
};

/**
 * Get image descriptions for all attribute parsers.
 *
 * The resulting array will have pairs of `[attr, description]`.
 */
export const getAllDescriptions = (
	image: HTMLImageElement,
	/** Indicates that descriptions should be flattened to HTML strings. */
	htmlStrings = false,
): Promise<DescriptionTuple[]> => {
	const allParsers = [ariaDescribedby, ariaDetails, longdesc];

	return Promise.all(
		allParsers.map(
			async ({ attr, parser }): Promise<[DescriptionAttribute, Description]> => {
				const desc = await getDescription(image, { attr, parser });
				return [attr, (htmlStrings) ? flattenDescription(desc) : desc];
			},
		),
	);
};
