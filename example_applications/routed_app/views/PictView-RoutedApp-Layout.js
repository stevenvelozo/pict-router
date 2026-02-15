const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "RoutedApp-Layout",

	DefaultRenderable: "RoutedApp-Layout-Shell",
	DefaultDestinationAddress: "#RoutedApp-Container",

	AutoRender: false,

	CSS: /*css*/`
		#RoutedApp-Container {
			display: flex;
			flex-direction: column;
			min-height: 100vh;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
			color: #333;
		}
		#RoutedApp-TopBar-Container {
			flex-shrink: 0;
		}
		#RoutedApp-Content-Container {
			flex: 1;
			padding: 2em;
			max-width: 960px;
			width: 100%;
			margin: 0 auto;
			box-sizing: border-box;
		}
	`,

	Templates:
	[
		{
			Hash: "RoutedApp-Layout-Shell-Template",
			Template: /*html*/`
<div id="RoutedApp-TopBar-Container"></div>
<div id="RoutedApp-Content-Container"></div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "RoutedApp-Layout-Shell",
			TemplateHash: "RoutedApp-Layout-Shell-Template",
			DestinationAddress: "#RoutedApp-Container",
			RenderMethod: "replace"
		}
	]
};

class RoutedAppLayoutView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		// After the layout shell renders, render the top bar
		this.pict.views['RoutedApp-TopBar'].render();

		// Render the default content view (Home)
		this.pict.views['RoutedApp-Home'].render();

		// Inject all view CSS into the PICT-CSS style element
		this.pict.CSSMap.injectCSS();

		// Resolve the router so it picks up the current hash URL
		// This handles direct navigation (e.g. index.html#/About)
		if (this.pict.providers.PictRouter)
		{
			this.pict.providers.PictRouter.resolve();
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = RoutedAppLayoutView;

module.exports.default_configuration = _ViewConfiguration;
