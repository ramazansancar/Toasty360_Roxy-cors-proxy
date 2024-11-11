async function home() {
	const htmlContent = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Valley Proxy Player</title>
    <style>
        /* Dark theme styling */
        body {
            background-color: #282c34;
            color: #ffffff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        h1 {
            margin-top: 30px;
            font-size: 2em;
            text-align: center;
        }

        p,
        ul,
        code {
            text-align: center;
            margin: 10px;
            font-size: 1em;
            line-height: 1.5;
        }

        ul {
            list-style: none;
            padding: 0;
        }

        li {
            margin: 5px 0;
        }

        code {
            display: block;
            background-color: #1e1e1e;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }

        #video-container {
            width: 80%;
            max-width: 1000px;
            margin: 40px auto;
            text-align: center;
            background-color: #3a3f47;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        }

        #m3u8UrlInput,
        #loadVideoButton {
            width: 100%;
            max-width: 600px;
            margin: 10px 0;
            padding: 10px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
        }

        #headersInput {
            width: 100%;
            max-width: 600px;
            height: 150px;
            /* Increased height for more space */
            font-size: 16px;
            font-family: 'Courier New', Courier, monospace;
            /* Fixed-width font for better JSON editing */
            padding: 12px;
            /* Added more padding */
            margin: 10px 0;
            border: none;
            border-radius: 5px;
            background-color: #555;
            color: #ffffff;
            resize: vertical;
            /* Allow vertical resizing for even more flexibility */
        }

        #m3u8UrlInput,
        #headersInput {
            background-color: #555;
            color: #ffffff;
        }

        #loadVideoButton {
            background-color: #4CAF50;
            color: #ffffff;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        #loadVideoButton:hover {
            background-color: #45a049;
        }

        #video {
            width: 100%;
            max-width: 800px;
            height: 450px;
            margin-top: 20px;
            border-radius: 10px;
            border: 1px solid #666;
        }

        .log-section {
            width: 80%;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background-color: #3a3f47;
            border-radius: 10px;
            border: 1px solid #666;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        }

        #logOutput {
            font-size: 14px;
            font-family: 'Courier New', Courier, monospace;
            color: #ffffff;
            white-space: pre-wrap;
            background-color: #282c34;
            padding: 10px;
            border-radius: 5px;
            overflow-y: auto;
            max-height: 300px;
        }

        footer {
            text-align: center;
            margin: 20px 0;
            font-size: 0.9em;
            color: #aaaaaa;
        }
            sub{
            font-size: 8px;
            }
    </style>
</head>

<body>
    <h1>Valley Proxy Player<sub>Dummy</sub></h1>
    <div id="video-container">
        <h2>HLS Player</h2>
        <input type="text" id="m3u8UrlInput" placeholder="Enter M3U8 URL" />
        <textarea id="headersInput" placeholder="Enter JSON headers">{}</textarea>
        <button id="loadVideoButton">Load Video</button>
        <video id="video" controls></video>
    </div>

    <div class="log-section">
        <h3>Logs:</h3>
        <pre id="logOutput"></pre>
    </div>

    <footer>
        <p>&copy; Valley Proxy Player</p>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <script>
        const video = document.getElementById('video');
        const logOutput = document.getElementById('logOutput');
        const m3u8UrlInput = document.getElementById('m3u8UrlInput');
        const headersInput = document.getElementById('headersInput');
        const loadVideoButton = document.getElementById('loadVideoButton');

        loadVideoButton.addEventListener('click', () => {
            console.log('Load video button clicked');
            const m3u8Url = m3u8UrlInput.value;
            const headers = headersInput.value;

            if (!m3u8Url) {
                logMessage('Please enter both M3U8 URL and headers.');
                return;
            }

            const encodedUrl = btoa(m3u8Url);
            const encodedHeaders = btoa(JSON.stringify(headers));

            JSON.parse(headers); // This will throw if headers is not valid JSON
            encodedHeaders = btoa(headers);

            const proxyUrl = \`/proxy?url=\${encodedUrl}&headers=\${encodedHeaders}\`;

            logMessage(\`Attempting to load video from: \${proxyUrl}\`);
            loadVideo(proxyUrl);
        });

        function loadVideo(m3u8Url) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(m3u8Url);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    logMessage('Manifest parsed, video can start.');
                    video.play();
                });

                hls.on(Hls.Events.ERROR, function (event, data) {
                    logMessage(\`Error: \${data.type}, \${data.details}\`);
                });

            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = m3u8Url;
                video.addEventListener('loadedmetadata', function () {
                    logMessage('Video metadata loaded, video can start.');
                    video.play();
                });
            } else {
                logMessage('Your browser does not support HLS.');
            }
        }

        function logMessage(message) {
            logOutput.textContent += message + '\n';
        }
    </script>
</body>

</html>`;

	return new Response(htmlContent, {
		headers: { 'Content-Type': 'text/html' },
	});
}

export default home;
