import { render } from '../stage-2';

const Heading = ({ message }: { message: string }) => {
	return <h1>Hello, {message}!</h1>;
};

const container = document.getElementById('root')!;

const addElement = () => {
	render(
		<main data-stage="stage-3" className="test">
			<button type="button" onClick={addElement}>
				Update DOM again!
			</button>
			<Heading message="World" />
			<p>This paragraph was rerendered into the DOM - {Date.now()}.</p>
			<p>This is a custom Virtual DOM!</p>
		</main>,
	);
};

render(
	<main data-stage="stage-3" className="test">
		<button type="button" onClick={addElement}>
			Update DOM
		</button>
		<Heading message="World" />
		<p>This is a custom Virtual DOM!</p>
	</main>,
	container,
);
