const query = require('./connect')
const jwt = require('jsonwebtoken')

// 接口返回格式
const RM = (code, msg, data) => {
  return {
    code,
    msg,
    data,
  }
}

// 数据库操作封装
const QueryFN = (sql) => {
  return new Promise((resolve, reject) => {
    query(sql, (err, rows) => {
      if (err) reject(err)
      resolve(rows)
    })
  })
}

// 鉴权token函数
const jwtVerify = (token) => {
  try {
    // 解密token 得到account和password
    jwt.verify(token, 'ZWJTK')
  } catch (err) {
    // 鉴权失败
    return false
  }
  // 鉴权成功
  return true
}

module.exports = {
  RM,
  QueryFN,
  jwtVerify,
}
