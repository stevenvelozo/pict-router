const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "RoutedApp-About",

	DefaultRenderable: "RoutedApp-About-Content",
	DefaultDestinationAddress: "#RoutedApp-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.routedapp-about h1 {
			font-size: 2em;
			margin-bottom: 0.5em;
			color: #1a1a2e;
		}
		.routedapp-about p {
			font-size: 1.05em;
			line-height: 1.6;
			color: #555;
			max-width: 640px;
		}
		.routedapp-about ul {
			margin-top: 1em;
			padding-left: 1.5em;
		}
		.routedapp-about li {
			margin-bottom: 0.5em;
			line-height: 1.5;
			color: #555;
		}
		.routedapp-about code {
			background: #f0f0f0;
			padding: 0.15em 0.4em;
			border-radius: 3px;
			font-size: 0.9em;
		}
	`,

	Templates:
	[
		{
			Hash: "RoutedApp-About-Template",
			Template: /*html*/`
<div class="routedapp-about">
	<h1>About This Example</h1>
	<p>
		This application shows the core pict-router patterns for building
		a single-page application with hash-based routing.
	</p>
	<ul>
		<li><strong>Template routes</strong> — <code>/Home</code>, <code>/About</code>, and <code>/Contact</code> use template expression strings to call <code>showView()</code></li>
		<li><strong>Parameterized routes</strong> — <code>/Items/:ItemId</code> captures a URL parameter and passes it to <code>showItem()</code></li>
		<li><strong>Layout shell</strong> — A layout view renders the top bar and content container, then calls <code>resolve()</code> to handle the initial URL</li>
		<li><strong>Content replacement</strong> — Each content view renders into the same <code>#RoutedApp-Content-Container</code> element using <code>RenderMethod: "replace"</code></li>
		<li><strong>JSON configuration</strong> — All routes are defined declaratively in <code>PictRouter-RoutedApp-Configuration.json</code></li>
	</ul>
	<p>
		Navigate using the top bar links, or change the URL hash directly
		(e.g. <code>#/Items/2</code>) and press Enter to see the router resolve.
	</p>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "RoutedApp-About-Content",
			TemplateHash: "RoutedApp-About-Template",
			DestinationAddress: "#RoutedApp-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class RoutedAppAboutView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = RoutedAppAboutView;

module.exports.default_configuration = _ViewConfiguration;
