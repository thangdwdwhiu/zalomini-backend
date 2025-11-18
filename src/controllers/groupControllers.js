import dotenv from 'dotenv'
import * as groupServices from '../services/groupServices.js'
import {validationResult } from "express-validator"


dotenv.config()



const getGroupContacts = async (req, res) =>{
        const {groupID} = req.body
        try{
                const result = await groupServices.getGroupContacts(groupID)
        }
        catch (e) {
                
        }
}
const createGroup = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "thiếu dữ liệu",
            errors: errors.array()
        });
    }

    const { groupName } = req.body;
    const image = req.file ? req.file.filename : null;

    const groupAvatar = image
        ? `${process.env.URL_BACKEND}/uploads/${image}`
        : `${process.env.URL_BACKEND}/img/group.jpg`;

    const createBy = req.userID;

    try {
        const result = await groupServices.createGroup(groupName, groupAvatar, createBy);

        return res.status(201).json({
            success: true,
            message: 'tạo nhóm thành công',
            group: result
        });

    } catch (e) {
        return res.status(e.status || 500).json({
            success: false,
            message: 'lỗi server',
            error: e.message
        });
    }
};


export {createGroup}