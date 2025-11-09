import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config();

const secretKey = process.env.JWT_SECRET ?? null;

export default function authMiddleWare(req, res, next)
{
    try{
        const token = req.cookies?.jwt;
        if (!token)
        {
            return res.status(401).json({success: false, error: 'vui long dang nhap'});
        }
        const decode  = jwt.verify(token, secretKey,{algorithms: ['HS256']});
        req.userID = decode.userID;
        next();


    }
    catch (e)
    {
        console.log('auth error' + e.message);
        res.status(403).json({success : false, error: 'khong du quyen truy cap ' + e.message});
        
    }
}
