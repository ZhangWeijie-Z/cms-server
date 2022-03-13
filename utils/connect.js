const mysql = require('mysql')

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  database: 'cms',
  user: 'root',
  password: 'zhangweijie2418928628',
})

const query = (sql, cb) => {
  pool.getConnection((err, connection) => {
    connection.query(sql, (err, rows) => {
      cb(err, rows)
      connection.release()
    })
  })
}

module.exports = query
