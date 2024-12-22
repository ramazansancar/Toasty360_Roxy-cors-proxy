async function handleCorsRequest(targetUrl, headers) {
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
