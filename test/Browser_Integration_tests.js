/**
 * Headless browser integration tests for pict-router.
 *
 * Verifies routing features that require a real browser environment:
 *   1) PictRouter and Pict globals load correctly
 *   2) Basic route navigation fires handlers
 *   3) SkipRouteResolveOnAdd prevents auto-resolve during construction
 *   4) navigateCurrent() reads the browser hash and navigates
 *
 * Requires: npm run build (quackage) to have been run first so dist/ exists.
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */

const Chai = require('chai');
const Expect = Chai.expect;

const libHTTP = require('http');
const libFS = require('fs');
const libPath = require('path');

const _PackageRoot = libPath.resolve(__dirname, '..');
const _DistDir = libPath.join(_PackageRoot, 'dist');
const _PictDistDir = libPath.join(_PackageRoot, 'node_modules', 'pict', 'dist');

/**
 * Create a simple HTTP server that serves the static files needed
 * for the browser test page.
 *
 * @param {function} fCallback - Callback with (pError, pServer, pPort)
 */
function startTestServer(fCallback)
{
	let tmpMimeTypes =
	{
		'.html': 'text/html',
		'.js': 'application/javascript',
		'.map': 'application/json'
	};

	let tmpServer = libHTTP.createServer(
		(pRequest, pResponse) =>
		{
			let tmpUrl = pRequest.url;

			// Route: / -> test page (generated inline)
			if (tmpUrl === '/' || tmpUrl === '/index.html')
			{
				pResponse.writeHead(200, { 'Content-Type': 'text/html' });
				pResponse.end(generateTestHTML());
				return;
			}

			// Route: /pict.js -> from node_modules/pict/dist/
			if (tmpUrl === '/pict.js')
			{
				serveFile(libPath.join(_PictDistDir, 'pict.js'), pResponse, tmpMimeTypes);
				return;
			}

			// Route: /pict-router.* -> from dist/
			if (tmpUrl.startsWith('/pict-router'))
			{
				serveFile(libPath.join(_DistDir, tmpUrl.slice(1)), pResponse, tmpMimeTypes);
				return;
			}

			pResponse.writeHead(404);
			pResponse.end('Not Found');
		});

	// Listen on a random available port
	tmpServer.listen(0, '127.0.0.1',
		() =>
		{
			let tmpPort = tmpServer.address().port;
			return fCallback(null, tmpServer, tmpPort);
		});
}

/**
 * Serve a static file from the filesystem.
 *
 * @param {string} pFilePath - Absolute path to file
 * @param {object} pResponse - HTTP response object
 * @param {object} pMimeTypes - Extension -> MIME type map
 */
function serveFile(pFilePath, pResponse, pMimeTypes)
{
	if (!libFS.existsSync(pFilePath))
	{
		pResponse.writeHead(404);
		pResponse.end('File not found: ' + pFilePath);
		return;
	}

	let tmpExt = libPath.extname(pFilePath);
	let tmpContentType = pMimeTypes[tmpExt] || 'application/octet-stream';

	let tmpContent = libFS.readFileSync(pFilePath);
	pResponse.writeHead(200, { 'Content-Type': tmpContentType });
	pResponse.end(tmpContent);
}

/**
 * Generate the test HTML page that runs in the browser.
 *
 * Loads pict.js (creates global Pict) and pict-router.js (creates global
 * PictRouter), then exercises the router features.  Results are stored on
 * window.__TEST_RESULTS__.
 *
 * @returns {string} HTML content
 */
