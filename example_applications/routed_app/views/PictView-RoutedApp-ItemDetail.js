const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "RoutedApp-ItemDetail",

	DefaultRenderable: "RoutedApp-ItemDetail-Content",
	DefaultDestinationAddress: "#RoutedApp-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.routedapp-item-detail {
			max-width: 640px;
		}
		.routedapp-item-detail h1 {
			font-size: 2em;
			margin-bottom: 0.25em;
			color: #1a1a2e;
		}
		.routedapp-item-detail .item-id {
			display: inline-block;
			background: #e94560;
			color: #fff;
			padding: 0.2em 0.6em;
			border-radius: 4px;
			font-size: 0.85em;
			font-weight: 600;
			margin-bottom: 1em;
		}
		.routedapp-item-detail .item-description {
			font-size: 1.1em;
			line-height: 1.6;
			color: #555;
			margin-bottom: 1.5em;
		}
		.routedapp-item-detail .item-price {
			font-size: 1.5em;
			font-weight: 700;
			color: #27ae60;
			margin-bottom: 1.5em;
		}
		.routedapp-item-detail .item-back {
			display: inline-block;
			color: #e94560;
			text-decoration: none;
			cursor: pointer;
			font-weight: 600;
			transition: color 0.15s;
		}
		.routedapp-item-detail .item-back:hover {
			color: #c0392b;
		}
	`,

	Templates:
	[
		{
			Hash: "RoutedApp-ItemDetail-Template",
			Template: /*html*/`
<div class="routedapp-item-detail">
	<span class="item-id">Item #{~D:AppData.RoutedApp.CurrentItem.Id~}</span>
	<h1>{~D:AppData.RoutedApp.CurrentItem.Name~}</h1>
	<p class="item-description">{~D:AppData.RoutedApp.CurrentItem.Description~}</p>
	<div class="item-price">${~D:AppData.RoutedApp.CurrentItem.Price~}</div>
	<a class="item-back" onclick="{~P~}.PictApplication.navigateTo('/Home')">&larr; Back to Home</a>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "RoutedApp-ItemDetail-Content",
			TemplateHash: "RoutedApp-ItemDetail-Template",
			DestinationAddress: "#RoutedApp-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class RoutedAppItemDetailView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = RoutedAppItemDetailView;

module.exports.default_configuration = _ViewConfiguration;
