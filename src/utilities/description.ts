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

/* eslint-disable no-shadow */
/** All of the HTML attributes that can be used to reference a description. */
export enum DescriptionAttribute {
	ARIA_DETAILS = 'aria-details',
	ARIA_DESCRIBEDBY = 'aria-describedby',
	LONGDESC = 'longdesc',
}
/* eslint-enable no-shadow */

export interface Description {
	attr: DescriptionAttribute | null;
	value: HTMLElement | null;
}

export const getDescriptionByAttr = async (
	el: HTMLElement,
	attr: DescriptionAttribute,
): Promise<HTMLElement | null> => {
	const attrValue = el.getAttribute(attr);
	if (!el.hasAttribute(attr) || !attrValue) return null;

	// longdesc: retrieve the description from a separate document
	if (attr === DescriptionAttribute.LONGDESC) {
		const contents = await fetchElement(attrValue);
		if (contents instanceof DocumentFragment) {
			const desc = document.createElement('div');
			desc.append(contents);
			return desc;
		}
		return contents;
	}

	const ref = document.getElementById(attrValue);
	if (ref) return ref.cloneNode(true) as HTMLElement;
	return null;
};

/**
 * Get the image's long description.
 * Look for description attributes on the image and return the value of the
 * description. Attribute preference is `aria-details` > `longdesc` >
 * `aria-describedby`.
 */
export const getDescription = async (el: HTMLElement): Promise<Description[]> => Promise.all(
	Object.values(DescriptionAttribute)
		.filter((attr) => el.hasAttribute(attr))
		.map(async (attr) => ({
			attr,
			value: await getDescriptionByAttr(el, attr),
		})),
);
