# Routed App Example

A multi-page single-page application demonstrating hash-based routing with pict-router.

## What It Shows

- **Template routes** — `/Home`, `/About`, and `/Contact` use template expression strings to call `showView()`
- **Parameterized routes** — `/Items/:ItemId` captures a dynamic URL segment and passes it to `showItem()`
- **Layout shell** — A layout view renders a sticky top bar and content container, then calls `resolve()` to handle the initial URL hash
- **Content replacement** — Each content view renders into the same `#RoutedApp-Content-Container` using `RenderMethod: "replace"`
- **JSON route configuration** — All routes are declared in `providers/PictRouter-RoutedApp-Configuration.json`

## Build

```bash
npm install
npm run build
```

Open `dist/index.html` in a browser. Navigate using the top bar links or type a hash URL directly (e.g. `index.html#/Items/2`).
