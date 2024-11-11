/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// index.js

import handleCorsRequest from './cors.js';
import home from './home.js';
import proxy from './proxy.js';

export default {
	async fetch(request) {
		const url = new URL(request.url);

		if (url.pathname === '/proxy') {
			return proxy(request);
		} else if (url.pathname === '/cors') {
			return handleCorsRequest(request);
		} else if (url.pathname === '/') {
			return home();
		}

		return new Response('Not Found', { status: 404 });
	},
};
