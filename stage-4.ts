import type { Node } from './stage-1';

const updateElementProperties = (
	domElement: HTMLElement | Text,
	newProps: Record<string, unknown>,
	oldProps: Record<string, unknown>,
) => {
	for (const name of Object.keys(oldProps)) {
		if (name === 'children' || (name in newProps && !name.startsWith('on'))) {
			if (
				name === 'style' &&
				!!newProps[name] &&
				typeof newProps[name] === 'object' &&
				typeof oldProps[name] === 'object'
			) {
				for (const styleName of Object.keys(
					oldProps.style as Record<string, string>,
				)) {
					if (!(styleName in newProps[name])) {
						// @ts-expect-error - We are assigning (unknown) dynamic properties here
						domElement.style[styleName] = '';
					}
				}
			}

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
		} else if (name === 'style' && !!value && typeof value === 'object') {
			for (const [styleName, styleValue] of Object.entries(value)) {
				// @ts-expect-error - We are assigning (unknown) dynamic properties here
				domElement.style[styleName] = styleValue;
			}
		} else {
			// @ts-expect-error - We are assigning (unknown) dynamic properties here
			domElement[name] = value;
		}
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

export const useState = <T>(
	initialValue: T,
): [T, (newValue: T | ((v: T) => T)) => void] => {
	throw new Error('Not implemented');
};

const rerender = (node_?: Node) => {
	if (!root) {
		throw new Error('Cannot render without a container on the first call.');
	}

	const node = node_ ?? (root.props.children as Node[])[0]!;

	renderChildren(root, deepCloneNode(root), [node]);

	root.props.children = [node];
};

export const render = (node: Node, container?: HTMLElement) => {
	if (container) {
		root = {
			type: container.tagName.toLowerCase(),
			props: { children: [] },
			dom: container,
		};
	}

	rerender(node);
};

const deepCloneNode = (node: Node): Node => {
	return {
		...node,
		props: {
			...node.props,
			children: Array.isArray(node.props.children)
				? node.props.children.map((child) => deepCloneNode(child as Node))
				: node.props.children,
		},
		// hooks: node.hooks ? [...node.hooks] : undefined,
	};
};
