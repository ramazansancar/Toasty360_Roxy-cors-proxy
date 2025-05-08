import { handleRequest } from '../utils/handler';

function processM3U8Content(content, mediaUrl, origin, headers) {
	const hasHeaders = headers && Object.keys(headers).length > 0;
	const _headers = hasHeaders ? `&headers=${btoa(JSON.stringify(headers))}` : '';
	return content
		.split('\n')
		.map((line) => {
			const uriMatch = line.match(/(URI=)(["'])(?<uri>.*?)\2/);
			if (uriMatch) {
				const [fullMatch, prefix, quote] = uriMatch;
				console.log(fullMatch, prefix, quote);

				const resolvedUrl = new URL(uriMatch.groups.uri, mediaUrl).toString();
				const proxyUrl = `${origin}/proxy?url=${encodeURIComponent(resolvedUrl)}${_headers}`;
				return line.replace(fullMatch, `${prefix}${quote}${proxyUrl}${quote}`);
			}

			if (!line.startsWith('#') && line.trim()) {
				const resolvedUrl = new URL(line.trim(), mediaUrl).toString();
				const proxyUrl = `${origin}/proxy?url=${encodeURIComponent(resolvedUrl)}${_headers}`;
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
			'User-Agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/237.84.2.178 Safari/537.36',
			Connection: 'keep-alive',
			...decodedHeaders,
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
		const cleanHeaders = Object.fromEntries(
			Array.from(response.headers.entries()).filter(([key], i, arr) => arr.findIndex(([k]) => k.toLowerCase() === key.toLowerCase()) === i)
		);

		let responseContent = await response.text();
		if (!responseContent.trimStart().startsWith('#EXTM3U')) {
			return new Response(responseContent, {
				status: response.status,
				headers: {
					...cleanHeaders,
					'Access-Control-Allow-Origin': '*',
				},
			});
		}
		responseContent = processM3U8Content(responseContent, mediaUrl, origin, decodedHeaders);

		return new Response(responseContent, {
			headers: {
				...cleanHeaders,
				'Access-Control-Allow-Origin': '*',
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
