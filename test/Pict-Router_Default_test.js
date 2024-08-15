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
								// Create the application
								let tmpPictApplication = tmpPict.addApplication();
								// Add the router provider
								let tmpPictRouter = tmpPict.addProvider('PictRouter', {RouterMode: 'memory'}, libPictRouter);
								Expect(tmpPictRouter).to.be.an('object');
								return fDone();
							}
						);
					test(
							'Create and exercise a route',
							(fDone) =>
							{
								let tmpPict = new libPict();
								tmpPict.LogNoisiness = 5;
								// Initialize the environment
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								// Create the application
								let tmpPictApplication = tmpPict.addApplication();

								// Add the router provider
								// TODO: AddOnce?
								let tmpPictRouter = tmpPict.addProvider('PictRouter', { RouterMode: 'memory'}, libPictRouter);
								tmpPictRouter.initialize();

								Expect(tmpPictRouter).to.be.an('object');

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
					test(
							'Create and exercise a route with a template',
							(fDone) =>
							{
								let tmpPict = new libPict();
								tmpPict.LogNoisiness = 5;
								// Initialize the environment
								let tmpPictEnvironment = new libPict.EnvironmentObject(tmpPict);
								// Create the application
								let tmpPictApplication = tmpPict.addApplication();

								// Add the router provider
								let tmpPictRouter = tmpPict.addProvider('PictRouter', 
									{
										RouterMode: 'memory', 
										Routes: []
									}, libPictRouter);

								tmpPictRouter.TestState = 1;

								Expect(tmpPictRouter).to.be.an('object');
								Expect(tmpPictRouter.TestState).to.equal(1);

								tmpPictRouter.adjustTestState = function(pState)
									{
										this.log.info(`Setting TestState to ${pState}`);
										this.TestState = parseInt(pState);
										return `Your test state is now ${this.TestState}.  GOOD LUCK.`;
									};

								tmpPictRouter.adjustTestState(2);
								Expect(tmpPictRouter.TestState).to.equal(2);

								tmpPictRouter.initialize();

								Expect(tmpPictRouter).to.be.an('object');

								tmpPictRouter.addRoute('/Test/NewState/:Scope', "{~LV:Pict.providers.PictRouter.adjustTestState(Record.data.Scope)~}");
								tmpPictRouter.navigate('/Test/NewState/3533');
								Expect(tmpPictRouter.TestState).to.equal(3533);

								return fDone();
							}
						);
				}
			);
	}
);