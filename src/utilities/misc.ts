const styleString = (
	style: Record<string, string | null>,
): string => Object.keys(style).reduce((a, attr) => {
	const val = style[attr];
	return (val) ? `${a} ${attr}: ${val};` : a;
}, '').trim();

export const setStyle = (el: HTMLElement, style: Parameters<typeof styleString>[0]): void => {
	el.setAttribute('style', styleString(style));
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};
