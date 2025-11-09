import express from 'express'
import authMiddleWare from '../middleware/authMiddleware.js'
import * as messageControllers from '../controllers/messageControllers.js'
import upload from '../middleware/multer.js'
const router = express.Router()




router.get('/contacts',authMiddleWare,messageControllers.getContacts)
router.post('/send',upload.single('image'),authMiddleWare,messageControllers.sendText)
router.get('/conversations/:id',authMiddleWare,messageControllers.getConversations)
router.post('/read',authMiddleWare,messageControllers.read)


export default router