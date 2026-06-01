# Routed App - Hash Routing, Parameterized Routes, Shared Content Shell

<!-- docuserve:example-launch:start -->
> **[Launch the live app](examples/routed%5Fapp/index.html)** - runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->

The Routed App example is the reference for adopting `pict-router` in a
multi-page Pict application. It exercises every pattern documented in
the [README](../../README.md) and [API Reference](../../api.md): a
**JSON route configuration** registered as a Pict provider, **template
routes** that drop into `pict.parseTemplate()` and call application
methods, a **parameterized route** that captures a URL segment and
passes it to a handler, a **layout shell** with a sticky top bar and a
shared content container, **content views** that all render into that
same container with `RenderMethod: "replace"`, and a `resolve()` call
in the layout's `onAfterRender()` that makes deep-linking work on first
load.

The whole pattern is small enough to read in one sitting: one
application class, one configuration JSON file, one route JSON file,
six views. Once you have this shape in your head, you can route any
Pict application.

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| JSON-defined routes registered as a Pict provider | `providers/PictRouter-RoutedApp-Configuration.json` + `this.pict.addProvider('PictRouter', require(...), libPictRouter)` |
| **Template routes** that call application methods | `"template": "{~LV:Pict.PictApplication.showView(\`RoutedApp-Home\`)~}"` in the route config |
| **Parameterized routes** with named segments | `"path": "/Items/:ItemId"` - the segment is available as `Record.data.ItemId` inside the template |
| Programmatic navigation that updates the URL hash | `navigateTo(pRoute)` wraps `this.pict.providers.PictRouter.navigate(pRoute)` |
| Layout shell pattern (top bar + content area) | `PictView-RoutedApp-Layout.js` renders a topbar div + content div, then renders TopBar + default content + calls `router.resolve()` |
| Shared content container with `RenderMethod: "replace"` | Every content view targets `#RoutedApp-Content-Container` and replaces its contents - the router effectively swaps views in and out |
| Initial-hash resolution after first render | `if (this.pict.providers.PictRouter) { this.pict.providers.PictRouter.resolve(); }` in the layout's `onAfterRender` |
| Inline `onclick` navigation links | `<a onclick="{~P~}.PictApplication.navigateTo('/Home')">` - no event listeners, survives every re-render |
| URL parameter access via template tag | `{~D:AppData.RoutedApp.CurrentItem.Id~}` in `PictView-RoutedApp-ItemDetail.js` reads what `showItem(pItemId)` planted in AppData |

## Key files

- `Routed-App-Application.js` - the host. Constructor registers the
  router provider, the layout view, the top bar, the four content
  views; `onAfterInitializeAsync` seeds `AppData.RoutedApp` and renders
  the layout (which triggers everything else). `navigateTo`,
  `showView`, and `showItem` are the three application methods the
  routes ultimately call.
- `Routed-App-Application-Configuration.json` - the application config
  with `MainViewportViewIdentifier` etc. wired up.
- `providers/PictRouter-RoutedApp-Configuration.json` - the four route
  entries: three template routes (`/Home`, `/About`, `/Contact`) and
  one parameterized route (`/Items/:ItemId`).
- `views/PictView-RoutedApp-Layout.js` - the shell. CSS for the column
  layout, a template with two destination divs, and an `onAfterRender`
  that triggers the top bar, the default content, the CSS injection,
  and the router resolve.
- `views/PictView-RoutedApp-TopBar.js` - sticky nav bar. Brand link
  navigates to `/Home`; six links navigate to the three template
  routes and the three sample item-detail routes.
- `views/PictView-RoutedApp-Home.js` /
  `PictView-RoutedApp-About.js` /
  `PictView-RoutedApp-Contact.js` - the three template-route content
  views. Each renders into `#RoutedApp-Content-Container` with
  `RenderMethod: "replace"`, so they swap each other out.
- `views/PictView-RoutedApp-ItemDetail.js` - the parameterized-route
  content view. Reads `AppData.RoutedApp.CurrentItem.*` and displays
  the item.
- `html/index.html` - the shell. One `<div id="RoutedApp-Container">`
  and a `<script src="./routed_app.min.js">` is the whole document
  body.

## The data model

`AppData.RoutedApp` carries everything the routed pages need:

```javascript
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
```

- `CurrentRoute` - set by `showView` / `showItem` so the UI (or the
  panel) can tell which view is active.
- `Items` - keyed by the same string the URL uses
  (`/Items/2` -> `Items['2']`). The parameterized route handler looks
  it up and stamps it into `AppData.RoutedApp.CurrentItem`.

For a real app the `Items` map would come from `onLoadDataAsync` in a
data provider. The structure here is deliberately a constant so the
example runs without any network.

---

## Feature 1 - Routes as JSON, registered as a provider

The router is a Pict provider, so it slots into the constructor the
same way every other provider does. The route table itself is a JSON
file the constructor passes as the provider options:

```javascript
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
	// ...
}
```

The route file declares the provider identifier and the four routes:

