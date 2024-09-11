# express-except
Skip middleware when a path matches

This package works with Express v5. For Express v4 support, use `express-except@1`.

## Install
`npm install express-except`

## Usage
```javascript
require('express-except')

app.useExcept('/skip', (req, res) => res.send('stopped'))

app.use((req, res) => res.send('skipped'))

// GET /skip => skipped
// GET /other => stopped
```

## Explanation
When you `require` this package, the following Express middleware mounting
methods are added:

- `app.useExcept` (opposite of `app.use`)
- `app.allExcept` (opposite of `app.all`)
- `app[METHOD + 'Except']` (opposite of `app[METHOD]`)
- `router.useExcept` (opposite of `router.use`)
- `router.allExcept` (opposite of `router.all`)
- `router[METHOD + 'Except']` (opposite of `router[METHOD]`)

You can then use one of those methods to mount middleware that WILL NOT run
if the path matches. Each new method has the same signature as its
corresponding Express method.
This library uses only  built-in Express functionality and does not attempt
to match routes manually.

## Documentation
`fn(path, ...middleware):`
* `fn` - One of:
  * `app.useExcept`
  * `app.allExcept`
  * `app.getExcept`, `app.postExcept`, etc.
  * `router.useExcept`
  * `router.allExcept`
  * `router.getExcept`, `router.postExcept`, etc.
* `path` - An Express path that should be skipped over. If the path of the request matches, the passed `middleware` will be skipped. Supports any of [Express Path Examples](https://expressjs.com/en/api.html#path-examples).
* `middleware` - An Express callback or router, an array of callbacks and/or routers, or a mix of these

## Development
```bash
yarn
yarn build
yarn test
```

## License
MIT
