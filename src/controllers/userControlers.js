import db from '../../db.js'
import {generateJWT} from '../utils/jwt.js'
import * as userServices from '../services/userServices.js'

const login = async (req, res) => {
    try{
    const {user_id, username, password, phone, avatar, fullname} = await userServices.login(req)
    const token = generateJWT(user_id,fullname, username);
    res.cookie('jwt', token, {
    secure: false,
    httpOnly: true,
    path: '/',
    maxAge: 1000*60*60*2,
    sameSite: 'lax'
  } )
    res.status(200).json({success: true, message: 'dang nhap thanh cong', data: {user_id, username, password, phone, avatar, fullname }})
    }
    catch (e){
        res.status(e.status || 500).json({success: false, message: e.message})
    }   

}

const register = async (req, res) =>{
    try{
    const data = await userServices.register(req)
    res.status(200).json(data)
    }
    catch (e) {
        res.status(e.status || 500).json({success: false, message: e.message})
    }
}

//doi mat khau
const changePassword = async (req, res) =>{
    try{
        const {passwordNew}  = req.body
        const userID = req.userID
        if (!passwordNew || passwordNew.length < 6)
        {
            res.status(400).json({success: false, message: 'data is not valid'})
        }
        const result = await userServices.changePassword(userID, passwordNew)

        res.status(200).json(result)
    }
    catch (e) {
        res.status(e.status | 500).json({success: false, message: e.messages})
    }
}

const  changeFullname = async (req, res) =>{
    const userID = req.userID
    const {fullnameNew } = req.body
    if (!fullnameNew) {
        res.status(400).json({success: false, message: 'data is not valid'})
    }
         try{

        const result = await userServices.changeFullname(userID, fullnameNew)
        res.status(200).json(result)
     }
     catch (e) {
        res.status(e.status || 500).json({success: false, message: e.message})
     }
}
//thay anh dai dien
const uploadAvatar = async (req, res) =>{
    const userID = req.userID
    const image = req.file ? req.file.filename : null;
    if (!image)
    {
        res.status(400).json({success: false, message: 'Ảnh chưa được tải lên'})
    }
    const imageUrl = image ? `${process.env.URL_BACKEND}/uploads/${image}` : null;

    try{
            const result = await userServices.uploadAvatar(userID, imageUrl)
            res.status(200).json(result)
    }
    catch (e)
    {
        res.status(e.status || 500).json({success: false, message: e.message})
    }


}
//dang xuat
const logout = async (req, res) =>{
  
    try{
  
  res.cookie('jwt', '', {
    expires: new Date(0), 
    secure: false,
    httpOnly: true,
    path: '/',
    maxAge: 1000*60*60*2,
    sameSite: 'lax'
  });
  res.status(200).send('Đã đăng xuất và xóa cookie');
}
catch (e) {
  res.status(500).json({success: false, message: 'Loi server khi dang xuat'})
}

}
//lay profile

const getProfile =  async (req, res) =>{
    const userID = req.params.id ? req.params.id : req.userID
    try{
        const result = await userServices.getProfile(userID)
        res.status(200).json(result)
    }
    catch(e){
        res.status(500).json({success: false, message: e.message})
    }
}
//lay ban be co san
const hasFriends =  async (req, res) =>{
    const userID = req.params.id
    if (!userID) {
        res.status(400).json({success: false, message: 'thieu du lieu'})
    }
    try{
        const result = await userServices.hasFriends(userID)
        res.status(200).json(result)
    }
    catch(e){
        res.status(500).json({success: false, message: e.message})
    }
}
export {login, register, changePassword, changeFullname, uploadAvatar, logout, getProfile,
    hasFriends
}