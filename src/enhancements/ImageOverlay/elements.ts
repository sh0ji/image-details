import { SVGIcon } from '../../utilities';

export interface SVGOptions extends SVGIcon {
	iconClass?: string;
}

export const createSVG = ({
	iconClass,
	viewBox,
	d,
	source,
}: SVGOptions): SVGSVGElement => {
	const outer = document.createElement('div');
	outer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"
		${iconClass && `class="${iconClass}"`}
		aria-hidden="true"
		focusable="false"
		role="img"
		viewBox="${viewBox}"
	>
		${source && `<!-- ${source} -->`}
		<path fill="currentColor" d="${d}" />
	</svg>`.replace(/[\t\n]/g, '');
	return outer.firstElementChild as SVGSVGElement;
};

interface SummaryTextNodeOptions {
	className?: string;
	contents: string;
}

const updateSpan = (node: HTMLSpanElement, {
	className,
	contents = '',
}: SummaryTextNodeOptions): HTMLSpanElement => {
	/* eslint-disable no-param-reassign */
	if (className) node.className = className;
	node.textContent = contents;
	return node;
};

const createSpan = (
	opts: SummaryTextNodeOptions,
): HTMLSpanElement => updateSpan(document.createElement('span'), opts);

export interface SummaryOptions {
	className?: string;
	icon?: SVGIcon;
	text?: string | HTMLElement;
	iconClass?: string;
	textClass?: string;
}

export const updateSummary = (summary: HTMLElement, {
	className,
	icon,
	text,
	iconClass,
	textClass,
}: SummaryOptions): HTMLElement => {
	if (className) summary.classList.add(className);
	const summaryContents = [];
	if (icon) {
		const svg = createSVG({ iconClass, ...icon });
		summaryContents.push(svg);
	}
	if (text) {
		if (text instanceof HTMLElement) {
			summaryContents.push(text);
		} else {
			const textOpts = { className: textClass, contents: text };
			const currentNode = summary.querySelector<HTMLSpanElement>(`span.${textClass}`);
			const textNode = (currentNode)
				? updateSpan(currentNode, textOpts)
				: createSpan(textOpts);
			summaryContents.push(textNode);
		}
	}
	summary.append(...summaryContents);

	return summary;
};

export const createSummary = (
	opts: SummaryOptions,
): HTMLElement => updateSummary(document.createElement('summary'), opts);
