import type { Node } from './stage-1';

const updateElementProperties = (
	domElement: HTMLElement | Text,
	newProps: Record<string, unknown>,
	oldProps: Record<string, unknown>,
) => {
	for (const name of Object.keys(oldProps)) {
		if (name === 'children' || (name in newProps && !name.startsWith('on'))) {
			continue;
		}

		if (name.startsWith('on')) {
			const eventType = name.slice(2).toLowerCase();

			domElement.removeEventListener(
				eventType,
				oldProps[name] as EventListener,
			);
		} else if (name.startsWith('data-') && 'removeAttribute' in domElement) {
			domElement.removeAttribute(name);
		} else {
			// @ts-expect-error - We are assigning (unknown) dynamic properties here
			domElement[name] = '';
		}
	}

	for (const [name, value] of Object.entries(newProps)) {
		if (name === 'children' || oldProps[name] === value) {
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

	updateElementProperties(domElement, node.props, {});

	return domElement;
};

const renderChildren = (
	newNode: Node,
	oldNode: Node | undefined,
	children: Node[],
) => {
	const oldChildren = (oldNode?.props.children as Node[] | undefined) ?? [];

	for (let i = 0; i < Math.max(children.length, oldChildren.length); i++) {
		const oldChild_ = oldChildren[i];
		const newChild_ = children[i];

		if (typeof newChild_?.type === 'function') {
			newChild_.funcNode = newChild_.type(newChild_.props);
		}

		const oldChild = oldChild_?.funcNode ?? oldChild_;
		const newChild = newChild_?.funcNode ?? newChild_;

		const areSameType =
			!!oldChild && !!newChild && oldChild.type === newChild.type;

		if (areSameType && oldChild.dom) {
			updateElementProperties(oldChild.dom, newChild.props, oldChild.props);
		}

		if (!areSameType && oldNode?.dom && oldChild?.dom) {
			oldNode.dom.removeChild(oldChild.dom);
		}

		if (newChild) {
			renderNode(newChild, oldChild);

			if (!areSameType && newNode.dom) {
				newNode.dom.appendChild(newChild.dom!);
			}
		}
	}
};

const renderNode = (newNode: Node, oldNode?: Node) => {
	if (!newNode.dom) {
		newNode.dom = oldNode?.dom ?? createDOMElement(newNode);
	}

	renderChildren(newNode, oldNode, newNode.props.children as Node[]);
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
