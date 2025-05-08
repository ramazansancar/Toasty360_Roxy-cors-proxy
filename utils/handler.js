export const decodeHeaders = (base64OrUrlEncodedHeaders) => {
	const headers = {};

	if (!base64OrUrlEncodedHeaders) {
		return headers;
	}

	let decodedString = base64OrUrlEncodedHeaders;

	const isBase64 = /^[A-Za-z0-9+/=]+$/.test(base64OrUrlEncodedHeaders) && base64OrUrlEncodedHeaders.length % 4 === 0;
	try {
		if (isBase64) {
			decodedString = atob(base64OrUrlEncodedHeaders);
		} else {
			decodedString = decodeURIComponent(base64OrUrlEncodedHeaders);
		}

		let headersObj;
		try {
			headersObj = JSON.parse(decodedString);
		} catch (error) {
			console.error('Error parsing JSON:', error, 'Decoded string:', decodedString);
			return headers;
		}

		Object.entries(headersObj).forEach(([key, value]) => {
			headers[key] = value;
		});
		return headers;
	} catch (error) {
		console.error('Error decoding headers:', error);
		return headers;
	}
};

export const handleRequest = (request) => {
	const url = new URL(request.url);
	const urlParams = url.searchParams;
	const encodedUrl = urlParams.get('url');
	const headersBase64 = urlParams.get('headers');

	//bad code
	if (!encodedUrl) {
		return new Response('Url is required!', {
			status: 400,
		});
	}
	let targetUrl = decodeURIComponent(encodedUrl);
	try {
		targetUrl = atob(encodedUrl);
	} catch (error) {}

	const headers = decodeHeaders(headersBase64);

	return [targetUrl, headers, url.origin];
};
