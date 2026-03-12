const libPictProvider = require('pict-provider');
const libNavigo = require('navigo');

const _DEFAULT_PROVIDER_CONFIGURATION =
{
	ProviderIdentifier: 'Pict-Router',

	AutoInitialize: true,
	AutoInitializeOrdinal: 0,

	// When true, addRoute() will NOT auto-resolve after each route is added.
	// This is useful in auth-gated SPAs where routes should only resolve after
	// the DOM is ready (e.g. after login).  Can also be set globally via
	// pict.settings.RouterSkipRouteResolveOnAdd — either one enables the skip.
	SkipRouteResolveOnAdd: false
}

class PictRouter extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _DEFAULT_PROVIDER_CONFIGURATION, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		// Initialize the navigo router and set the base path to '/'
		this.router = new libNavigo('/', { strategy: 'ONE', hash: true });

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
		}
		else if (typeof(pRenderable) === 'string')
		{
			// Run this as a template, allowing some whack things with functions in template expressions.
			this.router.on(pRoute,
				(pData) =>
				{
					this.pict.parseTemplate(pRenderable, pData, null, this.pict)
				});
		}
		else
		{
			// renderable isn't usable!
			this.pict.log.warn(`Route ${pRoute} has an invalid renderable.`);
			return;
		}

		// By default, resolve after each route is added (legacy behavior).
		// Applications can skip this by setting SkipRouteResolveOnAdd: true in
		// the provider config JSON, or globally via
		// pict.settings.RouterSkipRouteResolveOnAdd.  Either one will prevent
		// premature route resolution before views are rendered.
		if (!this.options.SkipRouteResolveOnAdd && !this.pict.settings.RouterSkipRouteResolveOnAdd)
		{
			this.resolve();
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
	 * Navigate to the route currently in the browser's location hash.
	 *
	 * This is useful in auth-gated SPAs: when the user pastes a deep-link
	 * (e.g. #/Books) and then logs in, calling navigateCurrent() will force
	 * the router to fire the handler for whatever hash is already in the URL.
	 * Unlike resolve(), navigate() always triggers the handler even if Navigo
	 * has already "consumed" that URL.
	 *
	 * If the hash is empty or just "#/", this is a no-op and returns false.
	 *
	 * @returns {boolean} true if a route was navigated to, false otherwise
	 */
	navigateCurrent()
	{
		let tmpHash = (typeof (window) !== 'undefined' && window.location) ? window.location.hash : '';
		if (tmpHash && tmpHash.length > 2 && tmpHash !== '#/')
		{
			let tmpRoute = tmpHash.replace(/^#/, '');
			this.navigate(tmpRoute);
			return true;
		}
		return false;
	}

	/**
	 * Trigger the router resolving logic; this is expected to be called after all routes are added (to go to the default route).
	 *
	 */
	resolve()
	{
		this.router.resolve();
	}
}

module.exports = PictRouter;
module.exports.default_configuration = _DEFAULT_PROVIDER_CONFIGURATION;