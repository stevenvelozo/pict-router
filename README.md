# Pict Router

Leverages the navigo [https://www.npmjs.com/package/navigo] router to provide browser URL
parsing.  Right now the routes parsed are triggered by the part of the URL after the
anchor # symbol.

So for instance the route `/index.html?term=dogs#/Views/Legal` would be the route
`/Views/Legal` within the router.

## Templates as String-based Routes

If you call PictRouter.addRoute(pRoute, pRouteFunction) the route will be parsed in the
traditional navigo manner.  However, if a string is passed in (e.g. this one from the 
tests: `"{~LV:Pict.providers.PictRouter.adjustTestState(Record.data.Scope)~}"`

This will execute the LogValue template expression on the provider function address.

This means the function address gets called.

This can be used to call view render() functions as well as other custom or app-specific
behaviors.