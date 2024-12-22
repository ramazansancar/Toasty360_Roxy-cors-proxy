export const decodeHeaders = (base64Headers) => {
	const headers = new Headers();
	if (!base64Headers) return headers;
	try {
		const decodedString = atob(base64Headers);
		const headersObj = JSON.parse(decodedString);

		Object.entries(headersObj).forEach(([key, value]) => {
			headers.append(key, value);
		});
		headers.append(
			'User-Agent',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/237.84.2.178 Safari/537.36'
		);
		return headers;
	} catch (error) {
		return headers;
	}
};

export const handleRequest = (request) => {
	const url = new URL(request.url);
	const urlParams = url.searchParams;
	const encodedUrl = urlParams.get('url');
	const headersBase64 = urlParams.get('headers');
	if (!encodedUrl) {
		return new Response('Url is required!', {
			status: 400,
		});
	}
	let targetUrl;
	try {
		targetUrl = atob(encodedUrl);
	} catch (error) {
		targetUrl = encodedUrl;
	}

	const headers = decodeHeaders(headersBase64);
	return [targetUrl, headers, url.origin];
};
