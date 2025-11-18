import createError from '../utils/createError.js'
import db from '../../db.js'




const getGroupContacts = async (groupID) =>{
        try{

const sql = `
    SELECT 
        g.group_id, 
        g.group_name, 
        g.group_avatar, 
        g.created_by, 
        g.created_at,
        (SELECT content FROM group_messages WHERE group_id = ? ORDER BY sent_at DESC LIMIT 1) AS last_message_group,
        (SELECT sent_at FROM group_messages WHERE group_id = ? ORDER BY sent_at DESC LIMIT 1) AS last_sent_at
    FROM groups g
    WHERE g.group_id = ?
`;

const [rows] = await db.query(sql, [groupID, groupID, groupID]);


        }
        catch (e) {
                throw e
        }
}

const createGroup = async (groupName, groupAvatar, createBy) => {
  try {
    const [rows] = await db.query(
      `INSERT INTO groups (group_name, group_avatar, created_by)
       VALUES (?, ?, ?)`,
      [groupName, groupAvatar, createBy]
    );

    return {
      group_id: rows.insertId,
      group_name: groupName,
      group_avatar: groupAvatar,
      created_by: createBy
    };
  } catch (error) {
    throw error;
  }
};

export {getGroupContacts, createGroup}