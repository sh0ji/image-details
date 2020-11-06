export const iconPath = {
	/** https://material.io/resources/icons/?icon=details&style=baseline */
	details: 'M3 4l9 16 9-16H3zm3.38 2h11.25L12 16 6.38 6z',
	/** https://material.io/resources/icons/?icon=close&style=baseline */
	close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
	/** https://material.io/resources/icons/?icon=north_east&style=baseline */
	northEast: 'M9,5v2h6.59L4,18.59L5.41,20L17,8.41V15h2V5H9z',
};

export const createIcon = (isOpen = false): SVGSVGElement => {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('role', 'img');
	svg.setAttribute('viewBox', '0 0 24 24');
	svg.setAttribute('focusable', 'false');

	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
	path.setAttribute('fill', 'currentColor');
	path.setAttribute('d', (isOpen) ? iconPath.close : iconPath.northEast);

	svg.append(path);
	return svg;
};
