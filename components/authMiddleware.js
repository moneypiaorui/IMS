// authMiddleware.js

const jwt = require('jsonwebtoken');
const db = require("./database")

function authMiddleware(req, res, next) {
    // 从请求头中获取令牌 
    const token = req.header("Authorization")

    if (!token) {
        console.log("缺少身份验证令牌")
        return res.status(401).json({ message: '缺少身份验证令牌' });
    }

    try {
        // 验证令牌的有效性并解码
        const payload = jwt.verify(token, 'secret_key');

        db.get('SELECT * FROM users WHERE username = ?', [payload.username], (err, row) => {
            if (!row) {
                // throw new Error('No this username!');
                console.log("无效的身份验证令牌")
                return res.status(401).json({ message: "无效的身份验证令牌" });
            } else {
                console.log("payload: " + payload.username);
                req.username = payload.username; // 将解码后的用户信息存储在请求对象中
                req.userRole = row.userRole;//默认管理员权限
                next();
            }

        })
    } catch (error) {
        console.log("无效的身份验证令牌")
        // console.log(error)
        return res.status(401).json({ message: error });
    }
}

module.exports = authMiddleware;