```json
{
	"ProviderIdentifier": "Pict-Router",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"Routes":
	[
		{
			"path": "/Home",
			"template": "{~LV:Pict.PictApplication.showView(`RoutedApp-Home`)~}"
		},
		{
			"path": "/About",
			"template": "{~LV:Pict.PictApplication.showView(`RoutedApp-About`)~}"
		},
		{
			"path": "/Contact",
			"template": "{~LV:Pict.PictApplication.showView(`RoutedApp-Contact`)~}"
		},
		{
			"path": "/Items/:ItemId",
			"template": "{~LV:Pict.PictApplication.showItem(Record.data.ItemId)~}"
		}
	]
}
```

`AutoInitialize: true` makes the provider register every route during
`PictApplication.initialize()` - without that, the router would exist
but Navigo would have no routes to match against. Reading routes from
JSON keeps the constructor short and (importantly) gives any toolchain
that builds the app a single inspectable file for the route map.

## Feature 2 - Template routes call application methods

A `"template"` route is a string that gets evaluated by
`pict.parseTemplate()` whenever the route matches. The `{~LV:...~}` tag
is Pict's "log-value" template tag - it evaluates the JS expression
inside and emits its return value (mostly a side-effect mechanism for
routing; we don't care about the emitted value, we care about the
call).

```json
{
    "path": "/Home",
    "template": "{~LV:Pict.PictApplication.showView(`RoutedApp-Home`)~}"
}
```

The handler on the application side just renders the named view:

```javascript
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
```

`showView` could just as easily call `pict.providers.MyDataProvider.refresh()`
first, then render. The template-route mechanism doesn't care - it
gives you a hook the framework triggers, and you decide what the host
should do. The bookend lesson: **routes are configuration; behavior is
methods on the application**. Don't fight that split; it's what makes
the route file deployable as data.

## Feature 3 - Parameterized routes capture URL segments

Replacing a literal path segment with `:ParamName` makes the route
match any value at that position and exposes it inside the template:

```json
{
    "path": "/Items/:ItemId",
    "template": "{~LV:Pict.PictApplication.showItem(Record.data.ItemId)~}"
}
```

Navigo parses `#/Items/2` -> `{ ItemId: '2' }`; the router passes that
object as the record when evaluating the template; inside `{~LV:...~}`
the expression sees `Record.data.ItemId === '2'` and the call becomes
`showItem('2')`.

`showItem` looks the value up in the seeded `Items` map and stamps the
matched item onto `AppData.RoutedApp.CurrentItem`:

```javascript
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
```

The item-detail view then reads `AppData.RoutedApp.CurrentItem.*`
directly in its template - there is no rebuild step, just normal Pict
data binding:

```html
<div class="routedapp-item-detail">
    <span class="item-id">Item #{~D:AppData.RoutedApp.CurrentItem.Id~}</span>
    <h1>{~D:AppData.RoutedApp.CurrentItem.Name~}</h1>
    <p class="item-description">{~D:AppData.RoutedApp.CurrentItem.Description~}</p>
    <div class="item-price">${~D:AppData.RoutedApp.CurrentItem.Price~}</div>
    <a class="item-back" onclick="{~P~}.PictApplication.navigateTo('/Home')">&larr; Back to Home</a>
</div>
```

The same view template renders three different items. Try
`#/Items/1`, `#/Items/2`, `#/Items/3` - the URL drives the data, the
view re-uses itself. That's the productivity payoff of parameterized
routes: one view, N parameter values, no per-route boilerplate.

## Feature 4 - Layout shell pattern + `resolve()` on first render

The layout view is the canonical "shell" - it renders a top bar
container and a content container, and on its `onAfterRender` it
triggers everything else:

```javascript
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
			color: var(--theme-color-text-primary, #333);
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

	Renderables: [ /* ... */ ]
};

class RoutedAppLayoutView extends libPictView
{
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
```

The four things `onAfterRender` does, in order:

1. **Render the top bar.** Now the navigation links exist in the DOM.
2. **Render the default content view (Home).** Provides a sensible
   default before any routing resolves; for `index.html` with no
   fragment, this is also the final state.
3. **Inject all collected CSS.** Each `pict-view` adds its CSS to the
   `CSSMap`; one call flushes the combined cascade into the
   `<style id="PICT-CSS">` block.
4. **Call `router.resolve()`.** If the URL has a fragment (`#/About`,
   `#/Items/2`, ...), this is when the matching template runs and the
   correct content view is rendered over the just-drawn Home.

Resolve order matters: `resolve()` is the **last** call so the DOM is
already populated when the router's handler fires. If `resolve()` ran
before the top bar / default content rendered, the route handler would
try to render content into a destination that didn't exist yet.

## Feature 5 - Shared content container with `RenderMethod: "replace"`

The "swap views in and out" trick is just `RenderMethod: "replace"` on
the same destination, applied identically across every content view.
Home, About, Contact, ItemDetail all target the same div:

```javascript
// PictView-RoutedApp-About.js (and identical in Home / Contact / ItemDetail)
Renderables:
[
	{
		RenderableHash: "RoutedApp-About-Content",
		TemplateHash: "RoutedApp-About-Template",
		DestinationAddress: "#RoutedApp-Content-Container",
		RenderMethod: "replace"
	}
]
```

