import type { Node } from './stage-1';

const updateElementProperties = (
	domElement: HTMLElement | Text,
	newProps: Record<string, unknown>,
	oldProps: Record<string, unknown>,
) => {
	for (const name of Object.keys(oldProps)) {
		throw new Error('Not implemented');
	}

	for (const [name, value] of Object.entries(newProps)) {
		throw new Error('Not implemented');
	}
};

const renderChildren = (
	newNode: Node,
	oldNode: Node | undefined,
	children: Node[],
) => {
	throw new Error('Not implemented');
};

let root: Node | undefined;

export const render = (node: Node, container?: HTMLElement) => {
	if (container) {
		root = {
			type: container.tagName.toLowerCase(),
			props: { children: [] },
			dom: container,
		};
	}

	if (!root) {
		throw new Error('Cannot render without a container on the first call.');
	}

	renderChildren(root, root, [node]);

	root.props.children = [node];
};
