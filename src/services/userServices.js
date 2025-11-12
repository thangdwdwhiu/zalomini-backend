import db from '../../db.js'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import validator from 'validator'
import createError from '../utils/createError.js'

dotenv.config()
// Kiểm tra tài khoản có tồn tại và mật khẩu có đúng không
const checkExist = async (username, password) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ? OR phone = ?", [username, username])

    if (rows.length === 0) {
      // Không tìm thấy tài khoản
      return { success: false, message: 'Không tìm thấy tài khoản' }
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      // Sai mật khẩu
      return { success: false, message: 'Sai mật khẩu' }
    }

    // Thành công
    return { success: true, data: user }

  } catch (e) {
    // Lỗi truy vấn
    return { success: false, message: e.message }
  }
}
// Xử lý đăng nhập
const login = async (req) => {
  try {
    const { username, password, phone } = req.body;
    if (!username || !password)
    {
        const error  = new Error('font end chua gui len gi ca')
        error.status = 408
        throw error
    }
    console.log(await bcrypt.hash(password, 10))
    
    const resCheck = await checkExist(username, password, phone)

    if (!resCheck.success) {
      // Ném lỗi có thông điệp từ checkExist()
      throw new Error(resCheck.message)
    }

    // Nếu thành công thì trả thông tin người dùng (có thể loại bỏ password)
    const userData = resCheck.data
    delete userData.password

    return userData

  } catch (e) {
    throw e
  }
};



const register = async (req) => {
  try {
    const { fullname, username, password, phone } = req.body;

    // 1️⃣ Validate bắt buộc
    if (!fullname?.trim() || !username?.trim() || !password?.trim() || !phone?.trim()) {
      throw createError(400, "Vui lòng điền đầy đủ fullname, username, password và phone");
    }

    // 2️⃣ Validate định dạng username (chỉ chữ, số, 3-20 ký tự)
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    if (!usernameRegex.test(username)) {
      throw createError(400, "Username chỉ chứa chữ và số, từ 3-20 ký tự");
    }

    // 3️⃣ Validate password (ít nhất 6 ký tự)
    if (password.length < 6) {
      throw createError(400, "Mật khẩu phải ít nhất 6 ký tự");
    }

    // 4️⃣ Validate phone (regex Việt Nam)
    const phoneRegex = /^0\d{9,10}$/;
    if (!phoneRegex.test(phone)) {
      throw createError(400, "Số điện thoại không hợp lệ");
    }

    // 5️⃣ Kiểm tra trùng username hoặc phone
    const [checkExist] = await db.query(
      "SELECT * FROM users WHERE username = ? OR phone = ?",
      [username, phone]
    );

    if (checkExist.length > 0) {
      throw createError(409, "Username hoặc số điện thoại đã tồn tại");
    }

    // 6️⃣ Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // 7️⃣ Avatar mặc định
    const avatar = `${process.env.URL_BACKEND}/img/default.jpg`;

    // 8️⃣ Thêm user vào database
    const [rows] = await db.query(
      "INSERT INTO users (username, password, fullname, phone, avatar) VALUES (?, ?, ?, ?, ?)",
      [username, hashPassword, fullname, phone, avatar]
    );

    if (rows.affectedRows > 0) {
      console.log(`✅ New user created: id=${rows.insertId}`);
      return { success: true, message: "Tạo tài khoản thành công" };
    } else {
      throw createError(500, "Không thể tạo tài khoản");
    }
  } catch (e) {
    // Nếu là createError, giữ nguyên status
    if (e.status) throw e;

    // Nếu lỗi khác, trả 500
    throw createError(500, e.message);
  }
};

const changePassword = async (userID, passwordNew) =>{
  try{
    const hash = await bcrypt.hash(passwordNew, 10)

    const [rows]  = await db.query("UPDATE users SET password = ? WHERE user_id = ?", [hash, userID] );

    if (rows.affectedRows > 0)
    {
      return {success: true, message: 'đổi mật khẩu thành công'}
    }
    return {success: false, message: 'có lỗi xảy ra khi đổi mật khẩu'}
  }
  catch (e) 
  {
    throw e
  }
}

//doi ho ten
const changeFullname = async (userID, fullnameNew) =>{
  try{
    const [rows] = await db.query("UPDATE users SET fullname = ?  WHERE user_id = ?", [fullnameNew, userID])
    if (rows.affectedRows === 0)
    {
      throw createError(500, 'Không thể thay đổi họ tên')
    }
    return {success: true, message: 'Đổi họ tên thành công'}
  }
  catch (e) 
  {
    throw e
  }
}

const uploadAvatar = async (userID, avatarNew) =>{
  try{
    const [rows] = await db.query("UPDATE users SET avatar = ? WHERE user_id = ? ", [avatarNew, userID])
    if (rows.affectedRows == 0) {
      throw createError(500, 'Không thể tải ảnh lên')
    }
    return {success: true, message: 'Tải ảnh đại diện thành công', avatar: avatarNew}

      
  }
  catch (e) {
    throw e
  }
}

//lay profile

const getProfile = async (userID) =>{

  try{
const sql = `
  SELECT 
    user_id,
    fullname,
    avatar,
    phone,
    created_at,
    email,
    status,
    (
      SELECT COUNT(*) 
      FROM friends 
      WHERE user_id = ? AND status = 'accepted'
    ) AS mount_friends
  FROM users 
  WHERE user_id = ?
`;

const [rows] = await db.query(sql, [userID, userID])

return {success: true, profile: rows[0]}


  }
  catch (e) {
    throw e
  }
}

const hasFriends = async (userID) =>{
  try{
    const [rows] = await db.query(`SELECT 
    u.user_id AS friend_id,
    u.fullname,
    u.avatar
FROM friends f
JOIN users u ON u.user_id = f.friend_id
WHERE f.user_id = ? AND f.status = 'accepted'
`, [userID])

    return {success: true, friends: rows}
  }
  catch (e) {
    throw e
  }
}
export { login, register, changePassword, changeFullname, uploadAvatar, getProfile
  ,hasFriends
 }
