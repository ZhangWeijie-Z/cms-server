const Router = require('koa-router')
const moment = require('moment')
const router = new Router()
const { RM, QueryFN, jwtVerify } = require('../../utils/api')

// 文章列表
router.get('/list', async (ctx) => {
  // 鉴权
  let token = ctx.request.headers['cms-token']
  let tokenResult = jwtVerify(token)
  if (!tokenResult) {
    ctx.body = RM(402, 'token已失效,请重新登录!')
    return
  }
  // 得到数据库中到底有多少篇文章
  let totalSql = `SELECT COUNT(*) ROWS FROM article`
  let totalResult = await QueryFN(totalSql)
  let total = totalResult[0].ROWS
  // 获取前端传过来的 页码 和每页显示的个数
  let { current, count } = ctx.request.query
  // 确认有这两个参数
  if (!current || !count) {
    ctx.body = RM(400, '参数错误')
    return
  }
  // 去数据库查询对应的数据返回给前端
  let sql = `SELECT id,title,subTitle,date FROM article LIMIT ${
    (current - 1) * count
  },${count}`
  let data = await QueryFN(sql)

  ctx.body = RM(200, '获取成功', {
    data,
    current,
    count,
    total,
  })
})

// 根据id 检索文章
router.get('/get', async (ctx) => {
  // 鉴权
  let token = ctx.request.headers['cms-token']
  let tokenResult = jwtVerify(token)
  if (!tokenResult) {
    ctx.body = RM(402, 'token已失效,请重新登录!')
    return
  }
  // 得到前端传过来的id
  let { id } = ctx.request.query
  let sql = `SELECT * FROM article WHERE id='${id}'`
  let result = await QueryFN(sql)
  if (result.length > 0) {
    ctx.body = RM(200, '请求成功', result[0])
  } else {
    ctx.body = RM(401, '文章不存在或已被删除!')
  }
})

// 文章编辑
router.post('/edit', async (ctx) => {
  // 鉴权
  let token = ctx.request.headers['cms-token']
  let tokenResult = jwtVerify(token)
  if (!tokenResult) {
    ctx.body = RM(402, 'token已失效,请重新登录!')
    return
  }
  // 从token中获取该用户是否有权限编辑
  let sql2 = `SELECT editable,nickname FROM user WHERE token='${token}'`
  let result2 = await QueryFN(sql2)
  if (result2[0].editable === 1) {
    // 可编辑 获取id
    let { id, title, subTitle, content } = ctx.request.body
    if (!title || !content) {
      ctx.body = RM(401, '标题,正文内容为必填!')
      return
    }
    // 查询数据库是否有这篇文章
    let sql = `SELECT * FROM article WHERE id='${id}'`
    let result = await QueryFN(sql)
    if (result.length <= 0) {
      ctx.body = RM(401, '编辑失败，数据库无此文章记录')
      return
    }
    let date = moment().format('YYYY-MM-DD hh:mm:ss')
    let sql1 = `UPDATE article SET title='${title}',subTitle='${
      subTitle || ''
    }',content='${content}',date='${date}',author='${
      result2[0].nickname
    }' WHERE id='${id}'`
    await QueryFN(sql1)
    ctx.body = RM(200, '文章修改成功')
  } else {
    // 不可编辑
    ctx.body = RM(401, '您没有编辑权限!')
    return
  }
})

// 文章添加
router.post('/add', async (ctx) => {
  // 鉴权
  let token = ctx.request.headers['cms-token']
  let tokenResult = jwtVerify(token)
  if (!tokenResult) {
    ctx.body = RM(402, 'token已失效,请重新登录!')
    return
  }
  // 从token中获取该用户是否有添加权限
  let editableSql = `SELECT editable,nickname FROM user WHERE token='${token}'`
  let editableResult = await QueryFN(editableSql)
  if (editableResult[0].editable === 1) {
    // 可编辑 获取id
    let { title, subTitle, content } = ctx.request.body
    if (!title || !content) {
      ctx.body = RM(401, '标题,正文内容为必填!')
      return
    }
    // 生成日期
    let date = moment().format('YYYY-MM-DD hh:mm:ss')
    // 添加文章
    let sql = `INSERT INTO article VALUES(null,'${title}','${
      subTitle || ''
    }','${editableResult[0].nickname}','${date}','${content}')`
    await QueryFN(sql)
    ctx.body = RM(200, '文章添加成功')
  } else {
    // 不可编辑
    ctx.body = RM(401, '您没有添加权限!')
    return
  }
})

// 文章删除
router.delete('/delete', async (ctx) => {
  // 鉴权
  let token = ctx.request.headers['cms-token']
  let tokenResult = jwtVerify(token)
  if (!tokenResult) {
    ctx.body = RM(402, 'token已失效,请重新登录!')
    return
  }
  let { id } = ctx.request.query
  if (!id) {
    ctx.body = RM(400, '参数错误')
    return
  }
  let sql = `SELECT * FROM article WHERE id='${id}'`
  let result = await QueryFN(sql)
  if (result.length > 0) {
    // 文章存在
    // 从token中获取该用户是否有权限编辑
    let sql1 = `SELECT editable,nickname FROM user WHERE token='${token}'`
    let result1 = await QueryFN(sql1)
    if (result1[0].editable === 1) {
      // 可编辑 删除文章
      let sql2 = `DELETE FROM article WHERE id='${id}'`
      await QueryFN(sql2)
      ctx.body = RM(200, '删除成功')
    } else {
      // 不可编辑
      ctx.body = RM(401, '您没有编辑权限!')
      return
    }
  } else {
    // 文章不存在
    ctx.body = RM(401, '文章不存在或已被删除!')
  }
})

module.exports = router
