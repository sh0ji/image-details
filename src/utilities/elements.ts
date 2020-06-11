export interface SVGIcon {
	d: string;
	viewBox: string;
	source?: string;
}

const materialViewBox = '0 0 24 24';

export const icons: Record<string, SVGIcon> = {
	details: {
		d: 'M3 4l9 16 9-16H3zm3.38 2h11.25L12 16 6.38 6z',
		viewBox: materialViewBox,
		source: 'https://material.io/resources/icons/?icon=details&style=baseline',
	},
	close: {
		d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
		viewBox: materialViewBox,
		source: 'https://material.io/resources/icons/?icon=close&style=baseline',
	},
};

interface IconOptions {
	label?: string;
	className?: string;
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export const createIcon = (
	{ viewBox, d, source }: SVGIcon,
	{ label, className }: IconOptions = {},
): SVGSVGElement => {
	const attributes: [string, string][] = [
		['xmlns', SVG_NAMESPACE],
		['focusable', 'false'],
		['role', 'img'],
		['viewBox', viewBox],
	];
	attributes.push((label) ? ['aria-label', label] : ['aria-hidden', 'true']);
	if (className) attributes.push(['class', className]);

	const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
	attributes.forEach((attr) => svg.setAttribute(...attr));

	if (source) svg.append(document.createComment(source));

	const path = document.createElementNS(SVG_NAMESPACE, 'path');
	path.setAttribute('fill', 'currentColor');
	path.setAttribute('d', d);

	svg.append(path);

	return svg;
};

export const focusableSelectors = [
	'[contentEditable=true]:not([tabindex="-1"])',
	'[tabindex]:not([tabindex="-1"])',
	'a[href]:not([tabindex="-1"])',
	'button:not([disabled]):not([tabindex="-1"])',
	'dialog',
	'embed:not([tabindex="-1"])',
	'iframe:not([tabindex="-1"])',
	'input:not([disabled]):not([tabindex="-1"])',
	'map[name] area[href]:not([tabindex="-1"])',
	'object:not([tabindex="-1"])',
	'select:not([disabled]):not([tabindex="-1"])',
	'summary:not([tabindex="-1"])',
	'textarea:not([disabled]):not([tabindex="-1"])',
];

export const getFocusable = (
	el: HTMLElement | Document | ShadowRoot = document,
): NodeListOf<HTMLElement> => el.querySelectorAll(focusableSelectors.join(','));

export const appendContent = (to: HTMLElement, ...contents: (string | Node)[]): void => {
	contents.forEach((content) => {
		if (typeof content === 'string') {
			const div = document.createElement('div');
			div.innerHTML = content;
			to.append(div.firstChild as ChildNode);
		} else {
			to.append(content);
		}
	});
};
