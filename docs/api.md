# API Reference

## Class: PictRouter

Extends `pict-provider`. Wraps the Navigo router to provide hash-based URL routing for Pict applications.

### Constructor

```javascript
new PictRouter(pFable, pOptions, pServiceHash)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `pFable` | object | A Fable or Pict instance |
| `pOptions` | object | Provider configuration with optional `Routes` array |
| `pServiceHash` | string | Service identifier |

Default options:

```javascript
{
	ProviderIdentifier: 'Pict-Router',
	AutoInitialize: true,
	AutoInitializeOrdinal: 0
}
```

On construction, a Navigo router instance is created with hash mode enabled and strategy `'ONE'` (only one route matches at a time). If `pOptions.Routes` is provided, each route is registered automatically.

---

## Properties

### router

The underlying Navigo router instance. Access this directly for advanced Navigo features not exposed through PictRouter's API.

**Type:** `Navigo`

```javascript
// Direct Navigo access for advanced patterns
this.pict.providers.PictRouter.router.on('/path', handler);
this.pict.providers.PictRouter.router.notFound(handler);
```

---

### afterPersistView

The default route to render after the application loads. Set during construction.

**Type:** `string`
**Default:** `'/Manyfest/Overview'`

---

### currentScope

Getter that returns the current scope from `AppData.ManyfestRecord.Scope`. Returns `'Default'` if not set.

**Type:** `string` (getter)

---

## Methods

### addRoute(pRoute, pRenderable)

Register a route handler. The renderable can be either a callback function or a Pict template expression string.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pRoute` | string | Route pattern (Navigo syntax) |
| `pRenderable` | function/string | Handler function or template expression |

Automatically calls `resolve()` after registration.

#### Function Handler

```javascript
router.addRoute('/Users/:UserId',
	(pData) =>
	{
		console.log('User:', pData.data.UserId);
	});
```

The handler receives a `pData` object. Matched URL parameters are in `pData.data`:

| Property | Type | Description |
|----------|------|-------------|
| `pData.data` | object | Key-value pairs of matched URL parameters |
| `pData.url` | string | The matched URL string |
| `pData.route` | object | Navigo route metadata |

#### Template Handler

```javascript
router.addRoute('/Dashboard',
	"{~LV:Pict.PictApplication.showView(`Dashboard`)~}");
```

Template strings are evaluated using `pict.parseTemplate()`. The `pData` object is passed as the record, so URL parameters are accessible via `Record.data.paramName` in the template:

```javascript
router.addRoute('/Items/:ItemId',
	"{~LV:Pict.PictApplication.showItem(Record.data.ItemId)~}");
```

---

### navigate(pRoute)

Programmatically navigate to a route. Updates the URL hash, adds a browser history entry, and triggers the matching route handler.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pRoute` | string | The route path to navigate to |

```javascript
this.pict.providers.PictRouter.navigate('/About');
// URL becomes: index.html#/About
```

---

### resolve()

Manually trigger route resolution. Matches the current URL hash against registered routes and executes the matching handler. Called automatically after each `addRoute()` call.

Call this explicitly after the DOM is ready (typically in a layout view's `onAfterRender()`) to handle the initial page load URL:

```javascript
onAfterRender()
{
	if (this.pict.providers.PictRouter)
	{
		this.pict.providers.PictRouter.resolve();
	}
}
```

---

### forwardToScopedRoute(pData)

Navigate to a URL with the current scope appended. Convenience method for scope-based routing patterns.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pData` | object | Object with a `url` property |

```javascript
// If currentScope is 'Production':
router.forwardToScopedRoute({ url: '/Admin/Dashboard' });
// Navigates to: /Admin/Dashboard/Production
```

---

## Route Configuration

Routes can be defined in a JSON configuration object passed as the provider options:

```json
{
	"ProviderIdentifier": "Pict-Router",
	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,
	"Routes":
	[
		{
			"path": "/Home",
			"template": "{~LV:Pict.PictApplication.showView(`Home`)~}"
		},
		{
			"path": "/Users/:UserId",
			"template": "{~LV:Pict.PictApplication.showUser(Record.data.UserId)~}"
		}
	]
}
```

Each route entry requires:

| Property | Type | Description |
|----------|------|-------------|
| `path` | string | **(required)** Route pattern |
| `template` | string | Template expression (mutually exclusive with `render`) |
| `render` | function | Handler function (mutually exclusive with `template`) |

---

## Route Pattern Syntax

PictRouter uses Navigo's pattern matching:

| Pattern | Example URL | Matched Parameters |
|---------|-------------|-------------------|
| `/path` | `#/path` | (none) |
| `/path/:param` | `#/path/value` | `{ param: 'value' }` |
| `/path/:a/:b` | `#/path/foo/bar` | `{ a: 'foo', b: 'bar' }` |

Parameters are accessible in function handlers as `pData.data.paramName` and in template expressions as `Record.data.paramName`.

---

## Integration Pattern

The typical integration with a Pict application:

### 1. Application Class

```javascript
class MyApp extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addProvider('PictRouter', routeConfig, libPictRouter);

		// Register views...
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

### 2. Layout View — Resolve on First Render

```javascript
onAfterRender()
{
	this.pict.views['TopBar'].render();
	this.pict.views['Home'].render();

	if (this.pict.providers.PictRouter)
	{
		this.pict.providers.PictRouter.resolve();
	}
}
```

### 3. Navigation Template

```html
<a onclick="{~P~}.PictApplication.navigateTo('/About')">About</a>
```

### 4. Content Views — Replace Into Shared Container

```javascript
{
	DefaultDestinationAddress: "#Content-Container",
	RenderMethod: "replace"
}
```
