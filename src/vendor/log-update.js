// Fork of `log-update` without `wrap-ansi` until https://github.com/chalk/wrap-ansi/issues/27 is closed
// Disable some eslint rules to closely match the original source
/* eslint-disable prefer-destructuring, prefer-object-spread, prefer-rest-params */
'use strict';
const ansiEscapes = require('ansi-escapes');
const cliCursor = require('cli-cursor');
const wrapAnsi = require('wrap-ansi');

const getWidth = stream => {
	const columns = stream.columns;

	if (!columns) {
		return 80;
	}

	// Windows appears to wrap a character early
	// I hate Windows so much
	if (process.platform === 'win32') {
		return columns - 1;
	}

	return columns;
};

const main = (stream, options) => {
	options = Object.assign({
		showCursor: false
	}, options);

	let prevLineCount = 0;

	const render = function () {
		if (!options.showCursor) {
			cliCursor.hide();
		}

		const out = [].join.call(arguments, ' ') + '\n';
		const wrappedOut = wrapAnsi(out, getWidth(stream), {
			trim: false,
			hard: true,
			wordWrap: false
		});

		stream.write(ansiEscapes.eraseLines(prevLineCount) + out);
		prevLineCount = wrappedOut.split('\n').length;
	};

	render.clear = () => {
		stream.write(ansiEscapes.eraseLines(prevLineCount));
		prevLineCount = 0;
	};

	render.done = () => {
		prevLineCount = 0;

		if (!options.showCursor) {
			cliCursor.show();
		}
	};

	return render;
};

module.exports = main(process.stdout);
module.exports.stderr = main(process.stderr);
module.exports.create = main;
