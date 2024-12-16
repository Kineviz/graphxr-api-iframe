Script GraphXR running in an iframe.

```
import gxr from '@kineviz/graphxr-api-iframe'

// <iframe id="iframe" ...>
gxr('iframe').graph().add('a', 'b');
```

# Testing

1. First get a view URL from GraphXR. e.g. http://localhost:3000/share/676042878247412defcf8ac3/iframe/676042928247412defcf8af1/Untitled%201.

2. Paste it into src/test/index.html.

3. Run the following commands to test the implementation.

```
# Use ngrok or your favorite local server.
# e.g. Run the following command in the root directory of this repo.
ngrok http file://$pwd
# Open the URL in browser
open https://c6e750cd23de.ngrok.app/src/test/
# A graph should be generated after 5 seconds
# Check src/test/index.html for implementation
```

# Publishing

```
# 1. Login to npm. Ask Ben for access.
yarn login

# 2. Publish to npm. This will increment the version, tag the commit, and publish to npmjs.com
yarn publish

# 3. Push to GitHub
git push origin main
```