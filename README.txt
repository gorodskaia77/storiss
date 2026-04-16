StoryFlow MVP v10

Telegram Mini App export for Netlify:
- the frontend renders PNG;
- Netlify Function stores PNG in Netlify Blobs;
- the app receives an HTTPS file URL on the same domain;
- Telegram uses that URL for download.

Important:
- deploy on Netlify, not as a plain static HTML upload;
- run npm install before deploy so @netlify/blobs is included;
- the file endpoints are:
  - /.netlify/functions/story-assets
  - /.netlify/functions/story-file?key=...
- on mobile it is safer to save one story at a time.
