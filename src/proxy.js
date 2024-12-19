const m3u8ContentTypes = [
	'application/vnd.apple.mpegurl', // Standard HLS playlist
	'application/x-mpegurl', // Common alias
	'audio/x-mpegurl', // Audio HLS playlists
	'audio/mpegurl', // Less common
	'video/x-mpegurl', // Video HLS playlists
	'application/mpegurl', // Alternate generic HLS
	'application/x-hls', // Explicit HLS content type
	'application/x-apple-hls', // Apple-specific HLS type
];

const videoContentTypes = [
	'video/mp4',
	'video/webm',
	'video/ogg',
	'video/quicktime',
	'video/MP2T', // Transport Stream (HLS segments)
	'application/mp4',
	'video/x-m4v',
	...m3u8ContentTypes, // Include HLS playlist MIME types
];

const CACHE_CONTROL_SETTINGS = {
	MASTER: 'public, max-age=30, s-maxage=30',
	MEDIA: 'public, max-age=300, s-maxage=300',
	SEGMENT: 'public, max-age=86400, s-maxage=86400',
	KEY: 'public, max-age=3600, s-maxage=3600',
	ERROR: 'no-store',
};

function decodeHeaders(base64Headers) {
	const headers = new Headers();
	if (!base64Headers) return headers;
	try {
		const decodedString = atob(base64Headers);
		const headersObj = JSON.parse(decodedString);

		Object.entries(headersObj).forEach(([key, value]) => {
			headers.append(key, value);
		});
		return headers;
	} catch (error) {
		return null;
	}
}

function getCacheSettings(url, content) {
	if (url.includes('.ts') || url.includes('.m4s')) {
		return CACHE_CONTROL_SETTINGS.SEGMENT;
	}
	if (url.includes('.m3u8')) {
		return content.includes('#EXT-X-STREAM-INF') ? CACHE_CONTROL_SETTINGS.MASTER : CACHE_CONTROL_SETTINGS.MEDIA;
	}
	if (url.includes('.key')) {
		return CACHE_CONTROL_SETTINGS.KEY;
	}
	return CACHE_CONTROL_SETTINGS.ERROR;
}

async function proxy(request) {
	const cache = caches.default;
	const url = new URL(request.url);

	if (request.method === 'OPTIONS') {
		return new Response(null, {
			status: 204,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				'Access-Control-Max-Age': '86400',
			},
		});
	}

	const cacheKey = new Request(url.toString(), request);
	try {
		let response = await cache.match(cacheKey);
		if (response) return response;

		const urlParams = url.searchParams;
		const encodedUrl = urlParams.get('url');
		const headersBase64 = urlParams.get('headers');

		if (!encodedUrl) {
			return new Response('"url" query parameters are required', {
				status: 400,
				headers: {
					'Cache-Control': 'no-store',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		const mediaUrl = atob(decodeURIComponent(encodedUrl));
		const decodedHeaders = decodeHeaders(headersBase64);

		if (!decodedHeaders) {
			return new Response('Invalid headers format. Must be valid base64-encoded JSON.', {
				status: 400,
				headers: {
					'Cache-Control': 'no-store',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}

		const baseUrl = new URL(mediaUrl);
		const basePath = `${baseUrl.protocol}//${baseUrl.host}${baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf('/') + 1)}`;
		response = await fetch(mediaUrl, {
			headers: {
				...Object.fromEntries(decodedHeaders.entries()),
				'Accept-Encoding': 'gzip, deflate, br',
				Connection: 'keep-alive',
			},
			cf: {
				cacheEverything: true,
				cacheTtl: mediaUrl.includes('.m3u8') ? 300 : 86400,
				minify: true,
				mirage: true,
				polish: 'lossy',
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const contentType = response.headers.get('content-type') || 'application/octet-stream';
		const isM3U8 = videoContentTypes.some((type) => contentType.includes(type));
		const responseContent = isM3U8 ? await response.text() : null;
		const cacheControl = isM3U8 ? getCacheSettings(mediaUrl, responseContent) : CACHE_CONTROL_SETTINGS.SEGMENT;

		if (!isM3U8) {
			const newResponse = new Response(response.body, {
				headers: {
					'Content-Type': contentType,
					'Cache-Control': cacheControl,
					'Access-Control-Allow-Origin': '*',
					'CF-Cache-Status': 'DYNAMIC',
					'Accept-Ranges': 'bytes',
					'Transfer-Encoding': 'chunked',
				},
			});

			await cache.put(cacheKey, newResponse.clone());
			return newResponse;
		}

		const modifiedBody = responseContent.replace(/^(?!#)([^\s]+)$/gm, (match) => {
			const fullUrl = match.startsWith('http')
				? match
				: match.startsWith('/')
				? `${baseUrl.protocol}//${baseUrl.host}${match}`
				: `${basePath}${match}`;
			return `${new URL(request.url).origin}/proxy?url=${encodeURIComponent(btoa(fullUrl))}&headers=${encodeURIComponent(headersBase64)}`;
		});

		const newResponse = new Response(modifiedBody, {
			headers: {
				'Content-Type': 'application/vnd.apple.mpegurl',
				'Cache-Control': cacheControl,
				'Access-Control-Allow-Origin': '*',
				'CF-Cache-Status': 'DYNAMIC',
				'Accept-Ranges': 'bytes',
				'Transfer-Encoding': 'chunked',
			},
		});

		if (cacheControl !== CACHE_CONTROL_SETTINGS.ERROR && request.method !== 'HEAD') {
			await cache.put(cacheKey, newResponse.clone());
		}
		return newResponse;
	} catch (error) {
		console.error('Error in proxy:', error);
		return new Response(`Proxy error: ${error.message}`, {
			status: 500,
			headers: {
				'Cache-Control': CACHE_CONTROL_SETTINGS.ERROR,
				'Access-Control-Allow-Origin': '*',
			},
		});
	}
}

export default proxy;
