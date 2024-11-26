# HLS Stream Proxy

This application serves as a proxy for HLS streams, enabling secure access to media content.

---

## Proxy Endpoint

Use the following format to access the proxy:

```
/proxy?url=<encoded_m3u8_url>&headers=<encoded_headers>
```

- **`url`**: Base64-encoded M3U8 URL.
- **`headers`**: (Optional) Base64-encoded JSON string for custom headers.

---

## Encoding Instructions

### Encode M3U8 URL:

```javascript
btoa('http://example.com/stream.m3u8');
```

### Encode Headers (if needed):

```javascript
btoa(JSON.stringify({ Referrer: 'https://anitaku.bz' }));
```

---

## Example Request

```
/proxy?url=aHR0cDovL2V4YW1wbGUuY29tL3N0cmVhbS5tM3U4&headers=eyJBdXRob3JpemF0aW9uIjoiQmVhcmVyIHRva2VuIn0=
```
