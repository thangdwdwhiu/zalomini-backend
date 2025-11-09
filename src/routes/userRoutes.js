import express from 'express'
import * as userControlers from '../controllers/userControlers.js'
import authMiddleware from '../middleware/authMiddleware.js'
import upload from '../middleware/multer.js'
const router = express.Router()

router.post('/login', userControlers.login)
router.post('/register', userControlers.register)
router.post('/changePassword',authMiddleware, userControlers.changePassword)
router.post('/changeFullname', authMiddleware, userControlers.changeFullname)
router.post('/uploadAvatar', authMiddleware, upload.single('image'), userControlers.uploadAvatar)
router.post('/logout', authMiddleware, userControlers.logout)
router.get('/profile/:id', authMiddleware, userControlers.getProfile)
router.get('/hasFriends/:id', authMiddleware, userControlers.hasFriends)
export default router
