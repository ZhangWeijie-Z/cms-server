const Router = require('koa-router')
const router = new Router()
const { RM, QueryFN } = require('../../utils/api')

router.post('/', async (ctx) => {
  const { account, password } = ctx.request.body
  // 判断account和password是否都存在
  if (account && password) {
    // 验证数据库 查询数据库是否有该用户
    let sql = `SELECT * FROM user WHERE account='${account}'`
    let result = await QueryFN(sql)

    if (result.length > 0) {
      // 有这个用户 返回前端 该用户已注册
      ctx.body = RM(401, '该用户已注册!')
    } else {
      // 没有这个用户 开始注册 editable 表示是否可编辑文章 0表示不允许 1可以
      // player 表示是否超级管理员 normal为否 vip为是
      let sql = `INSERT INTO user VALUES (null,'${account}','${password}','管理员',null,'defaultAvatar.jpg','normal',0)`
      await QueryFN(sql)
      ctx.body = RM(200, '注册成功!')
    }
  } else {
    // 结束
    ctx.body = RM(400, '参数错误')
  }
})

module.exports = router
