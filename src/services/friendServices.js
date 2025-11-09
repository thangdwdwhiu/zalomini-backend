import db from "../../db.js";
import createError from "../utils/createError.js";

/**
 * Gửi lời mời kết bạn
 */
const sendRequest = async (senderID, receiverID) => {
  try {
    if (!senderID || !receiverID) {
      throw createError(400, "Thiếu thông tin người gửi hoặc người nhận");
    }

    if (senderID === receiverID) {
      throw createError(400, "Không thể gửi lời mời cho chính mình");
    }

    // Kiểm tra có chặn nhau không
    const [blockedCheck] = await db.query(
      `SELECT * FROM friends 
       WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
       AND status = 'blocked'`,
      [senderID, receiverID, receiverID, senderID]
    );

    if (blockedCheck.length > 0) {
      throw createError(403, "Không thể gửi lời mời do một trong hai đã chặn");
    }

    // Kiểm tra trùng lặp lời mời hoặc đã là bạn bè
    const [rows] = await db.query(
      "SELECT * FROM friends WHERE user_id = ? AND friend_id = ?",
      [senderID, receiverID]
    );

    if (rows.length > 0) {
      throw createError(409, "Đã gửi lời mời hoặc đã là bạn bè");
    }

    // Gửi lời mời
    const [result] = await db.query(
      "INSERT INTO friends (user_id, friend_id, status, created_at) VALUES (?, ?, 'pending', NOW())",
      [senderID, receiverID]
    );

    return {
      success: true,
      message: "Gửi lời mời thành công",
      requestId: result.insertId,
    };
  } catch (error) {
    console.error("❌ Lỗi trong sendRequest:", error);
    throw error;
  }
};

/**
 * Chấp nhận lời mời kết bạn
 */
const acceptRequest = async (userID, senderID) => {
  try {
    const [result] = await db.query(
      "UPDATE friends SET status = 'accepted' WHERE user_id = ? AND friend_id = ? AND status = 'pending'",
      [senderID, userID]
    );

    if (result.affectedRows === 0) {
      throw createError(404, "Không tìm thấy lời mời kết bạn hợp lệ");
    }

    // Tạo quan hệ ngược (để 2 chiều)
    await db.query(
      "INSERT INTO friends (user_id, friend_id, status, created_at) VALUES (?, ?, 'accepted', NOW())",
      [userID, senderID]
    );

    return { success: true, message: "Chấp nhận lời mời thành công" };
  } catch (error) {
    console.error("❌ Lỗi trong acceptRequest:", error);
    throw error;
  }
};

/**
 * Lấy danh sách bạn bè — chỉ lấy khi không ai chặn ai
 */
