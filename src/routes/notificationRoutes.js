import express from 'express'
import * as notificationControllers from '../controllers/notificationControllers.js'


const router  = express.Router()



router.post('/createNotification', notificationControllers.createNotification)

export default router