import { handleRequest } from '../utils/handler';

const m3u8ContentTypes = [
	'application/vnd.apple.mpegurl',
	'application/x-mpegurl',
	'audio/x-mpegurl',
	'audio/mpegurl',
	'video/x-mpegurl',
	'application/mpegurl',
	'application/x-hls',
	'application/x-apple-hls',
];

function processM3U8Content(content, mediaUrl, origin) {
	return content
		.split('\n')
		.map((line) => {
			// Process URI attributes in tags
			const uriMatch = line.match(/(URI=)(["'])(?<uri>.*?)\2/);
			if (uriMatch) {
				const [fullMatch, prefix, quote] = uriMatch;
				const resolvedUrl = new URL(uriMatch.groups.uri, mediaUrl).toString();
				const proxyUrl = `${origin}/proxy?url=${encodeURIComponent(resolvedUrl)}`;
				return line.replace(fullMatch, `${prefix}${quote}${proxyUrl}${quote}`);
			}

			// Process segment URLs
			if (!line.startsWith('#') && line.trim()) {
				const resolvedUrl = new URL(line.trim(), mediaUrl).toString();
				const proxyUrl = `${origin}/proxy?url=${encodeURIComponent(resolvedUrl)}`;
				return line.replace(line.trim(), proxyUrl);
			}

			return line;
		})
		.join('\n');
}
async function proxy(request) {
	if (request.method === 'OPTIONS') {
		return new Response(null, {
			status: 204,
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
				'Access-Control-Max-Age': '86400',
			},
		});
	}

	try {
		let [mediaUrl, decodedHeaders, origin] = handleRequest(request);

		const rangeHeader = request.headers.get('Range');
		const fetchHeaders = {
			...decodedHeaders,
			'Accept-Encoding': 'gzip, deflate, br',
			Connection: 'keep-alive',
		};

		if (rangeHeader) {
			fetchHeaders['Range'] = rangeHeader;
		}

		const response = await fetch(mediaUrl, {
			headers: fetchHeaders,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const contentType = response.headers.get('content-type');
		const isM3U8 = m3u8ContentTypes.some((type) => contentType.includes(type));

		if (!isM3U8) {
			return new Response(response.body, {
				status: response.status,
				headers: {
					'Content-Type': contentType,
					'Access-Control-Allow-Origin': '*',
					'Accept-Ranges': 'bytes',
					'Content-Length': response.headers.get('content-length'),
					'Content-Range': response.headers.get('content-range'),
				},
			});
		}

		let responseContent = await response.text();
		responseContent = processM3U8Content(responseContent, mediaUrl, origin);
		return new Response(responseContent, {
			headers: {
				'Content-Type': 'application/vnd.apple.mpegurl',
				'Access-Control-Allow-Origin': '*',
				'Accept-Ranges': 'bytes',
			},
		});
	} catch (error) {
		console.error('Error in proxy:', error);
		return new Response(`Proxy error: ${error.message}`, {
			status: 500,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
		});
	}
}

export default proxy;
