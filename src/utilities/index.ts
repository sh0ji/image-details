export * from './description';
export * from './elements';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};

const styleString = (
	style: Record<string, string | null>,
): string => Object.keys(style).reduce((a, attr) => {
	const val = style[attr];
	return (val) ? `${a} ${attr}: ${val};` : a;
}, '').trim();

export const setStyle = (el: HTMLElement, style: Parameters<typeof styleString>[0]): void => {
	el.setAttribute('style', styleString(style));
};

export const srOnly = (el: HTMLElement): void => setStyle(el, {
	position: 'absolute',
	width: '1px',
	height: '1px',
	padding: '0',
	margin: '-1px',
	overflow: 'hidden',
	clip: 'rect(0, 0, 0, 0)',
	whiteSpace: 'nowrap',
	border: '0',
});
