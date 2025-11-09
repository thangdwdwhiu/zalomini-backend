import cookie from 'cookie'; 
import {verifyJWT} from '../src/utils/jwt.js'
import db from '../db.js'
export default function socketHandler(io) {
io.on('connection', async (socket) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.jwt;

    // ❌ Không có token
    if (!token) {
      console.log('⚠️ Không tìm thấy JWT trong cookie, ngắt kết nối socket.');
      socket.emit('unauthorized', 'phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
      socket.disconnect(true);
      return;
    }

    let decoded;
    try {
      decoded = verifyJWT(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        console.log('⚠️ Token hết hạn, ngắt kết nối socket.');
        socket.emit('error', 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
      } else {
        console.log('❌ JWT không hợp lệ:', err.message);
        socket.emit('error', 'Token không hợp lệ.');
      }
      socket.disconnect(true);
      return;
    }

    const userID = decoded.userID;
    
    if (!userID) {
      console.log('⚠️ Token không chứa userID, ngắt kết nối.');
      socket.disconnect(true);
      return;
    }

    console.log(`📡 New user socket -> ${socket.id}, userID = ${userID}`);
    socket.emit('connected', 'Kết nối thành công');
    socket.on('join', fullname => {socket.join(userID.toString())
      console.log(`${fullname} (${userID}) joined room`);
      
    })

    // ✅ Cập nhật trạng thái online
    const [result] = await db.query(
      'UPDATE users SET status = ? WHERE user_id = ?',
      ['online', userID]
    );
    if (result.affectedRows > 0) {
      console.log(`✅ User ${userID} -> online`);
    }

    // 📴 Khi ngắt kết nối
    socket.on('disconnect', async () => {
      try {
        await db.query('UPDATE users SET status = ? WHERE user_id = ?', ['offline', userID]);
        console.log(`🚫 User ${userID} đã ngắt kết nối`);
      } catch (err) {
        console.error(`❌ Lỗi khi cập nhật offline cho user ${userID}:`, err);
      }
    });

    // 💬 Gửi tin nhắn
    socket.on('sendMessage', (message) => {
      console.log(`💌 User ${userID} gửi tin: ${message}`);
      io.emit('message', { userID, message });
    });

  } catch (err) {
    console.error('❌ Lỗi không mong muốn trong socket:', err);
    socket.emit('error', 'Đã xảy ra lỗi máy chủ.');
    socket.disconnect(true);
  }
});
}