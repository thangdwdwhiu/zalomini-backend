import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

console.log('Đọc các biến môi trường:')
console.log('DB_HOST:', process.env.DB_HOST)
console.log('DB_USER:', process.env.DB_USER)
console.log('DB_PASS:', process.env.DB_PASS)
console.log('DB_NAME:', process.env.DB_NAME)

const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME']
const missingEnvVars = requiredEnvVars.filter((v) => process.env[v] === undefined)

if (missingEnvVars.length > 0) {
  throw new Error(`Thiếu các biến môi trường: ${missingEnvVars.join(', ')}`)
}

// ✅ Cách 1: dùng createPool() với promise wrapper (khuyên dùng)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// ✅ Test kết nối
try {
  const connection = await db.getConnection()
  console.log('Kết nối database thành công ✅')
  connection.release()
} catch (err) {
  console.error('Lỗi khi kết nối database ❌:', err)
}

export default db
