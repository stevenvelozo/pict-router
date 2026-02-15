const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "RoutedApp-Home",

	DefaultRenderable: "RoutedApp-Home-Content",
	DefaultDestinationAddress: "#RoutedApp-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.routedapp-home h1 {
			font-size: 2em;
			margin-bottom: 0.5em;
			color: #1a1a2e;
		}
		.routedapp-home p {
			font-size: 1.1em;
			line-height: 1.6;
			color: #555;
			max-width: 640px;
		}
		.routedapp-home-cards {
			display: flex;
			gap: 1.5em;
			margin-top: 2em;
			flex-wrap: wrap;
		}
		.routedapp-home-card {
			flex: 1;
			min-width: 200px;
			background: #f8f9fa;
			border-radius: 8px;
			padding: 1.5em;
			border: 1px solid #e9ecef;
			cursor: pointer;
			transition: box-shadow 0.15s, transform 0.15s;
		}
		.routedapp-home-card:hover {
			box-shadow: 0 4px 12px rgba(0,0,0,0.1);
			transform: translateY(-2px);
		}
		.routedapp-home-card h3 {
			margin: 0 0 0.5em;
			color: #e94560;
		}
		.routedapp-home-card p {
			margin: 0;
			font-size: 0.95em;
			color: #666;
		}
	`,

	Templates:
	[
		{
			Hash: "RoutedApp-Home-Template",
			Template: /*html*/`
<div class="routedapp-home">
	<h1>Welcome to the Routed App</h1>
	<p>
		This example demonstrates hash-based routing with pict-router.
		Click the navigation links above or the cards below to navigate
		between views. Each route updates the URL hash and renders its
		matching view into this content area.
	</p>
	<div class="routedapp-home-cards">
		<div class="routedapp-home-card" onclick="{~P~}.PictApplication.navigateTo('/Items/1')">
			<h3>Widget Alpha</h3>
			<p>View the detail page for Item 1 — a parameterized route.</p>
		</div>
		<div class="routedapp-home-card" onclick="{~P~}.PictApplication.navigateTo('/Items/2')">
			<h3>Gadget Beta</h3>
			<p>View the detail page for Item 2 — same route, different param.</p>
		</div>
		<div class="routedapp-home-card" onclick="{~P~}.PictApplication.navigateTo('/Items/3')">
			<h3>Gizmo Gamma</h3>
			<p>View the detail page for Item 3 — URL parameters in action.</p>
		</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "RoutedApp-Home-Content",
			TemplateHash: "RoutedApp-Home-Template",
			DestinationAddress: "#RoutedApp-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class RoutedAppHomeView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = RoutedAppHomeView;

module.exports.default_configuration = _ViewConfiguration;
