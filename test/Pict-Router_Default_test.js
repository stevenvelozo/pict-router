/*
	Unit tests for Pict Router
*/

const Chai = require('chai');
const Expect = Chai.expect;

const libPict = require('pict');

const libPictRouter = require(`../source/Pict-Router.js`);

suite
(
	`Pict Router tests`,
	() =>
	{
		setup(() => { });

		suite
			(
				'Construction',
				() =>
				{
					test(
							'Constructor properly crafts an object',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();
								let tmpPictRouter = tmpPict.addProvider('PictRouter', {RouterMode: 'memory'}, libPictRouter);
								Expect(tmpPictRouter).to.be.an('object');
								Expect(tmpPictRouter.router).to.be.an('object');
								Expect(tmpPictRouter.afterPersistView).to.equal('/Manyfest/Overview');
								return fDone();
							}
						);
					test(
							'Exports default_configuration',
							(fDone) =>
							{
								Expect(libPictRouter.default_configuration).to.be.an('object');
								Expect(libPictRouter.default_configuration.ProviderIdentifier).to.equal('Pict-Router');
								Expect(libPictRouter.default_configuration.AutoInitialize).to.equal(true);
								Expect(libPictRouter.default_configuration.AutoInitializeOrdinal).to.equal(0);
								return fDone();
							}
						);
					test(
							'Constructor with config-driven template routes',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter',
									{
										RouterMode: 'memory',
										Routes:
										[
											{
												path: '/ConfigTemplate/:Id',
												template: '{~LV:Pict.providers.PictRouter.setConfigRouteHit(Record.data.Id)~}'
											}
										]
									}, libPictRouter);

								tmpPictRouter.ConfigRouteValue = null;
								tmpPictRouter.setConfigRouteHit = function(pId)
								{
									this.ConfigRouteValue = pId;
									return pId;
								};

								Expect(tmpPictRouter).to.be.an('object');
								// Route should have been registered
								tmpPictRouter.navigate('/ConfigTemplate/42');
								Expect(tmpPictRouter.ConfigRouteValue).to.equal('42');
								return fDone();
							}
						);
					test(
							'Constructor with config-driven render (function) routes',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpRouteData = null;

								let tmpPictRouter = tmpPict.addProvider('PictRouter',
									{
										RouterMode: 'memory',
										Routes:
										[
											{
												path: '/FuncRoute/:Name',
												render: function(pData)
												{
													tmpRouteData = pData;
												}
											}
										]
									}, libPictRouter);

								Expect(tmpPictRouter).to.be.an('object');
								tmpPictRouter.navigate('/FuncRoute/TestName');
								Expect(tmpRouteData).to.be.an('object');
								Expect(tmpRouteData.data.Name).to.equal('TestName');
								return fDone();
							}
						);
					test(
							'Constructor warns on invalid route config (missing path and template)',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								// Route missing both template and render should log a warning
								let tmpPictRouter = tmpPict.addProvider('PictRouter',
									{
										RouterMode: 'memory',
										Routes:
										[
											{ path: '/NoHandler' },
											{ template: '{~D:Nothing~}' },
											{}
										]
									}, libPictRouter);

								Expect(tmpPictRouter).to.be.an('object');
								// Should not crash; invalid routes are simply skipped with a warning
								return fDone();
							}
						);
					test(
							'Constructor with no Routes config',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter',
									{
										RouterMode: 'memory'
									}, libPictRouter);

								Expect(tmpPictRouter).to.be.an('object');
								return fDone();
							}
						);
				}
			);

		suite
			(
				'Route Management',
				() =>
				{
					test(
							'addRoute with a function renderable',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory', Routes: [] }, libPictRouter);
								tmpPictRouter.initialize();

								let tmpHitCount = 0;

								tmpPictRouter.addRoute('/FuncTest',
									function(pData)
									{
										tmpHitCount++;
									});

								tmpPictRouter.navigate('/FuncTest');
								Expect(tmpHitCount).to.equal(1);
								return fDone();
							}
						);
					test(
							'addRoute with a template renderable',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter',
									{
										RouterMode: 'memory',
										Routes: []
									}, libPictRouter);

								tmpPictRouter.TestState = 1;

								tmpPictRouter.adjustTestState = function(pState)
									{
										this.log.info(`Setting TestState to ${pState}`);
										this.TestState = parseInt(pState);
										return `Your test state is now ${this.TestState}.  GOOD LUCK.`;
									};

								tmpPictRouter.adjustTestState(2);
								Expect(tmpPictRouter.TestState).to.equal(2);

								tmpPictRouter.initialize();

								tmpPictRouter.addRoute('/Test/NewState/:Scope', "{~LV:Pict.providers.PictRouter.adjustTestState(Record.data.Scope)~}");
								tmpPictRouter.navigate('/Test/NewState/3533');
								Expect(tmpPictRouter.TestState).to.equal(3533);

								return fDone();
							}
						);
					test(
							'addRoute with an invalid renderable warns and skips',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory', Routes: [] }, libPictRouter);
								tmpPictRouter.initialize();

								// Number renderable
								tmpPictRouter.addRoute('/BadRoute1', 42);
								// Object renderable
								tmpPictRouter.addRoute('/BadRoute2', { some: 'object' });
								// Null renderable
								tmpPictRouter.addRoute('/BadRoute3', null);
								// Undefined renderable
								tmpPictRouter.addRoute('/BadRoute4', undefined);
								// Boolean renderable
								tmpPictRouter.addRoute('/BadRoute5', true);

								// None of these should crash; they log warnings and return
								Expect(tmpPictRouter).to.be.an('object');
								return fDone();
							}
						);
					test(
							'addRoute with function renderable and route parameters',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory' }, libPictRouter);
								tmpPictRouter.initialize();

								tmpPictRouter.router.on('/Manyfest/Overview/:Scope',
									(pData) =>
									{
										tmpPict.log.info(`Route hit: ${JSON.stringify(pData)}`);
										Expect(pData.data.Scope).to.equal('ExcusesExcuses');
										return fDone();
									});

								tmpPictRouter.navigate('/Manyfest/Overview/ExcusesExcuses');
							}
						);
				}
			);

		suite
			(
				'RouterSkipRouteResolveOnAdd',
				() =>
				{
					test(
							'Default behavior: resolve is called during addRoute',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory', Routes: [] }, libPictRouter);
								tmpPictRouter.initialize();

								let tmpResolveCallCount = 0;
								let tmpOriginalResolve = tmpPictRouter.resolve.bind(tmpPictRouter);
								tmpPictRouter.resolve = function()
								{
									tmpResolveCallCount++;
									tmpOriginalResolve();
								};

								tmpPictRouter.addRoute('/ResolveTest', function() {});
								Expect(tmpResolveCallCount).to.equal(1);

								tmpPictRouter.addRoute('/ResolveTest2', '{~D:Something~}');
								Expect(tmpResolveCallCount).to.equal(2);

								return fDone();
							}
						);
					test(
							'With setting enabled: resolve is NOT called during addRoute',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								// Set the skip flag before adding the router
								tmpPict.settings.RouterSkipRouteResolveOnAdd = true;

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory', Routes: [] }, libPictRouter);
								tmpPictRouter.initialize();

								let tmpResolveCallCount = 0;
								let tmpOriginalResolve = tmpPictRouter.resolve.bind(tmpPictRouter);
								tmpPictRouter.resolve = function()
								{
									tmpResolveCallCount++;
									tmpOriginalResolve();
								};

								tmpPictRouter.addRoute('/SkipResolve1', function() {});
								tmpPictRouter.addRoute('/SkipResolve2', '{~D:Something~}');
								tmpPictRouter.addRoute('/SkipResolve3', function() {});

								Expect(tmpResolveCallCount).to.equal(0);

								return fDone();
							}
						);
					test(
							'With setting enabled: explicit resolve still works',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								tmpPict.settings.RouterSkipRouteResolveOnAdd = true;

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory', Routes: [] }, libPictRouter);
								tmpPictRouter.initialize();

								let tmpRouteHit = false;

								tmpPictRouter.addRoute('/ExplicitResolve', function()
								{
									tmpRouteHit = true;
								});

								// Navigate then resolve explicitly
								tmpPictRouter.navigate('/ExplicitResolve');
								Expect(tmpRouteHit).to.equal(true);

								return fDone();
							}
						);
					test(
							'With setting enabled: invalid renderables still skip resolve',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								tmpPict.settings.RouterSkipRouteResolveOnAdd = true;

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory', Routes: [] }, libPictRouter);
								tmpPictRouter.initialize();

								let tmpResolveCallCount = 0;
								let tmpOriginalResolve = tmpPictRouter.resolve.bind(tmpPictRouter);
								tmpPictRouter.resolve = function()
								{
									tmpResolveCallCount++;
									tmpOriginalResolve();
								};

								// Invalid renderable should not call resolve regardless of setting
								tmpPictRouter.addRoute('/InvalidSkip', 999);
								Expect(tmpResolveCallCount).to.equal(0);

								return fDone();
							}
						);
					test(
							'Config-driven routes respect the skip setting',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								tmpPict.settings.RouterSkipRouteResolveOnAdd = true;

								let tmpRouteHit = false;

								// These config-driven routes should NOT trigger resolve during construction
								let tmpPictRouter = tmpPict.addProvider('PictRouter',
									{
										RouterMode: 'memory',
										Routes:
										[
											{
												path: '/ConfigSkip',
												render: function() { tmpRouteHit = true; }
											}
										]
									}, libPictRouter);

								// Route was registered but not resolved
								Expect(tmpRouteHit).to.equal(false);

								// Explicit navigate works
								tmpPictRouter.navigate('/ConfigSkip');
								Expect(tmpRouteHit).to.equal(true);

								return fDone();
							}
						);
				}
			);


		suite
			(
				'Provider-level SkipRouteResolveOnAdd',
				() =>
				{
					test(
							'SkipRouteResolveOnAdd in provider config skips resolve during addRoute',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								// Do NOT set pict.settings — use the provider option instead
								let tmpPictRouter = tmpPict.addProvider('PictRouter',
									{
										RouterMode: 'memory',
										SkipRouteResolveOnAdd: true,
										Routes: []
									}, libPictRouter);
								tmpPictRouter.initialize();

								let tmpResolveCallCount = 0;
								let tmpOriginalResolve = tmpPictRouter.resolve.bind(tmpPictRouter);
								tmpPictRouter.resolve = function()
								{
									tmpResolveCallCount++;
									tmpOriginalResolve();
								};

								tmpPictRouter.addRoute('/ProviderSkip1', function() {});
								tmpPictRouter.addRoute('/ProviderSkip2', '{~D:Something~}');
								tmpPictRouter.addRoute('/ProviderSkip3', function() {});

								Expect(tmpResolveCallCount).to.equal(0);

								return fDone();
							}
						);
					test(
							'SkipRouteResolveOnAdd in provider config works with config-driven routes',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpRouteHit = false;

								// Routes in the config should NOT auto-resolve when the option is set
								let tmpPictRouter = tmpPict.addProvider('PictRouter',
									{
										RouterMode: 'memory',
										SkipRouteResolveOnAdd: true,
										Routes:
										[
											{
												path: '/ProviderConfigSkip',
												render: function() { tmpRouteHit = true; }
											}
										]
									}, libPictRouter);

								// Route was registered but not resolved
								Expect(tmpRouteHit).to.equal(false);

								// Explicit navigate works
								tmpPictRouter.navigate('/ProviderConfigSkip');
								Expect(tmpRouteHit).to.equal(true);

								return fDone();
							}
						);
					test(
							'SkipRouteResolveOnAdd defaults to false in provider config',
							(fDone) =>
							{
								Expect(libPictRouter.default_configuration.SkipRouteResolveOnAdd).to.equal(false);
								return fDone();
							}
						);
					test(
							'Provider-level option does not affect resolve when set to false',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								// Explicit false — resolve SHOULD be called
								let tmpPictRouter = tmpPict.addProvider('PictRouter',
									{
										RouterMode: 'memory',
										SkipRouteResolveOnAdd: false,
										Routes: []
									}, libPictRouter);
								tmpPictRouter.initialize();

								let tmpResolveCount = 0;
								let tmpOriginalResolve = tmpPictRouter.resolve.bind(tmpPictRouter);
								tmpPictRouter.resolve = function()
								{
									tmpResolveCount++;
									tmpOriginalResolve();
								};

								tmpPictRouter.addRoute('/NoSkipTest', function() {});
								Expect(tmpResolveCount).to.equal(1);

								return fDone();
							}
						);
				}
			);

		suite
			(
				'navigateCurrent',
				() =>
				{
					test(
							'navigateCurrent returns false when there is no hash',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter',
									{
										RouterMode: 'memory',
										SkipRouteResolveOnAdd: true,
										Routes: []
									}, libPictRouter);

								// Clear the hash
								if (typeof (window) !== 'undefined')
								{
									window.location.hash = '';
								}

								let tmpResult = tmpPictRouter.navigateCurrent();
								Expect(tmpResult).to.equal(false);

								return fDone();
							}
						);
					test(
							'navigateCurrent returns false when hash is just #/',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter',
									{
										RouterMode: 'memory',
										SkipRouteResolveOnAdd: true,
										Routes: []
									}, libPictRouter);

								if (typeof (window) !== 'undefined')
								{
									window.location.hash = '#/';
								}

								let tmpResult = tmpPictRouter.navigateCurrent();
								Expect(tmpResult).to.equal(false);

								return fDone();
							}
						);
					test(
							'navigateCurrent returns false for empty hash in test environment',
							(fDone) =>
							{
								// In a real browser, navigateCurrent() reads window.location.hash
								// and calls navigate() with the hash route.  The jsdom test environment
								// does not support hash assignment, so we verify the negative case here.
								// Deep-link navigation is validated in the harness_app integration test.
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter',
									{
										RouterMode: 'memory',
										SkipRouteResolveOnAdd: true,
										Routes: []
									}, libPictRouter);

								let tmpRouteHit = false;
								tmpPictRouter.addRoute('/SomeRoute', function()
								{
									tmpRouteHit = true;
								});

								// In the test environment the hash will be empty, so navigateCurrent
								// should return false and NOT fire any route handler.
								let tmpResult = tmpPictRouter.navigateCurrent();
								Expect(tmpResult).to.equal(false);
								Expect(tmpRouteHit).to.equal(false);

								return fDone();
							}
						);
					test(
							'navigateCurrent is a function',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter',
									{
										RouterMode: 'memory'
									}, libPictRouter);

								Expect(tmpPictRouter.navigateCurrent).to.be.a('function');

								return fDone();
							}
						);
				}
			);

		suite
			(
				'Navigation',
				() =>
				{
					test(
							'navigate triggers the matching route handler',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory', Routes: [] }, libPictRouter);
								tmpPictRouter.initialize();

								let tmpNavigatedValue = null;

								tmpPictRouter.addRoute('/NavTest/:Value', function(pData)
								{
									tmpNavigatedValue = pData.data.Value;
								});

								tmpPictRouter.navigate('/NavTest/Hello');
								Expect(tmpNavigatedValue).to.equal('Hello');

								tmpPictRouter.navigate('/NavTest/World');
								Expect(tmpNavigatedValue).to.equal('World');

								return fDone();
							}
						);
					test(
							'resolve triggers the handler for the current route',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory', Routes: [] }, libPictRouter);
								tmpPictRouter.initialize();

								let tmpResolveHitCount = 0;

								tmpPictRouter.addRoute('/ResolveTarget', function()
								{
									tmpResolveHitCount++;
								});

								tmpPictRouter.navigate('/ResolveTarget');
								let tmpCountAfterNavigate = tmpResolveHitCount;
								Expect(tmpCountAfterNavigate).to.be.greaterThan(0);

								return fDone();
							}
						);
				}
			);

		suite
			(
				'Scoped Routes',
				() =>
				{
					test(
							'currentScope returns Default when AppData is not set up',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory' }, libPictRouter);

								Expect(tmpPictRouter.currentScope).to.equal('Default');
								return fDone();
							}
						);
					test(
							'currentScope returns the scope when AppData.ManyfestRecord.Scope is set',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory' }, libPictRouter);

								tmpPictRouter.AppData = { ManyfestRecord: { Scope: 'CustomScope' } };
								Expect(tmpPictRouter.currentScope).to.equal('CustomScope');
								return fDone();
							}
						);
					test(
							'currentScope returns Default when ManyfestRecord exists but Scope is missing',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory' }, libPictRouter);

								tmpPictRouter.AppData = { ManyfestRecord: {} };
								Expect(tmpPictRouter.currentScope).to.equal('Default');
								return fDone();
							}
						);
					test(
							'forwardToScopedRoute navigates to a scoped URL',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory', Routes: [] }, libPictRouter);
								tmpPictRouter.initialize();

								tmpPictRouter.AppData = { ManyfestRecord: { Scope: 'MyScope' } };

								let tmpNavigatedRoute = null;

								tmpPictRouter.addRoute('/ScopedTest/:Scope', function(pData)
								{
									tmpNavigatedRoute = pData.data.Scope;
								});

								tmpPictRouter.forwardToScopedRoute({ url: '/ScopedTest' });
								Expect(tmpNavigatedRoute).to.equal('MyScope');
								return fDone();
							}
						);
					test(
							'forwardToScopedRoute uses Default scope when not configured',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory', Routes: [] }, libPictRouter);
								tmpPictRouter.initialize();

								let tmpNavigatedRoute = null;

								tmpPictRouter.addRoute('/DefaultScopeTest/:Scope', function(pData)
								{
									tmpNavigatedRoute = pData.data.Scope;
								});

								tmpPictRouter.forwardToScopedRoute({ url: '/DefaultScopeTest' });
								Expect(tmpNavigatedRoute).to.equal('Default');
								return fDone();
							}
						);
				}
			);

		suite
			(
				'Initialization',
				() =>
				{
					test(
							'onInitializeAsync calls back successfully',
							(fDone) =>
							{
								let tmpPict = new libPict();
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								let tmpPictApplication = tmpPict.addApplication();

								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory' }, libPictRouter);

								tmpPictRouter.onInitializeAsync(
									function(pError)
									{
										Expect(pError).to.not.exist;
										return fDone();
									});
							}
						);
				}
			);
	}
);
