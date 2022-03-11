const Koa = require('koa2')
const Router = require('koa-router')
const cors = require('koa2-cors')
const static = require('koa-static')
const bodyParser = require('koa-bodyparser')
const path = require('path')
const { host, port } = require('./utils/path')

const manage = require('./router/manage')
const web = require('./router/web')
const nomatch = require('./router/nomatch')

const app = new Koa()
const router = new Router()

router.get('/', async (ctx) => {
  ctx.body = {
    index: 'index',
  }
})

router.use('/manage', manage.routes(), manage.allowedMethods())
router.use('/web', web.routes(), web.allowedMethods())
router.use('/404', nomatch.routes(), nomatch.allowedMethods())

// 重定向404
app.use(async (ctx, next) => {
  // 先执行下一个中间件
  await next()
  if (parseInt(ctx.status) === 404) {
    ctx.response.redirect('/404')
  }
})

// 后端允许跨域
app.use(cors())

// 接收参数
app.use(bodyParser())

// 路由重定向
// router.redirect('/', '/manage')
app.use(router.routes(), router.allowedMethods())

// 读取静态资源 须在路由后面
app.use(static(path.join(__dirname, 'static')))
app.use(static(path.join(__dirname, 'router/manage/upload')))

// 启动端口监听
app.listen(port, () => {
  console.log(`Server is running at ${host}:${port}`)
})
