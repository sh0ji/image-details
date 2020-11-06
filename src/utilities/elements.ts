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
