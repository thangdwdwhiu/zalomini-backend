import * as notificationServices from '../services/notificationServices.js'


const createNotification = async (req, res) =>{
    const {userID, content, link} = req.body
    if (!userID || !content || !link) {
        res.status(400).json({success: false, message: 'Thieu du lieu'})

    }
    try{
        const result = await notificationServices.createNotification(userID, content, link)
        res.status(200).json({success: true, notification: result})
    }
    catch (e) {
        res.status(e.status || 500).json({success: false, message: e.message})
    }
}

export {createNotification}