import * as messageServices from '../services/messageServices.js'
import dotenv from 'dotenv'

dotenv.config()


//lay tin nhan 1 - 1
const getConversations  = async (req, res) =>{
    try
{
    const partnerID = req.params.id
    const userID = req.userID
    if (!partnerID || !userID) {
        res.status(400).json({success: false, message: 'khong lay duoc du lieu'})
    }
    const { limit = 50, offset = 0 } = req.query
    const conversations  = await messageServices.getConversations(userID, partnerID, limit, offset)
    res.status(200).json(conversations)
}
catch (e) {
    res.status(e.status || 500).json({success: false, message: e.message})
}
}



//lay lien he
const getContacts  = async (req, res) =>{
    try
{
    const conversations  = await messageServices.getContacts(req.userID)
    res.status(200).json(conversations)
}
catch (e) {
    res.status(e.status || 500).json({success: false, message: e.message})
}
}

//gui text

// Gửi tin nhắn (text và/hoặc ảnh)
const sendText = async (req, res) => {
  try {
    const { to, text } = req.body;
const image = req.file ? req.file.filename : null;
const imageUrl = image ? `${process.env.URL_BACKEND}/uploads/${image}` : null;

    const from = req.userID;

    // Kiểm tra dữ liệu
    if (!text && !image) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });
    }

    const io = req.io;

    // Gọi service xử lý lưu DB
    const result = await messageServices.sendText(from, to, text, imageUrl);

    // Phát socket cho người nhận

const messagesToEmit = Array.isArray(result.data) ? result.data : [result.data];
messagesToEmit.forEach(msg => {
    io.to(to.toString()).emit("newMessage", msg);
});

    console.log(`${from} gửi tin nhắn cho ${to}`);

    res.status(200).json(result);
  } catch (e) {
    console.error("Lỗi khi gửi tin nhắn:", e);
    res.status(e.status || 500).json({ success: false, message: e.message });
  }
};

//danh dau tin nhan 1-1
const read = async (req, res) =>{
    try{
    
        const userID = req.userID
        const {friendID} = req.body
        const result = await messageServices.read(userID, friendID)
        res.status(200).json(result)
    }
    catch (e) {
        res.status(e.status || 500).json({success: false, message: e.message})
    }
}

export {getContacts, sendText, getConversations, read}