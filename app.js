import express from 'express';
import db from './db.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import userRoutes from './src/routes/userRoutes.js';
import http from 'http';
import { Server } from 'socket.io';
import {verifyJWT} from './src/utils/jwt.js'
import friendsRoutes from './src/routes/friendRoutes.js'
import socketHandler from './socket/socket.js';
import messageRouters from './src/routes/messageRoutes.js'
import authMiddleWare from './src/middleware/authMiddleware.js';
import notificationRoutes from './src/routes/notificationRoutes.js'
import groupRouters from './src/routes/groupRoutes.js'

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ⚙️ Tạo server + socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.URL_FONTEND|| 'http://localhost:5173',
    credentials: true,
    
  },
});

// 🧩 Socket.IO
socketHandler(io)



// ⚙️ Định nghĩa __dirname cho ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚙️ Middleware cơ bản
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  req.io = io
  next()
} )

// ⚙️ CORS
app.use(
  cors({
    origin: process.env.URL_FONTEND || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// 🧩 API kiểm tra DB
app.get('/', async (req, res) => {
  

  const [rows] = await db.query('SELECT * FROM users')

  rows.length > 0  ? res.send("<span style='color:green' >ket noi database thanh cong</span>") : 
  res.send('ket noi db that bai')
})

// 🧩 Router
app.use('/users', userRoutes);
app.use('/friends', friendsRoutes)
app.use('/messages', authMiddleWare, messageRouters)
app.use('/notifications', notificationRoutes)
app.use('/groups', groupRouters)

// 🚀 Khởi động server
server.listen(port, () => {
  console.log(`✅ Server đang chạy tại: ${process.env.URL_BACKEND}`);
});
