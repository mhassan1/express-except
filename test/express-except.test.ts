import test from 'ava'
import express, { Router, Request, Response, NextFunction } from 'express'
import got from 'got'
import '..'

const stopRouter = Router()
const noOpMiddleware = (req: Request, res: Response, next: NextFunction) => next()
const fallbackMiddleware = (req: Request, res: Response) => res.send('skipped')
const stopMiddleware = (req: Request, res: Response) => res.send('stopped')
const asyncErrorMiddleware = async (_req: Request, _res: Response) => { throw new Error('oops') }
const errorHandlingMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction) => res.send('errored')
stopRouter.use(stopMiddleware)

// === app

test('app.useExcept', async (t) => {
  const app = express()
  app.useExcept('/root/skip', stopRouter)
  app.use(fallbackMiddleware)
  app.listen(3030)

  t.is((await got('http://localhost:3030/root/other')).body, 'stopped')
  t.is((await got('http://localhost:3030/root/skip')).body, 'skipped')
  t.is((await got('http://localhost:3030/root/skip/more')).body, 'skipped')
})

test('app.allExcept', async (t) => {
  const app = express()
  app.allExcept('/root/skip', stopRouter)
  app.use(fallbackMiddleware)
  app.listen(3031)

  t.is((await got('http://localhost:3031/root/other')).body, 'stopped')
  t.is((await got('http://localhost:3031/root/skip')).body, 'skipped')
  t.is((await got('http://localhost:3031/root/skip/more')).body, 'stopped')
})

test('app.getExcept', async (t) => {
  const app = express()
  app.getExcept('/root/skip', stopRouter)
  app.use(fallbackMiddleware)
  app.listen(3032)

  t.is((await got('http://localhost:3032/root/other')).body, 'stopped')
  t.is((await got('http://localhost:3032/root/skip')).body, 'skipped')
  t.is((await got('http://localhost:3032/root/skip/more')).body, 'stopped')
})

test('app strict routing', async (t) => {
  const app = express()
  app.set('strict routing', true)
  app.useExcept('/root/skip/', stopRouter)
  app.use(fallbackMiddleware)
  app.listen(3033)

  t.is((await got('http://localhost:3033/root/other')).body, 'stopped')
  t.is((await got('http://localhost:3033/root/skip')).body, 'stopped')
  t.is((await got('http://localhost:3033/root/skip/')).body, 'skipped')
  // TODO: this seems wrong, but it's how `express@5` does it, currently
  t.is((await got('http://localhost:3033/root/skip/more')).body, 'stopped')
})

test('app case sensitive routing', async (t) => {
  const app = express()
  app.set('case sensitive routing', true)
  app.useExcept('/root/SKIP', stopRouter)
  app.use(fallbackMiddleware)
  app.listen(3034)

  t.is((await got('http://localhost:3034/root/other')).body, 'stopped')
  t.is((await got('http://localhost:3034/root/skip')).body, 'stopped')
  t.is((await got('http://localhost:3034/root/SKIP')).body, 'skipped')
  t.is((await got('http://localhost:3034/root/skip/more')).body, 'stopped')
  t.is((await got('http://localhost:3034/root/SKIP/more')).body, 'skipped')
})

// === router

test('router.useExcept', async (t) => {
  const app = express()
  const router = Router()
  router.useExcept('/skip', stopMiddleware)
  app.use('/root', router)
  app.use(fallbackMiddleware)
  app.listen(3040)

  t.is((await got('http://localhost:3040/root/other')).body, 'stopped')
  t.is((await got('http://localhost:3040/root/skip')).body, 'skipped')
  t.is((await got('http://localhost:3040/root/skip/more')).body, 'skipped')
})

test('router.allExcept', async (t) => {
  const app = express()
  const router = Router()
  router.allExcept('/skip', stopMiddleware)
  app.use('/root', router)
  app.use(fallbackMiddleware)
  app.listen(3041)

  t.is((await got('http://localhost:3041/root/other')).body, 'stopped')
  t.is((await got('http://localhost:3041/root/skip')).body, 'skipped')
  t.is((await got('http://localhost:3041/root/skip/more')).body, 'stopped')
})

test('router.getExcept', async (t) => {
  const app = express()
  const router = Router()
  router.getExcept('/skip', stopMiddleware)
  app.use('/root', router)
  app.use(fallbackMiddleware)
  app.listen(3042)

  t.is((await got('http://localhost:3042/root/other')).body, 'stopped')
  t.is((await got('http://localhost:3042/root/skip')).body, 'skipped')
  t.is((await got('http://localhost:3042/root/skip/more')).body, 'stopped')
})

test('router strict routing', async (t) => {
  const app = express()
  const router = Router({
    strict: true
  })
  router.useExcept('/skip/', stopMiddleware)
  app.use('/root', router)
  app.use(fallbackMiddleware)
  app.listen(3043)

  t.is((await got('http://localhost:3043/root/other')).body, 'stopped')
  t.is((await got('http://localhost:3043/root/skip')).body, 'stopped')
  t.is((await got('http://localhost:3043/root/skip/')).body, 'skipped')
  // TODO: this seems wrong, but it's how `express@5` does it, currently
  t.is((await got('http://localhost:3043/root/skip/more')).body, 'stopped')
})

test('router case sensitive routing', async (t) => {
  const app = express()
  const router = Router({
    caseSensitive: true
  })
  router.useExcept('/SKIP', stopMiddleware)
  app.use('/root', router)
  app.use(fallbackMiddleware)
  app.listen(3044)

  t.is((await got('http://localhost:3044/root/other')).body, 'stopped')
  t.is((await got('http://localhost:3044/root/skip')).body, 'stopped')
  t.is((await got('http://localhost:3044/root/SKIP')).body, 'skipped')
  t.is((await got('http://localhost:3044/root/skip/more')).body, 'stopped')
  t.is((await got('http://localhost:3044/root/SKIP/more')).body, 'skipped')
})

// === other

test('multiple middleware', async (t) => {
  const app = express()
  app.useExcept('/root/skip', noOpMiddleware, [ noOpMiddleware, stopRouter ])
  app.use(fallbackMiddleware)
  app.listen(3050)

  t.is((await got('http://localhost:3050/root/other')).body, 'stopped')
  t.is((await got('http://localhost:3050/root/skip')).body, 'skipped')
  t.is((await got('http://localhost:3050/root/skip/more')).body, 'skipped')
})

test('anonymous middleware', async (t) => {
  const app = express()
  app.useExcept('/root/skip', stopMiddleware)
  app.use(fallbackMiddleware)
  app.listen(3051)

  t.is((await got('http://localhost:3051/root/other')).body, 'stopped')
  t.is((await got('http://localhost:3051/root/skip')).body, 'skipped')
  t.is((await got('http://localhost:3051/root/skip/more')).body, 'skipped')
})

test('async error middleware', async (t) => {
  const app = express()
  app.useExcept('/root/skip', asyncErrorMiddleware)
  app.use(fallbackMiddleware)
  app.use(errorHandlingMiddleware)
  app.listen(3052)

  t.is((await got('http://localhost:3052/root/other')).body, 'errored')
  t.is((await got('http://localhost:3052/root/skip')).body, 'skipped')
  t.is((await got('http://localhost:3052/root/skip/more')).body, 'skipped')
})
