Script GraphXR running in an iframe.

```
import gxr from '@kineviz/graphxr-api-iframe'

// <iframe id="iframe" ...>
gxr('iframe').graph().add('a', 'b');
```

# Publishing

```
yarn login
yarn publish
```