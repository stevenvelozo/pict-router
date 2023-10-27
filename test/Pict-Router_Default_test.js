/*
	Basic Unit tests for Pict Router
*/

// This is temporary, but enables unit tests
//const libBrowserEnv = require('browser-env')
//libBrowserEnv();

const Chai = require('chai');
const Expect = Chai.expect;

const libPict = require('pict');

const libPictRouter = require(`../source/Pict-Router.js`);

suite
(
	`Basic Pict Router tests`,
	() =>
	{
		setup(() => { });

		suite
			(
				'Basic Tests',
				() =>
				{
					test(
							'Constructor properly crafts an object',
							(fDone) =>
							{
								let tmpPict = new libPict();
								// Initialize the environment
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								// Create a shell application
								let tmpPictApplication = tmpPict.addApplication();
								// Add the view
								let tmpPictRouter = tmpPict.addView('Simple-Router', {RouterMode: 'memory'}, libPictRouter);
								Expect(tmpPictRouter).to.be.an('object');
								return fDone();
							}
						);
					test(
							'Create and exercise a route with no render function',
							(fDone) =>
							{
								let tmpPict = new libPict();
								tmpPict.LogNoisiness = 5;
								// Initialize the environment
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								// Create a shell application
								let tmpPictApplication = tmpPict.addApplication();
								// Add the view
								let tmpPictRouter = tmpPict.addView('Simple-Router', 
									{
										RouterMode: 'memory', 
										Routes: [
											{
												path:'/foo',
												render: (params, query, hash = '') =>
												{
													tmpPict.log.debug(`Rendering route ${params} ${query} ${hash}`);
												}
											}]}, libPictRouter);
								// Do something silly with our route.
								tmpPictRouter.onRenderDefault = (pRoute) =>
								{
									
								};
								// Overload the onChange method so we can test the state changes
								tmpPictRouter.onChange = (pRoute) =>
								{
									Expect(tmpPictRouter.VisitedRoutes.length).to.equal(1);
									Expect(tmpPictRouter.VisitedRoutes[0]).to.equal('/foo#bar?dog=cat');
									return fDone();
								};

								tmpPictRouter.initialize();
								Expect(tmpPictRouter).to.be.an('object');
								tmpPictRouter._router.href('/foo#bar?dog=cat');
							}
						);
				}
			);
	}
);