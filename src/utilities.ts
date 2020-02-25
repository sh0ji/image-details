export const styleString = (
	style: Record<string, string | null>,
): string => Object.keys(style).reduce((a, attr) => {
	const val = style[attr];
	return (val) ? `${a} ${attr}: ${val};` : a;
}, '');

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = (): void => {};

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
