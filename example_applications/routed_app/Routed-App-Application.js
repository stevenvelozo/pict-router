const libPictApplication = require('pict-application');
const libPictRouter = require('pict-router');

// Views
const libViewLayout = require('./views/PictView-RoutedApp-Layout.js');
const libViewTopBar = require('./views/PictView-RoutedApp-TopBar.js');
const libViewHome = require('./views/PictView-RoutedApp-Home.js');
const libViewAbout = require('./views/PictView-RoutedApp-About.js');
const libViewContact = require('./views/PictView-RoutedApp-Contact.js');
const libViewItemDetail = require('./views/PictView-RoutedApp-ItemDetail.js');

class RoutedAppApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Add the router provider with JSON-configured routes
		this.pict.addProvider('PictRouter', require('./providers/PictRouter-RoutedApp-Configuration.json'), libPictRouter);

		// Add the layout view (the shell that contains top bar and content area)
		this.pict.addView('RoutedApp-Layout', libViewLayout.default_configuration, libViewLayout);

		// Add the top bar navigation view
		this.pict.addView('RoutedApp-TopBar', libViewTopBar.default_configuration, libViewTopBar);

		// Add content views
		this.pict.addView('RoutedApp-Home', libViewHome.default_configuration, libViewHome);
		this.pict.addView('RoutedApp-About', libViewAbout.default_configuration, libViewAbout);
		this.pict.addView('RoutedApp-Contact', libViewContact.default_configuration, libViewContact);
		this.pict.addView('RoutedApp-ItemDetail', libViewItemDetail.default_configuration, libViewItemDetail);
	}

	onAfterInitializeAsync(fCallback)
	{
		// Initialize sample data for the item detail route
		this.pict.AppData.RoutedApp =
		{
			CurrentRoute: 'Home',
			Items:
			{
				'1': { Name: 'Widget Alpha', Description: 'A premium widget for everyday use.', Price: 19.99 },
				'2': { Name: 'Gadget Beta', Description: 'An innovative gadget with smart features.', Price: 49.95 },
				'3': { Name: 'Gizmo Gamma', Description: 'A reliable gizmo built to last.', Price: 29.50 }
			}
		};

		// Render the layout shell which triggers everything else
		this.pict.views['RoutedApp-Layout'].render();

		return super.onAfterInitializeAsync(fCallback);
	}

	/**
	 * Navigate to a route using pict-router.
	 *
	 * @param {string} pRoute - The route path to navigate to (e.g. '/About')
	 */
	navigateTo(pRoute)
	{
		this.pict.providers.PictRouter.navigate(pRoute);
	}

	/**
	 * Render a specific content view into the content container.
	 * Called by the router when a template route matches.
	 *
	 * @param {string} pViewIdentifier - The view identifier to render
	 */
	showView(pViewIdentifier)
	{
		if (pViewIdentifier in this.pict.views)
		{
			this.pict.AppData.RoutedApp.CurrentRoute = pViewIdentifier;
			this.pict.views[pViewIdentifier].render();
		}
		else
		{
			this.pict.log.warn(`View [${pViewIdentifier}] not found; falling back to Home.`);
			this.pict.views['RoutedApp-Home'].render();
		}
	}

	/**
	 * Show the item detail view for a specific item ID.
	 * Called by the router for the /Items/:ItemId parameterized route.
	 *
	 * @param {string} pItemId - The item identifier from the URL
	 */
	showItem(pItemId)
	{
		let tmpItem = this.pict.AppData.RoutedApp.Items[pItemId];

		if (tmpItem)
		{
			this.pict.AppData.RoutedApp.CurrentRoute = 'ItemDetail';
			this.pict.AppData.RoutedApp.CurrentItem = tmpItem;
			this.pict.AppData.RoutedApp.CurrentItem.Id = pItemId;
			this.pict.views['RoutedApp-ItemDetail'].render();
		}
		else
		{
			this.pict.log.warn(`Item [${pItemId}] not found; showing Home.`);
			this.showView('RoutedApp-Home');
		}
	}
}

module.exports = RoutedAppApplication;

module.exports.default_configuration = require('./Routed-App-Application-Configuration.json');
