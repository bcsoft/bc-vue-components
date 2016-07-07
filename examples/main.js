require(['../tools/main.js'], function () {
	require(demos || [], function () {
		console.log("init deps: %s", (demos || []).toString());
	});
});