The router doesn't know about this; it just calls `showView(...)` or
`showItem(...)` and the application method calls `view.render()`. The
view's `Renderables` configuration handles the rest. Every view also
sets `AutoRender: false` - they only render when explicitly invoked
(by the application's render in the layout, by the router via
`showView`, or by another view's `onAfterRender`).

This is also why the top bar can stay sticky: it lives in
`#RoutedApp-TopBar-Container`, a separate div. Only the content
container is being replaced.

## Feature 6 - Navigation handlers as inline `onclick`

Every navigation link uses an inline `onclick="..."` that calls the
application method. No `addEventListener`, no event delegation. The
top bar template:

```html
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
```

`{~P~}` expands to the Pict instance variable name (`_Pict` by
default) - `_Pict.PictApplication.navigateTo('/About')` is what the
browser actually fires.

`navigateTo` is a one-liner on the application:

```javascript
navigateTo(pRoute)
{
	this.pict.providers.PictRouter.navigate(pRoute);
}
```

That's the entire call. `router.navigate(...)` updates the URL hash,
pushes a history entry (so browser back/forward works), and triggers
the matching route handler - which then re-enters `showView` or
`showItem`. Same code path as a deep-link load.

Inline `onclick` is the standard for Pict because templates re-render
frequently - every `render()` blows away the DOM nodes, and any
listeners attached via `addEventListener` would go with them. Inline
handlers live in the template HTML and survive every re-render. See
the [main module CLAUDE guide](../../README.md) for the framework's
position on this.

## Feature 7 - Bootstrapping data and triggering the first render

The application's `onAfterInitializeAsync` seeds the data the routes
need and triggers the layout. The router doesn't need an explicit
poke here - it autoinitializes via its provider configuration and the
layout's `onAfterRender` runs `resolve()`:

```javascript
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
```

Two lines do the work: seed AppData, render the layout. The rest
falls out of the framework's chained hooks - the layout's
`onAfterRender` brings up the top bar, the default content, and the
router. Calling `super.onAfterInitializeAsync(fCallback)` is mandatory
- skip it and the lifecycle stops there.

## Running the example

```bash
cd example_applications/routed_app
npm install
npm run build
# then open dist/index.html in a browser
```

The build produces `dist/routed_app.min.js`, `dist/index.html`, and a
copy of `dist/js/pict.min.js`. No server required - `file://` URLs
work for the routing because the routes are URL-fragment based.

## Things to try in the running app

- **Click each nav link.** Watch the URL hash change
  (`#/Home`, `#/About`, `#/Contact`) and the content swap in. The top
  bar stays sticky.
- **Click an Item link** (Item 1, 2, or 3). URL becomes
  `#/Items/<n>`; the ItemDetail view renders with that item's name,
  description, price. The same view template is being re-used for
  every item.
- **Type a URL fragment directly** - open the browser, edit the URL
  to `index.html#/Items/3`, press Enter. The route resolves on first
  load (that's what the layout's `router.resolve()` call buys you)
  and you land on Item 3.
- **Type a bogus item id** - `index.html#/Items/99`. `showItem` falls
  back to Home and logs a warning to the console. Add the warning
  message to your debugging mental model: bad parameters don't crash
  the app, they go through the application's fallback path.
- **Use browser back/forward.** Navigate Home -> About -> Contact, then
  press the back button repeatedly. Each step replays the matching
  route and renders the previous view. Navigo's history integration
  is free.
- **Click "Back to Home"** on an item detail page. It calls the same
  `navigateTo('/Home')` the brand link does - no special "return"
  logic in the view.

## Takeaways

1. **Routes are configuration.** A JSON file with `{ path, template }`
   entries is the entire route table. The framework reads it once
   during provider auto-initialize; there is nothing else to register.
2. **Behaviors are methods on the application.** Template routes call
   `Pict.PictApplication.<method>(...)`. The application class owns the
   verbs (`navigateTo`, `showView`, `showItem`); the router owns the
   matching.
3. **Parameterized routes capture once, read everywhere.** A `:Param`
   becomes `Record.data.Param` in the route's template expression and
   typically lands in `AppData` so view templates can keep reading
   normally via `{~D:AppData...~}`.
4. **`resolve()` after first render is the deep-link unlock.** Without
   it, navigating to `index.html#/About` directly would land you on
   the default view. With it, the router catches up with the URL on
   load and history-based navigation works from the first paint.
5. **Replace-into-shared-container is the swap mechanism.** Make every
   content view target the same `DestinationAddress` with
   `RenderMethod: "replace"` and you get a single-page app without
   any custom rendering glue. The router's job is just to call
   `view.render()`.

## Related documentation

- [Pict Router - Overview](../../README.md) - the README walks through
  the same patterns at a higher level
- [API Reference](../../api.md) - methods (`addRoute`, `navigate`,
  `resolve`, `forwardToScopedRoute`), route pattern syntax, and the
  full configuration shape
- [Pict Application](https://fable-retold.github.io/pict-application/)
  - the application container the router plugs into
- [Pict View](https://fable-retold.github.io/pict-view/) - the view
  class every content view in this example extends
