import express from 'express'
import * as friendControllers from '../controllers/friendControllers.js'
import authMiddleware from '../middleware/authMiddleware.js'
const router = express.Router()



router.post('/request', friendControllers.sendRequest )
router.post('/accept/:id', friendControllers.acceptRequest )
router.get('/', friendControllers.getFriends)
router.get('/requests', friendControllers.getRequests)
router.post('/delete/:id', friendControllers.deleteFriend)
router.post('/block/:id', friendControllers.block)
router.post('/reject/:id', friendControllers.reject)
router.get('/search', authMiddleware, friendControllers.searchUsers)

export default router