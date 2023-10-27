const libPictViewClass = require('pict-view');

// # The open source SpaceRouter library
// # >SITE:  https://kidkarolis.github.io/space-router/
// # >GIT:   https://github.com/KidkArolis/space-router
const libSpaceRouter = require('space-router');

class PictRouter extends libPictViewClass
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, require('./Pict-Router-DefaultConfiguration.json'), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.VisitedRoutes = [];

		if ((typeof(this.options.Routes) != 'object') || !Array.isArray(this.options.Routes))
		{
			this.log.warn(`The Routes option is not an object or object is not an array; creating default route object`);
			this.options.Routes = [];
		}

		// Space router expects one of `memory`, `history` or `hash` as the mode.
		// The "history" mode only works in the browser.
		if (typeof(this.options.RouterMode) != 'string')
		{
			this.options.RouterMode = 'history';
		}
	}

	onBeforeChange(pRoute)
	{

	}

	change(pRoute)
	{
		this.onBeforeChange(pRoute);
		// Render the route (usually renderDefault but the developer could pass their own function in)
		pRoute.render(pRoute);
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`Route changed to [${pRoute.query}]`);
		}
		this.onChange(pRoute);
		// After the route is changed, push it to the history object.
		this.VisitedRoutes.push(pRoute.url);
		this.onAfterChange(pRoute);
	}

	onChange(pRoute)
	{
		// This is what the developer is expected to override; it fires *after* any route is changed
	}

	onAfterChange(pRoute)
	{

	}

	renderDefault(pRoute)
	{
		if (this.pict.LogNoisiness > 3)
		{
			this.log.trace(`Pict::Router [${this.UUID}] Render function called; no override or function passed in for the route.  URL [${pRoute.url}]`);
		}

		return this.onRenderDefault(pRoute);
	}

	onRenderDefault(pRoute)
	{
		// This is what the developer is expected to override; it is the route render method.
		// A second pattern space router supports is putting render  on the Routes array itself.
		return true;
	}

	onInitialize()
	{
		// Check all routes and make sure they have the right function
		for (let i = 0; i < this.options.Routes.length; i++)
		{
			let tmpRoute = this.options.Routes[i];
			if (typeof(tmpRoute.render) != 'function')
			{
				tmpRoute.render = this.renderDefault.bind(this);
			}
		}

		let tmpSpaceRouterOptionsObject = {};

		if (this.options.RouterMode)
		{
			tmpSpaceRouterOptionsObject.mode = this.options.RouterMode;
		}

		this._router = libSpaceRouter.createRouter(tmpSpaceRouterOptionsObject);
		this._routerDispose = this._router.listen(this.options.Routes, this.change.bind(this));
	}
}

module.exports = PictRouter;

module.exports.default_configuration = require('./Pict-Router-DefaultConfiguration.json');