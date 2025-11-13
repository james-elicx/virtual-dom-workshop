import type { Node } from './stage-1';

const updateElementProperties = (
	domElement: HTMLElement | Text,
	newProps: Record<string, unknown>,
) => {
	for (const [name, value] of Object.entries(newProps)) {
		throw new Error('Not implemented');
	}
};

const renderChildren = (newNode: Node, children: Node[]) => {
	for (const child of children) {
		throw new Error('Not implemented');
	}
};

let root: Node | undefined;

export const render = (node: Node, container?: HTMLElement) => {
	if (container) {
		root = {
			type: container.tagName.toLowerCase(),
			props: { children: [] },
		};
	}

	if (!root) {
		throw new Error('Cannot render without a container on the first call.');
	}

	renderChildren(root, [node]);

	root.props.children = [node];
};
