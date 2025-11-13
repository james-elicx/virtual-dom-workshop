import type { Node } from './stage-1';

const updateElementProperties = (
	domElement: HTMLElement | Text,
	newProps: Record<string, unknown>,
) => {
	for (const [name, value] of Object.entries(newProps)) {
		if (name === 'children') {
			continue;
		}

		if (name.startsWith('on')) {
			const eventType = name.slice(2).toLowerCase();

			domElement.addEventListener(eventType, value as EventListener);
		} else if (name.startsWith('data-') && 'setAttribute' in domElement) {
			domElement.setAttribute(name, String(value));
		} else {
			// @ts-expect-error - We are assigning (unknown) dynamic properties here
			domElement[name] = value;
		}
	}
};

const createDOMElement = (node: Node): HTMLElement | Text => {
	const domElement =
		node.type === 'TEXT_ELEMENT'
			? document.createTextNode('')
			: document.createElement(node.type as string);

	updateElementProperties(domElement, node.props);

	return domElement;
};

const renderChildren = (newNode: Node, children: Node[]) => {
	for (const child of children) {
		if (typeof child.type === 'function') {
			child.funcNode = child.type(child.props);
		}

		renderNode(child);

		if (newNode.dom && child.dom) {
			newNode.dom.appendChild(child.dom);
		}
	}
};

const renderNode = (newNode: Node) => {
	if (!newNode.dom) {
		newNode.dom = createDOMElement(newNode);
	}

	renderChildren(newNode, newNode.props.children as Node[]);
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

	renderChildren(root, [node]);

	root.props.children = [node];
};
