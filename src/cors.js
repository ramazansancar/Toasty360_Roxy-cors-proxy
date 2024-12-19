async function handleCorsRequest(request) {
	const urlParams = new URL(request.url).searchParams;
	const encodedUrl = urlParams.get('url');
	const headersBase64 = urlParams.get('headers');

	if (!encodedUrl) {
		return new Response('Invalid URL format. Must be a valid base64-encoded URL.', {
			status: 400,
		});
	}

	// Decode the base64-encoded URL
	let targetUrl;
	try {
		targetUrl = atob(encodedUrl);
	} catch (error) {
		return new Response('Failed to decode URL. Ensure it is base64-encoded.', {
			status: 400,
		});
	}

	let decodedHeaders = {};
	if (headersBase64) {
		try {
			const decodedString = atob(headersBase64);
			decodedHeaders = JSON.parse(decodedString);
		} catch (error) {
			return new Response('Invalid headers format. Must be valid base64-encoded JSON.', {
				status: 400,
			});
		}
	}

	// Convert the plain JSON headers object to a Headers instance
	const headers = new Headers();
	headers.append(
		'User-Agent',
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/237.84.2.178 Safari/537.36'
	);
	for (const [key, value] of Object.entries(decodedHeaders)) {
		headers.append(key, value);
	}

	try {
		// Fetch the target URL with the specified headers
		const response = await fetch(targetUrl, {
			redirect: 'follow',
			headers,
		});

		// Stream the response body back to the client
		return new Response(response.body, {
			status: response.status,
			headers: {
				'Access-Control-Allow-Origin': '*', // Adjust based on your CORS policy
				'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
			},
		});
	} catch (error) {
		console.error('Error fetching the webpage:', error.message);
		return new Response('An error occurred while fetching the webpage.', {
			status: 500,
		});
	}
}

export default handleCorsRequest;
