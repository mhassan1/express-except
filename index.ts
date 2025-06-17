
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
import app = require('express/lib/application')
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-require-imports
import Layer = require('router/lib/layer')

import { flatten } from 'array-flatten'
import methods from 'methods'

import { Request, Response, NextFunction, RequestHandler as ExpressRequestHandler, Application, Router as ExpressRouter, RouterOptions } from 'express'

type PathParams = string | RegExp | Array<string | RegExp>

type RequestHandler = ExpressRequestHandler | Array<ExpressRequestHandler>

type Router = ExpressRouter & {
  caseSensitive: RouterOptions['caseSensitive']
  strict: RouterOptions['strict']
}

type LayerOptions = {
  sensitive?: boolean
  strict?: boolean
}

const noOp = () => {}

const handler = (fn: string, getLayerOpts: () => LayerOptions) => function(this: Application | Router, path: PathParams, ...middleware: RequestHandler[]): void {
  const modifiedMiddleware = flatten(middleware).map((_middleware: ExpressRequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    const layerOpts = {
      ...getLayerOpts.call(this),
      end: fn !== 'use',
    }
    const layer = new Layer(path, layerOpts, noOp)
    if (layer.match(req.path)) return next()
    return _middleware(req, res, next)
  })

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const thisFn: (path: PathParams, ...middleware: RequestHandler[]) => void = this[fn].bind(this)
  return thisFn(fn !== 'use' ? /.*/ : '/', modifiedMiddleware)
}

for (const fn of ['use', 'all'].concat(methods)) {
  app[`${fn}Except`] = handler(fn, function(this: Application) {
    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      sensitive: this.router.caseSensitive,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      strict: this.router.strict
    }
  })

  ExpressRouter.prototype[`${fn}Except`] = handler(fn, function(this: Router) {
    return {
      sensitive: this.caseSensitive,
      strict: this.strict
    }
  })
}
