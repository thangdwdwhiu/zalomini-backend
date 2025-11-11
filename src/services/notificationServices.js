import db from '../../db.js'
import createError from '../utils/createError.js'
const createNotification = async (userID, content, link) =>
{
    try{
        const sql = `
        INSERT INTO notifications (user_id, content, link) 
        VALUES (?, ?, ?)`
        const [rows] = await db.query(sql, [userID, content, link])

        return {id: rows.insertId, user_id: userID, content: content, link: link, is_read: '0', created_at: Date.now()}

    }
    catch (e) {
        throw e
    }
}

export {createNotification}