const getFriends = async (userID) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT u.user_id, u.username, u.avatar, u.fullname, u.phone
       FROM users u
       JOIN friends f 
       ON (f.friend_id = u.user_id OR f.user_id = u.user_id)
       WHERE (f.user_id = ? OR f.friend_id = ?)
         AND f.status = 'accepted'
         AND u.user_id != ?
         AND NOT EXISTS (
            SELECT 1 FROM friends fb
            WHERE (
                (fb.user_id = ? AND fb.friend_id = u.user_id)
                OR (fb.user_id = u.user_id AND fb.friend_id = ?)
            )
            AND fb.status = 'blocked'
         )`,
      [userID, userID, userID, userID, userID]
    );

    return { success: true, friends: rows };
  } catch (error) {
    console.error("❌ Lỗi trong getFriends:", error);
    throw createError(500, "Không thể lấy danh sách bạn bè");
  }
};

/**
 * Lấy danh sách lời mời kết bạn
 */
const getRequests = async (userID) => {
  try {
    const [rows] = await db.query(
      `SELECT u.user_id, u.username, u.avatar, u.fullname, u.phone
       FROM users u
       JOIN friends f ON f.user_id = u.user_id
       WHERE f.friend_id = ?
       AND f.status = 'pending'`,
      [userID]
    );

    return { success: true, requests: rows };
  } catch (error) {
    console.error("❌ Lỗi trong getRequests:", error);
    throw createError(500, "Không thể lấy danh sách lời mời kết bạn");
  }
};

/**
 * Xóa bạn bè
 */
const deleteFriend = async (userID, friendID) => {
  try {
    if (!userID || !friendID) {
      throw createError(400, "Thiếu thông tin người dùng hoặc bạn bè");
    }

    const [result] = await db.query(
      `DELETE FROM friends 
       WHERE (user_id = ? AND friend_id = ?) 
          OR (user_id = ? AND friend_id = ?)`,
      [userID, friendID, friendID, userID]
    );

    if (result.affectedRows === 0) {
      throw createError(404, "Không tìm thấy bạn bè để xóa");
    }

    return { success: true, message: "Đã xóa bạn bè thành công" };
  } catch (error) {
    console.error("❌ Lỗi trong deleteFriend:", error);
    throw error;
  }
};

/**
 * Chặn bạn bè hoặc người dùng
 */
const block = async (userID, friendID) => {
  try {
    if (!userID || !friendID) {
      throw createError(400, "Thiếu thông tin người dùng hoặc bạn bè");
    }

    // Khi chặn ai đó: xóa quan hệ bạn bè hoặc lời mời nếu có
    await db.query(
      `DELETE FROM friends 
       WHERE (user_id = ? AND friend_id = ?) 
          OR (user_id = ? AND friend_id = ?)`,
      [userID, friendID, friendID, userID]
    );

    // Tạo bản ghi chặn một chiều
    const [result] = await db.query(
      `INSERT INTO friends (user_id, friend_id, status, created_at)
       VALUES (?, ?, 'blocked', NOW())
       ON DUPLICATE KEY UPDATE status = 'blocked', created_at = NOW()`,
      [userID, friendID]
    );

    return { success: true, message: "Đã chặn người dùng thành công" };
  } catch (error) {
    console.error("❌ Lỗi trong block:", error);
    throw error;
  }
}
//tu choi loi moi ket ban
const reject = async (userID, friendID) =>{
try {
    if (!userID || !friendID) {
      throw createError(400, "Thiếu thông tin người dùng hoặc bạn bè");
    }

    // Kiểm tra có lời mời đang chờ không
    const [check] = await db.query(
      "SELECT * FROM friends WHERE user_id = ? AND friend_id = ? AND status = 'pending'",
      [friendID, userID]
    );

    if (check.length === 0) {
      throw createError(404, "Không tìm thấy lời mời kết bạn để từ chối");
    }

    // Xóa lời mời
    const [result] = await db.query(
      "DELETE FROM friends WHERE user_id = ? AND friend_id = ? AND status = 'pending'",
      [friendID, userID]
    );

    if (result.affectedRows === 0) {
      throw createError(404, "Không thể từ chối lời mời");
    }

    return { success: true, message: "Đã từ chối lời mời kết bạn" };
  } catch (error) {
    console.error("❌ Lỗi trong handleReject:", error);
    throw error;
  }
}

const searchUsers = async (userID, keyword) => {
  try {
    if (!keyword || keyword.trim() === "") {
      throw createError(400, "Thiếu từ khóa tìm kiếm");
    }

    // Tìm theo số điện thoại hoặc tên hiển thị
    const [users] = await db.query(
      `
      SELECT 
        u.user_id AS user_id, 
        u.fullname, 
        u.phone, 
        u.avatar,
        (
          SELECT f.status 
          FROM friends f 
          WHERE (f.user_id = ? AND f.friend_id = u.user_id)
             OR (f.friend_id = ? AND f.user_id = u.user_id)
          LIMIT 1
        ) AS relationship_status
      FROM users u
      WHERE 
        (u.phone LIKE ? OR u.fullname LIKE ?)
        AND u.user_id != ?
      LIMIT 20
      `,
      [userID, userID, `%${keyword}%`, `%${keyword}%`, userID]
    );

    return {
      success: true,
      users,
    };
  } catch (error) {
    console.error("❌ Lỗi trong searchUsers:", error);
    throw error;
  }
};

export { sendRequest, acceptRequest, getFriends, getRequests, deleteFriend, block, reject, searchUsers };
