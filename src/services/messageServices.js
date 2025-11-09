import createError from "../utils/createError.js";
import db from "../../db.js";

//lay hoi thoai 1-1 với phân trang
const getConversations = async (userID, partnerID, limit = 30, offset = 0) => {
  if (!userID || !partnerID) {
    throw createError(401, "Phiên đăng nhập hết hạn hoặc thiếu partnerID");
  }

  limit = parseInt(limit) || 30;
  offset = parseInt(offset) || 0;

  const sql = `
    SELECT 
      m.message_id,
      m.sender_id,
      m.receiver_id,
      m.content,
      m.message_type,
      m.is_read,
      m.sent_at
    FROM messages m
    WHERE 
      (m.sender_id = ? AND m.receiver_id = ?) OR
      (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.sent_at DESC
    LIMIT ? OFFSET ?;
  `;

  // Query để đếm tổng số tin nhắn
  const countSql = `
    SELECT COUNT(*) as total
    FROM messages m
    WHERE 
      (m.sender_id = ? AND m.receiver_id = ?) OR
      (m.sender_id = ? AND m.receiver_id = ?)
  `;

  try {
    const [rows] = await db.query(sql, [userID, partnerID, partnerID, userID, limit, offset]);
    const [countResult] = await db.query(countSql, [userID, partnerID, partnerID, userID]);
    
    const total = countResult[0].total;
    const hasMore = offset + rows.length < total;

    return { 
      success: true, 
      messages: rows.reverse(), // Đảo ngược để hiển thị đúng thứ tự
      pagination: {
        total,
        limit,
        offset,
        hasMore
      }
    };
  } catch (err) {
    console.error("⌠Lỗi lấy danh sách tin nhắn:", err);
    throw createError(500, "Không thể lấy danh sách tin nhắn");
  }
};

//lay lien he
const getContacts = async (userID) => {
  try {
    const sql = `
SELECT 
  u.user_id,
  u.fullname,
  u.avatar,
  u.status,

  -- Tin nhắn cuối cùng
  (
    SELECT m.content 
    FROM messages m 
    WHERE 
      (m.sender_id = u.user_id AND m.receiver_id = ?) OR 
      (m.sender_id = ? AND m.receiver_id = u.user_id)
    ORDER BY m.sent_at DESC 
    LIMIT 1
  ) AS last_message,

  -- Người gửi của tin cuối cùng
  (
    SELECT m.sender_id
    FROM messages m 
    WHERE 
      (m.sender_id = u.user_id AND m.receiver_id = ?) OR 
      (m.sender_id = ? AND m.receiver_id = u.user_id)
    ORDER BY m.sent_at DESC 
    LIMIT 1
  ) AS sender_id_last,

  -- Trạng thái đã đọc
  (
    SELECT m.is_read 
    FROM messages m 
    WHERE 
      (m.sender_id = u.user_id AND m.receiver_id = ?) OR 
      (m.sender_id = ? AND m.receiver_id = u.user_id)
    ORDER BY m.sent_at DESC 
    LIMIT 1
  ) AS is_read,

  -- Thời gian gửi cuối
  (
    SELECT m.sent_at 
    FROM messages m 
    WHERE 
      (m.sender_id = u.user_id AND m.receiver_id = ?) OR 
      (m.sender_id = ? AND m.receiver_id = u.user_id)
    ORDER BY m.sent_at DESC 
    LIMIT 1
  ) AS last_time

FROM friends f 
LEFT JOIN users u 
  ON f.friend_id = u.user_id
WHERE f.user_id = ? AND f.status = 'accepted'
ORDER BY last_time DESC;
`;

    const [rows] = await db.query(sql, [
      userID, userID, 
      userID, userID, 
      userID, userID, 
      userID, userID, 
      userID        
    ]);

    return { success: true, contacts: rows }
  } catch (err) {
    throw err
  }
};

const sendText = async (from, to, text, imageUrl) => {
  try {
    if (!text && !imageUrl)
      throw createError(400, "Không có nội dung hoặc ảnh để gửi");

    const messages = [];

  
    if (text) {
      const [resText] = await db.query(
        `INSERT INTO messages (sender_id, receiver_id, content, message_type, sent_at, is_read)
         VALUES (?, ?, ?, 'text', NOW(), 0)`,
        [from, to, text]
      );
      if (resText.affectedRows === 0)
        throw createError(500, "Không thể tạo tin nhắn văn bản");

      messages.push({
        message_id: resText.insertId,
        sender_id: from,
        receiver_id: to,
        content: text,
        image_url: null,
        message_type: "text",
        is_read: 0,
        sent_at: new Date(),
      });
    }

 
    if (imageUrl) {
      const [resImg] = await db.query(
        `INSERT INTO messages (sender_id, receiver_id, content, message_type, sent_at, is_read)
         VALUES (?, ?, ?, 'image', NOW(), 0)`,
        [from, to, imageUrl]
      );
      if (resImg.affectedRows === 0)
        throw createError(500, "Không thể tạo tin nhắn hình ảnh");

      messages.push({
        message_id: resImg.insertId,
        sender_id: from,
        receiver_id: to,
        content: imageUrl,
        message_type: "image",
        is_read: 0,
        sent_at: new Date(),
      });
    }

    return {
      success: true,
      message: "Gửi tin nhắn thành công",
      data: messages.length === 1 ? messages[0] : messages,
    };
  } catch (err) {
    console.error("⌠Lỗi khi gửi tin nhắn:", err);
    throw err;
  }
};

//doc tin nhan
const read = async (userID, friendID) => {
  try {
    const [rows] = await db.query(`UPDATE messages SET is_read = '1'  WHERE
      (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) `, [userID, friendID, friendID, userID])
    if (rows.affectedRows == 0) {
      throw createError(500, "khong the danh dau tin nhan")
    }
    return { success: true, message: 'danh dau tin nhan thanh cong' }
  }
  catch (e) {
    throw e
  }
}

export { getContacts, sendText, getConversations, read };