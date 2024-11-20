export = PictRouter;
declare class PictRouter {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    router: any;
    afterPersistView: string;
    get currentScope(): any;
    forwardToScopedRoute(pData: any): void;
    onInitializeAsync(fCallback: any): any;
    /**
     * Add a route to the router.
     */
    addRoute(pRoute: any, pRenderable: any): void;
    /**
     * Navigate to a given route (set the browser URL string, add to history, trigger router)
     *
     * @param {string} pRoute - The route to navigate to
     */
    navigate(pRoute: string): void;
    /**
     * Trigger the router resolving logic; this is expected to be called after all routes are added (to go to the default route).
     *
     */
    resolve(): void;
}
declare namespace PictRouter {
    export { _DEFAULT_PROVIDER_CONFIGURATION as default_configuration };
}
declare namespace _DEFAULT_PROVIDER_CONFIGURATION {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
}
//# sourceMappingURL=Pict-Router.d.ts.map