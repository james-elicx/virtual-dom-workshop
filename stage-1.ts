type FunctionComponent = (props: Record<string, unknown>) => Node;

export type Node = {
	type: 'TEXT_ELEMENT' | string | FunctionComponent;
	props: Record<string, unknown>;
	key?: string | null;
};

const createNode = (
	type: string | FunctionComponent,
	props: Record<string, unknown>,
	key: string | null = null,
): Node => {
	throw new Error('Not implemented');
};

export { createNode as jsx, createNode as jsxs, createNode as jsxDEV };
