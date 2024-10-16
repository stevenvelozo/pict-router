const libPictProvider = require('pict-provider');
const libNavigo = require('navigo');
const {ResolveOptions} = require("navigo");

const _DEFAULT_PROVIDER_CONFIGURATION =
{
	ProviderIdentifier: 'Pict-Router',

	AutoInitialize: true,
	AutoInitializeOrdinal: 0
}

class PictRouter extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _DEFAULT_PROVIDER_CONFIGURATION, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		// Initialize the navigo router and set the base path to '/'
		this.router = new libNavigo('/', { hash: true });

		if (this.options.Routes)
		{
			for (let i = 0; i < this.options.Routes.length; i++)
			{
				if (this.options.Routes[i].path && this.options.Routes[i].template)
				{
					this.addRoute(this.options.Routes[i].path, this.options.Routes[i].template);
				}
				else if (this.options.Routes[i].path && this.options.Routes[i].render)
				{
					this.addRoute(this.options.Routes[i].path, this.options.Routes[i].render);
				}
				else
				{
					this.pict.log.warn(`Route ${i} is missing a render function or template string.`);
				}
			}
		}

		// This is the route to render after load
		this.afterPersistView = '/Manyfest/Overview';
	}

	get currentScope()
	{
		return this.AppData?.ManyfestRecord?.Scope ?? 'Default';
	}

	forwardToScopedRoute(pData)
	{
		this.navigate(`${pData.url}/${this.currentScope}`);
	}

	onInitializeAsync(fCallback)
	{
		return super.onInitializeAsync(fCallback);
	}

	/**
	 * Add a route to the router.
	 */
	addRoute(pRoute, pRenderable)
	{
		if (typeof(pRenderable) === 'function')
		{
			this.router.on(pRoute, pRenderable);
			this.resolve();
		}
		else if (typeof(pRenderable) === 'string')
		{
			// Run this as a template, allowing some whack things with functions in template expressions.
			this.router.on(pRoute, 
				(pData) => 
				{
					this.pict.parseTemplate(pRenderable, pData, null, this.pict)
				});
			this.resolve();
		}
		else
		{
			// renderable isn't usable!
			this.pict.log.warn(`Route ${pRoute} has an invalid renderable.`);
		}
	}

	/**
	 * Navigate to a given route (set the browser URL string, add to history, trigger router)
	 * 
	 * @param {string} pRoute - The route to navigate to
	 */
	navigate(pRoute)
	{
		this.router.navigate(pRoute);
	}

	/**
	 * Trigger the router resolving logic
	 *
	 */
	resolve() {
		this.router.resolve();
	}
}

module.exports = PictRouter;
module.exports.default_configuration = _DEFAULT_PROVIDER_CONFIGURATION;