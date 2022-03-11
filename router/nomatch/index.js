const Router = require('koa-router')
const router = new Router()
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

router.get('/', async (ctx) => {
  let filepath = path.join(__dirname, '../../static/images/404.gif')
  let file = fs.readFileSync(filepath)
  let fileType = mime.lookup(filepath)
  ctx.set('content-type', fileType)
  ctx.body = file
})

module.exports = router
