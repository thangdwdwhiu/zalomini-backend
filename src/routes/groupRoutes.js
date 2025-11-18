import {body } from "express-validator";
import express from 'express'
import  authMiddleware from '../middleware/authMiddleware.js'
import * as groupControllers from '../controllers/groupControllers.js'
import multer from '../middleware/multer.js'

const router = express.Router()
const createGroup = [
  body('groupName')
    .isEmpty()
    .withMessage('tên nhóm không hợp lệ'),

]

router.post('/create', authMiddleware, createGroup, multer.single('image'),  groupControllers.createGroup )


export default router
