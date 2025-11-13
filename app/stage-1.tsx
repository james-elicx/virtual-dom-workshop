const Heading = ({ message }: { message: string }) => {
	return <h1>Hello, {message}!</h1>;
};

console.log(
	Bun.inspect(
		<main data-stage="stage-1" className="test">
			<Heading message="World" />
			<p>This is a custom Virtual DOM!</p>
		</main>,
	),
);
