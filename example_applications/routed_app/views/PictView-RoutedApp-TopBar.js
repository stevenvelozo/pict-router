const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "RoutedApp-TopBar",

	DefaultRenderable: "RoutedApp-TopBar-Content",
	DefaultDestinationAddress: "#RoutedApp-TopBar-Container",

	AutoRender: false,

	CSS: /*css*/`
		.routedapp-topbar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			background-color: #1a1a2e;
			color: #eee;
			padding: 0 1.5em;
			height: 56px;
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
			position: sticky;
			top: 0;
			z-index: 100;
		}
		.routedapp-topbar-brand {
			font-size: 1.25em;
			font-weight: 700;
			color: #e94560;
			text-decoration: none;
			cursor: pointer;
			letter-spacing: 0.02em;
		}
		.routedapp-topbar-brand:hover {
			color: #ff6b81;
		}
		.routedapp-topbar-nav {
			display: flex;
			align-items: center;
			gap: 0.25em;
		}
		.routedapp-topbar-nav a {
			color: #aaa;
			text-decoration: none;
			padding: 0.5em 0.85em;
			border-radius: 4px;
			font-size: 0.9em;
			transition: background-color 0.15s, color 0.15s;
			cursor: pointer;
		}
		.routedapp-topbar-nav a:hover {
			background-color: #16213e;
			color: #fff;
		}
	`,

	Templates:
	[
		{
			Hash: "RoutedApp-TopBar-Template",
			Template: /*html*/`
<div class="routedapp-topbar">
	<a class="routedapp-topbar-brand" onclick="{~P~}.PictApplication.navigateTo('/Home')">Routed App</a>
	<div class="routedapp-topbar-nav">
		<a onclick="{~P~}.PictApplication.navigateTo('/Home')">Home</a>
		<a onclick="{~P~}.PictApplication.navigateTo('/About')">About</a>
		<a onclick="{~P~}.PictApplication.navigateTo('/Contact')">Contact</a>
		<a onclick="{~P~}.PictApplication.navigateTo('/Items/1')">Item 1</a>
		<a onclick="{~P~}.PictApplication.navigateTo('/Items/2')">Item 2</a>
		<a onclick="{~P~}.PictApplication.navigateTo('/Items/3')">Item 3</a>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "RoutedApp-TopBar-Content",
			TemplateHash: "RoutedApp-TopBar-Template",
			DestinationAddress: "#RoutedApp-TopBar-Container",
			RenderMethod: "replace"
		}
	]
};

class RoutedAppTopBarView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = RoutedAppTopBarView;

module.exports.default_configuration = _ViewConfiguration;
