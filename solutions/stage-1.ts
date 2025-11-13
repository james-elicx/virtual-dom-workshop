type FunctionComponent = (props: Record<string, unknown>) => Node;

export type Node = {
	type: 'TEXT_ELEMENT' | string | FunctionComponent;
	props: Record<string, unknown>;
	key?: string | null;
	dom?: HTMLElement | Text;
	funcNode?: Node;
	hooks?: { state: any; actions: any[] }[];
};

const createNode = (
	type: string | FunctionComponent,
	props: Record<string, unknown>,
	key: string | null = null,
): Node => {
	const children = Array.isArray(props.children)
		? props.children
		: [props.children].filter((c) => c !== undefined);

	return {
		type: type,
		props: {
			...props,
			children: children.map((c) => {
				if (typeof c === 'object') {
					return c;
				}

				// string, number, etc.
				return createNode('TEXT_ELEMENT', { nodeValue: c });
			}),
		},
		key,
	};
};

export { createNode as jsx, createNode as jsxs, createNode as jsxDEV };
