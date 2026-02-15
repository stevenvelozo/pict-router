# Pict Router

> Hash-based SPA routing for Pict applications

Navigate between views using URL hash fragments. Define routes in JSON or code, map them to views or template expressions, and get browser history support for free. Built on the Navigo router as a Pict provider.

- **Hash Routing** -- Routes are parsed from the URL fragment after `#`, so `index.html#/About` maps to `/About`
- **Template Routes** -- Map route paths to Pict template expressions that call `showView()`, `render()`, or any method
- **Function Routes** -- Pass a callback to handle route matches with full access to URL parameters
- **URL Parameters** -- Capture dynamic segments like `/Users/:UserId` and access them in handlers
- **Config-Driven** -- Define all routes in a JSON configuration object passed at construction

[Quick Start](README.md)
[API Reference](api.md)
[GitHub](https://github.com/stevenvelozo/pict-router)
