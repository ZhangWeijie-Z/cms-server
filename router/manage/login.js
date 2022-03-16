const Router = require('koa-router')
const jwt = require('jsonwebtoken')
const router = new Router()
const { RM, QueryFN } = require('../../utils/api')

router.post('/', async (ctx) => {
  const { account, password } = ctx.request.body
  // 校验账号密码是否存在
  if (account && password) {
    // 查询数据库
    let sql = `SELECT * FROM user WHERE account='${account}' AND password='${password}'`
    let result = await QueryFN(sql)
    if (result.length > 0) {
      // 账号密码正确 添加token
      // 根据 account 生成token根据 account 生成token
      const token = jwt.sign({ account, password }, 'ZWJTK', {
        expiresIn: '24h',
      })
      // token 存入数据库
      let sql1 = `UPDATE user SET token='${token}' WHERE account='${account}'`
      await QueryFN(sql1)
      // 再次查询返回给前端
      let result1 = await QueryFN(sql)
      let obj = {
        nickname: result1[0].nickname,
        avatar: result1[0].avatar,
        'cms-token': result1[0].token,
        player: result1[0].player,
        editable: result1[0].editable,
      }
      ctx.body = RM(200, '登录成功', obj)
    } else {
      // 账号密码错误 提示错误
      ctx.body = RM(401, '账号或者密码错误')
    }
  } else {
    // 参数错误
    ctx.body = RM(400, '参数错误')
  }
})

module.exports = router
