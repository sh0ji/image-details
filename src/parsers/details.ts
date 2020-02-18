export interface DetailsContents {
	summary: HTMLElement | null;
	contents: HTMLElement | ChildNode[] | null;
}

const parse = async (details: HTMLDetailsElement): Promise<DetailsContents> => {
	const summary = details.querySelector('summary');
	let contents: null | HTMLElement | ChildNode[];

	const startingNode = (summary) ? summary.nextSibling : details.firstChild;

	// return the startingNode if it doesn't exist or it's the only HTMLElement
	if (
		(startingNode === null)
		|| (startingNode instanceof HTMLElement && startingNode.nextSibling === null)
	) {
		contents = startingNode;
	} else {
		// otherwise, collect all sibling nodes into a DocumentFragment
		contents = [] as ChildNode[];
		let current = startingNode;
		while (current.nextSibling) {
			contents.push(current.nextSibling);
			current = current.nextSibling;
		}
	}

	return { summary, contents };
};

export default parse;
