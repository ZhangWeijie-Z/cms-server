const Router = require('koa-router')
const router = new Router()
const login = require('./login')
const register = require('./register')
const info = require('./info')
const upload = require('./upload')
const article = require('./article')
// const { QueryFN } = require('../../utils/api')
// const moment = require('moment')

// router.get('/', async (ctx) => {
//   for (let i = 0; i < 100; i++) {
//     let sql = `INSERT INTO article VALUES(null,'你好${i}','世界${i}','zwj','${moment().format(
//       'YYYY-MM-DD hh:mm:ss'
//     )}','<p>内容内容${i}</p>')`
//     await QueryFN(sql)
//   }
//   ctx.body = '管理系统'
// })

router.use('/login', login.routes(), login.allowedMethods())
router.use('/register', register.routes(), register.allowedMethods())
router.use('/info', info.routes(), info.allowedMethods())
router.use('/upload', upload.routes(), upload.allowedMethods())
router.use('/article', article.routes(), article.allowedMethods())

module.exports = router
