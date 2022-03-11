// 上传接口
const Router = require('koa-router')
const router = new Router()
const { RM, QueryFN, jwtVerify } = require('../../utils/api')
const multer = require('@koa/multer')
const path = require('path')

// 存储文件的名称
let myFileName = ''

const storage = multer.diskStorage({
  destination: path.join(__dirname, 'upload/'),
  filename: (req, file, cb) => {
    myFileName = `${file.fieldname}-${Date.now().toString(
      16
    )}.${file.originalname.split('.').splice(-1)}`
    cb(null, myFileName)
  },
})

// 限制大小
const limits = {
  fieldSize: 1024 * 200, // 200kb
  fields: 1,
  files: 1,
}

let upload = multer({ storage, limits })

router.post('/', upload.single('avatar'), async (ctx) => {
  // 鉴权
  let token = ctx.request.headers['cms-token']
  let tokenResult = jwtVerify(token)
  if (!tokenResult) {
    ctx.body = RM(402, 'token已失效,请重新登录')
    return
  }
  // 修改token对应的数据的avatar字段
  let sql = `UPDATE user SET avatar='${myFileName}' WHERE token='${token}'`
  await QueryFN(sql)
  // 重新查找这条数据，返回给前端
  let sql1 = `SELECT nickname,avatar,token FROM user WHERE token='${token}'`
  let result = await QueryFN(sql1)

  ctx.body = RM(200, '修改成功', {
    nickname: result[0].nickname,
    avatar: result[0].avatar,
    'cms-token': result[0].token,
  })
})

module.exports = router
