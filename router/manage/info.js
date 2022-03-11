// 用户信息接口(查询,修改)
const Router = require('koa-router')
const router = new Router()
const { RM, QueryFN, jwtVerify } = require('../../utils/api')

// 获取当前用户
router.get('/', async (ctx) => {
  // 获取token,前端请求头携带过来
  let token = ctx.request.headers['cms-token']
  // 鉴权
  let tokenResult = jwtVerify(token)
  if (!tokenResult) {
    ctx.body = RM(402, 'token已失效,请重新登录')
    return
  }
  // 去数据库查询token对应的用户
  let sql = `SELECT nickname,token,avatar FROM user WHERE token='${token}'`
  let result = await QueryFN(sql)
  ctx.body = result[0]
})

// 修改用户信息
router.post('/', async (ctx) => {
  // 获取token,前端请求头携带过来
  let token = ctx.request.headers['cms-token']
  // 鉴权
  let tokenResult = jwtVerify(token)
  if (!tokenResult) {
    ctx.body = RM(402, 'token已失效,请重新登录!')
    return
  }
  let { account, password, nickname } = ctx.request.body
  // 检索是否相同账号
  let sql3 = `SELECT * FROM user WHERE account='${account}'`
  let result3 = await QueryFN(sql3)
  if (result3.length > 0) {
    ctx.body = RM(401, '账号已存在,请重新更改!')
    return
  }
  // 获取修改前的信息
  let sql2 = `SELECT account,password,nickname FROM user WHERE token='${token}'`
  let result2 = await QueryFN(sql2)
  // 鉴权成功,修改数据库中对应的字段
  let sql = `UPDATE user SET account='${
    account || result2[0].account
  }',password='${password || result2[0].password}',nickname='${
    nickname || result2[0].nickname
  }' WHERE token='${token}'`
  await QueryFN(sql)
  let sql1 = `SELECT account,nickname,avatar,token FROM user WHERE token='${token}'`
  let result = await QueryFN(sql1)
  ctx.body = RM(200, '修改成功!', {
    account: result[0].account,
    nickname: result[0].nickname,
    avatar: result[0].avatar,
    'cms-token': result[0].token,
  })
})

// 获取所有用户信息
router.get('/all', async (ctx) => {
  // 鉴权
  let token = ctx.request.headers['cms-token']
  let tokenResult = jwtVerify(token)
  if (!tokenResult) {
    ctx.body = RM(402, 'token已失效,请重新登录!')
    return
  }
  let sql = `SELECT avatar,editable,id,nickname,player FROM user`
  let result = await QueryFN(sql)
  ctx.body = RM(200, '获取成功', result)
})

// 修改用户的权限
router.post('/all', async (ctx) => {
  // 鉴权
  let token = ctx.request.headers['cms-token']
  let tokenResult = jwtVerify(token)
  if (!tokenResult) {
    ctx.body = RM(402, 'token已失效,请重新登录!')
    return
  }
  // 根据 id 修改用户
  // 打开编辑权限 open=1 关闭权限 open=0
  let { id, open } = ctx.request.body
  if (!id || open === undefined) {
    ctx.body = RM(400, '参数错误')
    return
  }
  // 有id
  let sql = `SELECT editable FROM user WHERE id='${id}'`
  let result = await QueryFN(sql)
  if (result[0].editable === 1 && Number(open) === 1) {
    // 该用户有编辑权限
    ctx.body = RM(401, '该用户已有编辑权限!')
    return
  }
  if (result[0].editable === 0 && Number(open) === 0) {
    // 该用户有编辑权限
    ctx.body = RM(200, '已取消该用户的编辑权限!')
    return
  }
  // 修改用户编辑权限
  let changeSql = `UPDATE user SET editable='${open}' WHERE id='${id}'`
  await QueryFN(changeSql)
  ctx.body = RM(200, '修改成功!')
})

module.exports = router
