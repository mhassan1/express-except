
const app = require('express/lib/application')
const Layer = require('express/lib/router/layer')
const router = require('express/lib/router')
const flatten = require('array-flatten')
const methods = require('methods')

const noOp = () => {}

const handler = (fn, getLayerOpts) => function(path, ...middleware) {
  const modifiedMiddleware = flatten(middleware).map(_middleware => (req, res, next) => {
    const layerOpts = {
      ...getLayerOpts.call(this),
      end: fn !== 'use',
    }
    const layer = new Layer(path, layerOpts, noOp)
    if (layer.match(req.path)) return next()
    _middleware(req, res, next)
  })
  return this[fn](fn !== 'use' ? '*' : '/', modifiedMiddleware)
}

for (const fn of ['use', 'all'].concat(methods)) {
  app[`${fn}Except`] = handler(fn, function() {
    return {
      sensitive: this._router.caseSensitive,
      strict: this._router.strict
    }
  })

  router[`${fn}Except`] = handler(fn, function() {
    return {
      sensitive: this.caseSensitive,
      strict: this.strict
    }
  })
}
