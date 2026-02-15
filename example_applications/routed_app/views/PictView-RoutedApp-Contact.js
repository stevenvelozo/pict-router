const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "RoutedApp-Contact",

	DefaultRenderable: "RoutedApp-Contact-Content",
	DefaultDestinationAddress: "#RoutedApp-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.routedapp-contact h1 {
			font-size: 2em;
			margin-bottom: 0.5em;
			color: #1a1a2e;
		}
		.routedapp-contact p {
			font-size: 1.05em;
			line-height: 1.6;
			color: #555;
			max-width: 640px;
			margin-bottom: 1.5em;
		}
		.routedapp-contact-form {
			max-width: 480px;
		}
		.routedapp-contact-form label {
			display: block;
			margin-bottom: 0.3em;
			font-weight: 600;
			color: #333;
		}
		.routedapp-contact-form input,
		.routedapp-contact-form textarea {
			display: block;
			width: 100%;
			padding: 0.6em 0.8em;
			margin-bottom: 1em;
			border: 1px solid #ccc;
			border-radius: 4px;
			font-size: 1em;
			font-family: inherit;
			box-sizing: border-box;
		}
		.routedapp-contact-form textarea {
			height: 120px;
			resize: vertical;
		}
		.routedapp-contact-form button {
			background: #e94560;
			color: #fff;
			border: none;
			padding: 0.7em 1.5em;
			border-radius: 4px;
			font-size: 1em;
			cursor: pointer;
			transition: background 0.15s;
		}
		.routedapp-contact-form button:hover {
			background: #c0392b;
		}
	`,

	Templates:
	[
		{
			Hash: "RoutedApp-Contact-Template",
			Template: /*html*/`
<div class="routedapp-contact">
	<h1>Contact</h1>
	<p>
		This is a static contact page demonstrating a simple template route.
		The form below is decorative — it shows how a view can render
		arbitrary HTML into the routed content area.
	</p>
	<div class="routedapp-contact-form">
		<label for="contact-name">Name</label>
		<input id="contact-name" type="text" placeholder="Your name" />
		<label for="contact-email">Email</label>
		<input id="contact-email" type="email" placeholder="you@example.com" />
		<label for="contact-message">Message</label>
		<textarea id="contact-message" placeholder="What's on your mind?"></textarea>
		<button type="button" onclick="alert('This is a demo — no message sent!')">Send Message</button>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "RoutedApp-Contact-Content",
			TemplateHash: "RoutedApp-Contact-Template",
			DestinationAddress: "#RoutedApp-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class RoutedAppContactView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = RoutedAppContactView;

module.exports.default_configuration = _ViewConfiguration;