function generateTestHTML()
{
	return `<!DOCTYPE html>
<html>
<head><title>Pict-Router Browser Tests</title></head>
<body>
<h1>Pict-Router Browser Integration Tests</h1>
<pre id="output">Running tests...</pre>

<!-- Load pict (creates global Pict) -->
<script src="/pict.js"></script>

<!-- Load pict-router (creates global PictRouter) -->
<script src="/pict-router.js"></script>

<script>
(function runTests()
{
	var results = [];
	var output = document.getElementById('output');

	function addResult(pName, pPassed, pError)
	{
		results.push({ name: pName, passed: pPassed, error: pError || null });
		output.textContent += '\\n' + (pPassed ? 'PASS' : 'FAIL') + ': ' + pName;
		if (pError)
		{
			output.textContent += ' (' + pError + ')';
		}
	}

	// Helper to destroy a router between tests to avoid Navigo listener leaks
	function destroyRouter(pPict)
	{
		if (pPict && pPict.providers && pPict.providers.PictRouter
			&& pPict.providers.PictRouter.router
			&& typeof pPict.providers.PictRouter.router.destroy === 'function')
		{
			pPict.providers.PictRouter.router.destroy();
		}
	}

	try
	{
		// ---- Test 1: Pict global is available ----
		addResult(
			'Pict global available',
			typeof Pict !== 'undefined' && typeof Pict === 'function'
		);

		// ---- Test 2: PictRouter global is available ----
		addResult(
			'PictRouter global available',
			typeof PictRouter !== 'undefined' && typeof PictRouter === 'function'
		);

		// ---- Test 3: Basic route fires handler ----
		var basicHandlerCalled = false;
		window.location.hash = '';
		var pict1 = new Pict({ Product: 'RouterTest1', ProductVersion: '1.0.0' });
		pict1.addProvider('PictRouter',
			{
				SkipRouteResolveOnAdd: true,
				Routes:
				[
					{
						path: '/BasicTest',
						render: function() { basicHandlerCalled = true; }
					}
				]
			}, PictRouter);
		pict1.providers.PictRouter.navigate('/BasicTest');
		addResult(
			'Basic route fires handler',
			basicHandlerCalled === true
		);
		destroyRouter(pict1);

		// ---- Test 4: SkipRouteResolveOnAdd prevents auto-resolve ----
		// Set the hash to a route BEFORE creating the router, so that if
		// addRoute() auto-resolved it would match and fire the handler.
		window.location.hash = '#/SkipTest';
		var skipHandlerCallCount = 0;
		var pict2 = new Pict({ Product: 'RouterTest2', ProductVersion: '1.0.0' });
		pict2.addProvider('PictRouter',
			{
				SkipRouteResolveOnAdd: true,
				Routes:
				[
					{
						path: '/SkipTest',
						render: function() { skipHandlerCallCount++; }
					}
				]
			}, PictRouter);
		// With SkipRouteResolveOnAdd: true, the handler should NOT have fired yet
		var notFiredDuringAdd = (skipHandlerCallCount === 0);
		// Now resolve manually — the hash #/SkipTest should match
		pict2.providers.PictRouter.resolve();
		var firedAfterResolve = (skipHandlerCallCount === 1);
		addResult(
			'SkipRouteResolveOnAdd prevents auto-resolve',
			notFiredDuringAdd && firedAfterResolve,
			!notFiredDuringAdd ? 'handler fired during addRoute (should have been skipped)'
				: (!firedAfterResolve ? 'handler did not fire after explicit resolve() (count: ' + skipHandlerCallCount + ')' : null)
		);
		destroyRouter(pict2);

		// ---- Test 5: navigateCurrent returns false for empty hash ----
		window.location.hash = '';
		var pict3 = new Pict({ Product: 'RouterTest3', ProductVersion: '1.0.0' });
		pict3.addProvider('PictRouter',
			{
				SkipRouteResolveOnAdd: true
			}, PictRouter);
		var emptyResult = pict3.providers.PictRouter.navigateCurrent();
		addResult(
			'navigateCurrent returns false for empty hash',
			emptyResult === false
		);
		destroyRouter(pict3);

		// ---- Test 6: navigateCurrent navigates to current hash ----
		var deepLinkHandlerCalled = false;
		var pict4 = new Pict({ Product: 'RouterTest4', ProductVersion: '1.0.0' });
		pict4.addProvider('PictRouter',
			{
				SkipRouteResolveOnAdd: true,
				Routes:
				[
					{
						path: '/DeepLink',
						render: function() { deepLinkHandlerCalled = true; }
					}
				]
			}, PictRouter);
		window.location.hash = '#/DeepLink';
		var navResult = pict4.providers.PictRouter.navigateCurrent();
		addResult(
			'navigateCurrent navigates to current hash',
			navResult === true && deepLinkHandlerCalled === true,
			navResult !== true ? 'navigateCurrent returned ' + navResult
				: (!deepLinkHandlerCalled ? 'handler was not called' : null)
		);
		destroyRouter(pict4);

		// Clean up the hash
		window.location.hash = '';
	}
	catch (pError)
	{
		addResult('unexpected error', false, pError.message || String(pError));
	}

	// Store final results for puppeteer to read
	window.__TEST_RESULTS__ = results;
	window.__TESTS_COMPLETE__ = true;

	output.textContent += '\\n\\nDone: '
		+ results.filter(function(r) { return r.passed; }).length + '/'
		+ results.length + ' passed';
})();
</script>
</body>
</html>`;
}

