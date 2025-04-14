import handleCorsRequest from './cors.js';
import proxy from './proxy.js';
import reverseProxy from './reverseProxy.js';
import { thumbnailHandler } from './thumbnails.js';
import { handleRequest } from '../utils/handler.js';

const handlePath = {
	'/proxy': proxy,
	'/reverse-proxy': reverseProxy,
	'/cors': handleCorsRequest,
	'/image': handleCorsRequest,
	'/thumbnail': thumbnailHandler,
};

export default {
	async fetch(request, env, context) {
		const url = new URL(request.url);
		const path = url.pathname;

		if (handlePath[path]) {
			if (path === '/proxy') {
				return handlePath[path](request, env, context);
			}
			return handlePath[path](...handleRequest(request));
		}

		if (path === '/favicon.ico') {
			return new Response(null, { status: 200 });
		}

		if (path === '/') {
			return new Response(
				JSON.stringify({
					message: 'Welcome to Roxy',
					Endpoints: [
						{ '/proxy': 'For HLS' },
						{ '/cors': 'For CORS' },
						{ '/image': 'For Manga Images' },
						{ '/thumbnail': 'For Thumbnails' },
					],
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		return new Response('Not Found', { status: 403 });
	},
};
