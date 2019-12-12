import test from 'ava'
import express, { Router } from 'express'
import got from 'got'
import '..'

const stopRouter = new Router()
const noOpMiddleware = (req, res, next) => next()
const fallbackMiddleware = (req, res) => res.send('skipped')
const stopMiddleware = (req, res) => res.send('stopped')
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
  t.is((await got('http://localhost:3033/root/skip/more')).body, 'skipped')
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
  const router = new Router()
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
  const router = new Router()
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
  const router = new Router()
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
  const router = new Router({
    strict: true
  })
  router.useExcept('/skip/', stopMiddleware)
  app.use('/root', router)
  app.use(fallbackMiddleware)
  app.listen(3043)

  t.is((await got('http://localhost:3043/root/other')).body, 'stopped')
  t.is((await got('http://localhost:3043/root/skip')).body, 'stopped')
  t.is((await got('http://localhost:3043/root/skip/')).body, 'skipped')
  t.is((await got('http://localhost:3043/root/skip/more')).body, 'skipped')
})

test('router case sensitive routing', async (t) => {
  const app = express()
  const router = new Router({
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