suite
(
	'Browser-Integration',
	function()
	{
		// Browser tests need extra time for puppeteer startup
		this.timeout(60000);

		let _Server;
		let _Port;
		let _Browser;
		let _Puppeteer;

		suiteSetup
		(
			function(fDone)
			{
				// Verify dist/ exists
				if (!libFS.existsSync(libPath.join(_DistDir, 'pict-router.js')))
				{
					return fDone(new Error(
						'dist/pict-router.js not found. Run "npm run build" first.'
					));
				}

				// Verify pict dist exists
				if (!libFS.existsSync(libPath.join(_PictDistDir, 'pict.js')))
				{
					return fDone(new Error(
						'node_modules/pict/dist/pict.js not found. Run "npm install" first.'
					));
				}

				// Start the test server
				startTestServer(
					function(pError, pServer, pPort)
					{
						if (pError)
						{
							return fDone(pError);
						}
						_Server = pServer;
						_Port = pPort;

						// Load puppeteer
						try
						{
							_Puppeteer = require('puppeteer');
						}
						catch (pRequireError)
						{
							_Server.close();
							return fDone(new Error(
								'puppeteer is not installed. Run "npm install" to install it as a devDependency.'
							));
						}

						return fDone();
					});
			}
		);

		suiteTeardown
		(
			function(fDone)
			{
				let tmpCleanupSteps = [];

				if (_Browser)
				{
					tmpCleanupSteps.push(_Browser.close().catch(() => {}));
				}

				Promise.all(tmpCleanupSteps).then(
					function()
					{
						if (_Server)
						{
							_Server.close(fDone);
						}
						else
						{
							fDone();
						}
					});
			}
		);

		test
		(
			'All browser tests pass in headless Chrome',
			function(fDone)
			{
				_Puppeteer.launch(
					{
						headless: true,
						args: ['--no-sandbox', '--disable-setuid-sandbox']
					})
					.then(
						function(pBrowser)
						{
							_Browser = pBrowser;
							return _Browser.newPage();
						})
					.then(
						function(pPage)
						{
							// Capture console output for debugging
							pPage.on('console',
								function(pMessage)
								{
									if (pMessage.type() === 'error')
									{
										console.log('  [browser error]', pMessage.text());
									}
								});

							pPage.on('pageerror',
								function(pError)
								{
									console.log('  [browser page error]', pError.message);
								});

							return pPage.goto(`http://127.0.0.1:${_Port}/`, { waitUntil: 'networkidle0', timeout: 30000 })
								.then(function() { return pPage; });
						})
					.then(
						function(pPage)
						{
							// Wait for tests to complete
							return pPage.waitForFunction(
								'window.__TESTS_COMPLETE__ === true',
								{ timeout: 30000 }
							).then(function() { return pPage; });
						})
					.then(
						function(pPage)
						{
							// Read results
							return pPage.evaluate(function()
							{
								return window.__TEST_RESULTS__;
							});
						})
					.then(
						function(pResults)
						{
							// Assert each test passed
							Expect(pResults).to.be.an('array');
							Expect(pResults.length).to.be.above(0);

							let tmpFailures = [];

							for (let i = 0; i < pResults.length; i++)
							{
								let tmpResult = pResults[i];
								if (!tmpResult.passed)
								{
									tmpFailures.push(
										tmpResult.name + (tmpResult.error ? ': ' + tmpResult.error : '')
									);
								}
							}

							if (tmpFailures.length > 0)
							{
								Expect.fail(
									'Browser tests failed:\n  - ' + tmpFailures.join('\n  - ')
								);
							}

							console.log(`    ${pResults.length} browser sub-tests passed`);
							fDone();
						})
					.catch(
						function(pError)
						{
							fDone(pError);
						});
			}
		);
	}
);
