import { render, useState } from '../stage-4';

const Heading = ({ message }: { message: string }) => {
	return <h1>Hello, {message}!</h1>;
};

const Counter = () => {
	const [value, setValue] = useState(0);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				gap: '8px',
				color: value % 2 === 0 ? 'black' : 'green',
			}}
		>
			<p>Counter: {value}</p>
			<button type="button" onClick={() => setValue((v) => v + 1)}>
				Increment
			</button>
		</div>
	);
};

const container = document.getElementById('root')!;

render(
	<main data-stage="stage-3" className="test">
		<Heading message="World" />
		<Counter />
		<p>This is a custom Virtual DOM!</p>
	</main>,
	container,
);
