//! oops sorry
async function reverseProxy(url, reqheaders) {
	try {
		const headers = {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
			Accept: '*/*',
			'Accept-Language': 'en-US,en;q=0.5',
			'x-pie-req-header-host': url.split('//')[1].split('/')[0],
			'x-pie-req-header-user-agent': 'HTTPie',
			'x-pie-req-meta-follow-redirects': 'true',
			'x-pie-req-meta-method': 'GET',
			'x-pie-req-meta-ssl-verify': 'true',
			'x-pie-req-meta-url': url,
			'Content-Type': 'text/plain;charset=UTF-8',
			'Sec-GPC': '1',
			'Sec-Fetch-Dest': 'empty',
			'Sec-Fetch-Mode': 'cors',
			'Sec-Fetch-Site': 'same-origin',
			Priority: 'u=0',
			Pragma: 'no-cache',
			'Cache-Control': 'no-cache',
			referer: 'https://httpie.io/app',
		};
		const ref = reqheaders['Referer'] || reqheaders['referer'] || reqheaders['Referrer'] || reqheaders['referrer'];
		const reverseProxyUrl = 'https://httpie.io/app/api/proxy';
		const response = await fetch(reverseProxyUrl, {
			method: 'POST',
			headers: {
				...headers,
				'x-pie-req-header-referer': ref || url,
			},
		});

		return new Response(response.body, {
			status: response.status,
			headers: response.headers,
		});
	} catch (error) {
		console.error('Error fetching the webpage:', error.message);
		return new Response('An error occurred while fetching the webpage.', {
			status: 500,
			headers: { 'Access-Control-Allow-Origin': '*' },
		});
	}
}

export default reverseProxy;
