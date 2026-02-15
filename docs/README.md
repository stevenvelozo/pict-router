# Pict Router

A Pict provider that wraps the [Navigo](https://www.npmjs.com/package/navigo) router to provide hash-based URL routing for single-page Pict applications. Routes are parsed from the URL fragment after the `#` symbol, so `index.html#/About` maps to the route `/About`.

Routes can be defined in a JSON configuration object or added programmatically. Each route maps a URL pattern to either a callback function or a Pict template expression string. Template routes can call any application method — view renders, provider functions, or custom logic — making it possible to build a full multi-page SPA with nothing more than configuration.

## Quick Start

```bash
npm install pict-router
```

### 1. Define Routes in JSON

Create a route configuration file that maps URL paths to template expressions:

```json
{
	"ProviderIdentifier": "Pict-Router",
	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,
	"Routes":
	[
		{
			"path": "/Home",
			"template": "{~LV:Pict.PictApplication.showView(`MyApp-Home`)~}"
		},
		{
			"path": "/About",
			"template": "{~LV:Pict.PictApplication.showView(`MyApp-About`)~}"
		},
		{
			"path": "/Settings",
			"template": "{~LV:Pict.PictApplication.showView(`MyApp-Settings`)~}"
		}
	]
}
```

The `{~LV:...~}` syntax is Pict's LogValue template tag — it evaluates the expression when the route matches. Here it calls `showView()` on the application to swap the content view.

### 2. Register the Router Provider

In your application class, add the router as a provider:

```javascript
const libPictApplication = require('pict-application');
const libPictRouter = require('pict-router');

class MyApp extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Register the router provider with route configuration
		this.pict.addProvider('PictRouter',
			require('./PictRouter-Configuration.json'),
			libPictRouter);

		// Register views...
		this.pict.addView('MyApp-Layout', layoutConfig, LayoutView);
		this.pict.addView('MyApp-Home', homeConfig, HomeView);
		this.pict.addView('MyApp-About', aboutConfig, AboutView);
	}

	navigateTo(pRoute)
	{
		this.pict.providers.PictRouter.navigate(pRoute);
	}

	showView(pViewIdentifier)
	{
		if (pViewIdentifier in this.pict.views)
		{
			this.pict.views[pViewIdentifier].render();
		}
	}
}
```

### 3. Resolve the Router After Render

In your layout view's `onAfterRender()`, call `resolve()` so the router picks up the current URL on first load:

```javascript
onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
{
	// Render child views into the layout shell
	this.pict.views['MyApp-TopBar'].render();
	this.pict.views['MyApp-Home'].render();

	// Resolve the router so it navigates to the current hash URL
	if (this.pict.providers.PictRouter)
	{
		this.pict.providers.PictRouter.resolve();
	}

	return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
}
```

### 4. Add Navigation Links

Use `onclick` handlers in view templates to trigger navigation:

```html
<nav>
	<a onclick="{~P~}.PictApplication.navigateTo('/Home')">Home</a>
	<a onclick="{~P~}.PictApplication.navigateTo('/About')">About</a>
	<a onclick="{~P~}.PictApplication.navigateTo('/Settings')">Settings</a>
</nav>
```

The `{~P~}` template tag resolves to the Pict instance name, giving the onclick handler access to the application.

## How It Works

1. The router is registered as a Pict provider during app construction
2. Route definitions from the `Routes` configuration array are processed — each route is registered with Navigo
3. When the layout renders, `resolve()` is called to match the current URL hash
4. When a user clicks a navigation link, `navigateTo()` calls `router.navigate()`, which updates the URL hash and triggers the matching route handler
5. Template route handlers call `pict.parseTemplate()` to evaluate the expression, which typically calls `showView()` to swap the content view
6. Browser back/forward buttons work automatically through Navigo's history integration

## Route Types

### Template Routes

Map a path to a Pict template expression string. The expression is evaluated when the route matches:

```json
{
	"path": "/Dashboard",
	"template": "{~LV:Pict.PictApplication.showView(`Dashboard`)~}"
}
```

### Function Routes

Map a path to a callback function. The function receives a data object with matched URL parameters:

```javascript
router.addRoute('/Users/:UserId',
	(pData) =>
	{
		let tmpUserId = pData.data.UserId;
		this.AppData.SelectedUser = tmpUserId;
		this.pict.views['UserDetail'].render();
	});
```

### Parameterized Routes

Capture dynamic URL segments with `:paramName` syntax:

```json
{
	"path": "/Products/:Category/:ProductId",
	"template": "{~LV:Pict.PictApplication.showProduct(Record.data.Category, Record.data.ProductId)~}"
}
```

Navigating to `#/Products/Electronics/42` calls `showProduct('Electronics', '42')`.

## Architecture Pattern

The recommended pattern for routed Pict applications (used by pict-nonlinearconfig):

```
Application
├── Router Provider (routes → showView calls)
├── Layout View (shell with topbar, content area, footer)
│   ├── TopBar View (navigation links → navigateTo calls)
│   ├── Content Container (swapped by router)
│   │   ├── Home View (RenderMethod: "replace")
│   │   ├── About View (RenderMethod: "replace")
│   │   └── Settings View (RenderMethod: "replace")
│   └── Footer View
```

Content views all render into the same `#Content-Container` with `RenderMethod: "replace"`, so the router effectively swaps them in and out.

## Example

A working example application is included in the `example_applications/routed_app/` folder. It demonstrates the full routing pattern with a layout shell, navigation bar, and four routed content views.

## Learn More

- [API Reference](api.md) -- Methods, properties, and route pattern syntax
- [Pict Application](/pict/pict-application/) -- The application container
- [Pict View](/pict/pict-view/) -- Views that routes render
- [Pict Provider](/pict/pict-provider/) -- The base provider class
