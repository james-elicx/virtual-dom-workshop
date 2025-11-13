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

const createDOMElement = (node: Node): HTMLElement | Text => {
	const domElement =
		node.type === 'TEXT_ELEMENT'
			? document.createTextNode('')
			: document.createElement(node.type as string);

	updateElementProperties(domElement, node.props, {});

	return domElement;
};

let oldFuncNode: Node | undefined;
let newFuncNode: Node | undefined;
let hookIndex = 0;

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
			oldFuncNode = oldChild_;
			newFuncNode = newChild_;
			newChild_.hooks = [];
			hookIndex = 0;

			newChild_.funcNode = newChild_.type(newChild_.props);
			newChild_.hooks = newFuncNode.hooks;

			oldFuncNode = undefined;
			newFuncNode = undefined;
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

export const useState = <T>(
	initialValue: T,
): [T, (newValue: T | ((v: T) => T)) => void] => {
	if (!newFuncNode) {
		throw new Error('useState can only be called within a function component.');
	}

	const oldHook = oldFuncNode?.hooks?.[hookIndex];
	const hook: NonNullable<Node['hooks']>[number] = {
		state: oldHook ? oldHook.state : initialValue,
		actions: [],
	};

	oldHook?.actions?.forEach((action: T | ((v: T) => T)) => {
		const newValue =
			typeof action === 'function'
				? (action as (v: T) => T)(hook.state)
				: action;

		hook.state = newValue;
	});

	const setState = (newValue: T | ((v: T) => T)) => {
		hook.actions.push(newValue);
		rerender();
	};

	if (!newFuncNode.hooks) {
		newFuncNode.hooks = [];
	}
	newFuncNode.hooks.push(hook);
	hookIndex++;

	return [hook.state, setState];
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
		hooks: node.hooks ? [...node.hooks] : undefined,
	};
};
