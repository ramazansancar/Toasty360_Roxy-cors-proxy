// Function to decode base64 strings
function atobPolyfill(encoded) {
	return decodeURIComponent(escape(globalThis.atob(encoded)));
}

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
	const targetUrl = atobPolyfill(encodedUrl);

	let decodedHeaders = {};
	if (headersBase64) {
		try {
			const decodedString = atobPolyfill(headersBase64);
			decodedHeaders = JSON.parse(decodedString);
		} catch (error) {
			return new Response('Invalid headers format. Must be valid base64-encoded.', {
				status: 400,
			});
		}
	}

	// Convert the plain JSON headers object to a Headers instance

	const headers = new Headers();
	for (const [key, value] of Object.entries(decodedHeaders)) {
		headers.append(key, value);
	}

	try {
		// Fetch the target URL with the specified headers
		const response = await fetch(targetUrl, {
			redirect: 'follow',
			headers: headers, // Use the Headers object here
		});

		const responseBody = await response.text();

		// Return the response to the requester with proper CORS headers
		return new Response(responseBody, {
			status: response.status,
			headers: {
				'Access-Control-Allow-Origin': '*', // Adjust based on your CORS policy
				'Content-Type': response.headers.get('Content-Type') || 'text/plain',
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
