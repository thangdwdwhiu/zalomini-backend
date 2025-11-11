import * as friendServices from '../services/friendServices.js'
import { verifyJWT } from '../utils/jwt.js'
import { createNotification } from '../services/notificationServices.js'
import dotenv from 'dotenv'

dotenv.config()
const sendRequest = async (req, res) => {
  const token = req.cookies.jwt
  const io = req.io
  if (!token) {
    return res.status(401).json({ success: false, message: 'Người dùng chưa đăng nhập' })
  }

  let userID,fullname
  try {
    ({ userID, fullname } = verifyJWT(token))
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn' })
    }
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' })
  }

  const { receiverID } = req.body
  try {
    const result = await friendServices.sendRequest(userID, receiverID)
    await createNotification(receiverID, `${fullname} đã gửi lời mời kết bạn`, userID)
    io.to(receiverID.toString()).emit('newRequest', `${fullname} đã gửi lời mời kết bạn`)
    res.status(201).json(result)
  } catch (e) {
    res.status(e.status || 500).json({ success: false, message: e.message })
  }
}

const acceptRequest = async (req, res) => {
  const token = req.cookies.jwt
  if (!token) {
    return res.status(401).json({ success: false, message: 'Người dùng chưa đăng nhập' })
  }

  let userID, fullname
  try {
    ({ userID, fullname } = verifyJWT(token))
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn' })
    }
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' })
  }

  const senderID = req.params.id
  try {
    const result = await friendServices.acceptRequest(userID, senderID)
    await createNotification(senderID,`${fullname} đã chấp nhận lời mời kết bạn`, userID)
    req.io.to(senderID.toString()).emit('newAccept', `${fullname} đã chấp nhận lời mời kết bạn`)
    res.status(201).json(result)
  } catch (e) {
    res.status(e.status || 500).json({ success: false, message: e.message })
  }
}

//lay danh sach ban
const getFriends = async (req, res) => {
  const token = req.cookies.jwt
  if (!token) {
    return res.status(401).json({ success: false, message: 'Người dùng chưa đăng nhập' })
  }

  let userID
  try {
    ({ userID } = verifyJWT(token))
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn' })
    }
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' })
  }

  try {
    const result = await friendServices.getFriends(userID)
    res.status(200).json(result)
  } catch (e) {
    res.status(e.status || 500).json({ success: false, message: e.message })
  }
}
//lay danh sach loi moi 
const getRequests = async (req, res) => {
  const token = req.cookies.jwt
  if (!token) {
    return res.status(401).json({ success: false, message: 'Người dùng chưa đăng nhập' })
  }

  let userID
  try {
    ({ userID } = verifyJWT(token))
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn' })
    }
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' })
  }

  try {
    const result = await friendServices.getRequests(userID)
    res.status(200).json(result)
  } catch (e) {
    res.status(e.status || 500).json({ success: false, message: e.message })
  }
}

//xoa ban
const deleteFriend = async (req, res) =>{
const token = req.cookies.jwt
  if (!token) {
    return res.status(401).json({ success: false, message: 'Người dùng chưa đăng nhập' })
  }

  let userID
  try {
    ({ userID } = verifyJWT(token))
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn' })
    }
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' })
  }

  const friendID = req.params.id
  try {
    const result = await friendServices.deleteFriend(userID, friendID)
    res.status(200).json(result)
  } catch (e) {
    res.status(e.status || 500).json({ success: false, message: e.message })
  }
}

//chan ban
const block = async (req, res) =>{
const token = req.cookies.jwt
  if (!token) {
    return res.status(401).json({ success: false, message: 'Người dùng chưa đăng nhập' })
  }

  let userID
  try {
    ({ userID } = verifyJWT(token))
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn' })
    }
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' })
  }

  const friendID = req.params.id
  try {
    const result = await friendServices.block(userID, friendID)
    res.status(200).json(result)
  } catch (e) {
    res.status(e.status || 500).json({ success: false, message: e.message })
  }
}

//tu choi loi moi ket ban
const reject = async (req, res) =>{
const token = req.cookies.jwt
  if (!token) {
    return res.status(401).json({ success: false, message: 'Người dùng chưa đăng nhập' })
  }

  let userID
  try {
    ({ userID } = verifyJWT(token))
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập đã hết hạn' })
    }
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' })
  }

  const friendID = req.params.id
  try {
    const result = await friendServices.reject(userID, friendID)
    res.status(200).json(result)
  } catch (e) {
    res.status(e.status || 500).json({ success: false, message: e.message })
  }  
}
//tim ban
const searchUsers = async (req, res) =>{


  const keyword = req.query.keyword
  try {
    const result = await friendServices.searchUsers(req.userID, keyword)
    res.status(200).json(result)
  } catch (e) {
    res.status(e.status || 500).json({ success: false, message: e.message })
  }  
}


export { sendRequest, acceptRequest, getFriends, getRequests, deleteFriend, block, reject, searchUsers }
