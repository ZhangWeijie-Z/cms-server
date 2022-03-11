const Router = require('koa-router')
const router = new Router()

router.get('/', async (ctx) => {
  ctx.body = {
    web: 'web',
  }
})

router.get('/list', async (ctx) => {
  ctx.body = {
    web: 'web-list',
  }
})

module.exports = router
