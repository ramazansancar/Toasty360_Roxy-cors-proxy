### why base64Encoding? # HLS Stream Proxy

This application serves as a proxy for HLS streams. It allows you to securely access and stream media content by passing through a proxy endpoint.

## Usage Instructions

To use this application, please follow the instructions below.

### Proxy Endpoint

The proxy endpoint can be accessed using the following format:

```
/proxy?url=<encoded_m3u8_url>&headers=<encoded_headers>
```

- **`encoded_m3u8_url`**: Base64-encoded URL of the M3U8 file you want to stream.
- **`encoded_headers`**: Base64-encoded JSON string of any custom headers needed for the request.

### Why base64Encoding?

Because it looks cool

### Encoding the M3U8 URL

To encode the M3U8 URL, use the `base64` encoding method. For example, using JavaScript:

```javascript
const encodedUrl = btoa('http://example.com/stream.m3u8');
```

### Encoding the Headers

To encode the headers, you can use the following JavaScript code:

```javascript
const headers = JSON.stringify({ Authorization: 'Bearer token' });
const encodedHeaders = btoa(headers);
```

Ensure that the headers are in valid JSON format before encoding.

## Example

Here’s an example of how to construct a request to the proxy:

```
/proxy?url=aHR0cDovL2V4YW1wbGUuY29tL3N0cmVhbS5tM3U4&headers=eyJBdXRob3JpemF0aW9uIjoiQmVhcmVyIHRva2VuIn0=
```

## Deploy Your Instance

You can deploy your own instance of this application on Cloudflare Workers by clicking the button below:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Toasty360/Roxy)

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
