# Stable

Stable generates a static website from simple templates and dynamic data, ideal for a lightweight
personal site.

# Usage
```sh
npm i stable-js
```

```javascript
const { hydrate } = require('stable-js');

const options = {};
const data = {};
hydrate(options, data);
```

## To do
- strip empty lines from output
- local/global merge strategy
- more complex logic - else, switch
