const omitTags = (...tagNames: string[]) => (n: Node): boolean => {
	if (n instanceof HTMLElement) {
		return !tagNames.some((tagName) => tagName.toUpperCase() === n.tagName.toUpperCase());
	}
	return true;
};

type NodeFilter = (n: Node) => boolean;

const filterNode = <T extends Node = HTMLElement>(
	node: T | null,
	filters: NodeFilter[],
): T | null => ((node && filters.some((test) => test(node))) ? node : null);

/**
 * Fetch an element from a given url. If the URL is a whole document, the entire
 * body will be returned inside a `DocumentFragment`. Returns `null` if nothing
 * is found.
 */
export const fetchElement = async (
	url: string,
	init?: Parameters<typeof fetch>[1],
	filters: NodeFilter[] = [
		omitTags('script', 'style'),
	],
): Promise<HTMLElement | DocumentFragment | null> => {
	const req = new Request(url);
	const { hash, origin, pathname } = new URL(req.url);
	const currentPage = window.location.origin + window.location.pathname;

	// same-page reference
	if ((origin + pathname) === currentPage) {
		return filterNode<HTMLElement>(document.querySelector(hash), filters);
	}

	// reference to another page
	const res = await fetch(req, init);
	if (res.status === 200) {
		const html = await res.text();

		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');

		// a fragment on another page
		if (hash) {
			return filterNode<HTMLElement>(document.querySelector(hash), filters);
		}

		// the body doesn't have any contents
		if (doc.body.firstChild === null) return null;

		const contents = new DocumentFragment();
		Array.from(doc.body.childNodes).forEach((node) => {
			if (filters.some((test) => test(node))) {
				contents.append(node);
			}
		});
		return contents;
	}

	return null;
};

/** All of the HTML attributes that can be used to reference a description. */
export enum DescriptionAttribute {
	ARIA_DETAILS = 'aria-details',
	ARIA_DESCRIBEDBY = 'aria-describedby',
	LONGDESC = 'longdesc',
}

export class Describer {
	public attr: DescriptionAttribute;
	public parser: (val: string) => Promise<HTMLElement | null>;

	public constructor(attr: DescriptionAttribute) {
		this.attr = attr;

		switch (attr) {
			case DescriptionAttribute.ARIA_DETAILS:
			case DescriptionAttribute.ARIA_DESCRIBEDBY:
				this.parser = async (
					val: string,
				): Promise<HTMLElement | null> => {
					const el = document.getElementById(val);
					if (el) return el.cloneNode(true) as HTMLElement;
					return null;
				};
				break;
			case DescriptionAttribute.LONGDESC:
				this.parser = async (val: string): Promise<HTMLElement | null> => {
					const contents = await fetchElement(val);
					if (contents instanceof DocumentFragment) {
						const el = document.createElement('div');
						el.append(contents);
						return el;
					}
					return contents;
				};
				break;
			default:
				throw new Error(`${attr} is not a valid descriptions attribute.`);
		}
	}

	public async getDescription(el: HTMLElement): Promise<HTMLElement | null> {
		const val = el.getAttribute(this.attr);
		if (!val) return Promise.resolve(null);
		return this.parser(val);
	}

	public static async get(
		el: HTMLElement,
		attr: DescriptionAttribute,
	): Promise<HTMLElement | null> {
		return new Describer(attr).getDescription(el);
	}
}

export interface Description {
	attr: DescriptionAttribute | null;
	desc: HTMLElement | null;
}

/**
 * Get the image's long description.
 * Look for description attributes on the image and return the value of the
 * description. Attribute preference is `aria-details` > `longdesc` >
 * `aria-describedby`.
 */
export const getDescription = async (el: HTMLElement): Promise<Description> => {
	let attr = null;
	// 1. aria-details
	let desc = await Describer.get(el, DescriptionAttribute.ARIA_DETAILS);
	if (desc) {
		attr = DescriptionAttribute.ARIA_DETAILS;
	}

	// 2. longdesc
	if (!attr) {
		desc = await Describer.get(el, DescriptionAttribute.LONGDESC);
		if (desc) attr = DescriptionAttribute.LONGDESC;
	}

	// 3. aria-describedby
	if (!attr) {
		desc = await Describer.get(el, DescriptionAttribute.ARIA_DESCRIBEDBY);
		if (desc) attr = DescriptionAttribute.ARIA_DESCRIBEDBY;
	}

	return { attr, desc };
};
