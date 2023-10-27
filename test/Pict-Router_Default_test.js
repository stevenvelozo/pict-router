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
								// Initialize the environment
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								// Create a shell application
								let tmpPictApplication = tmpPict.addApplication();
								// Add the view
								let tmpPictRouter = tmpPict.addView('Simple-Router', {RouterMode: 'memory', Routes: [{path:'/foo'}]}, libPictRouter);
								tmpPictRouter.initialize();
								Expect(tmpPictRouter).to.be.an('object');
								tmpPictRouter._router.navigate('/foo');
								return fDone();
							}
						);
				}
			);
	}
);