const db = require("../components/database");
const express = require('express');
const bcrypt = require('bcrypt');
const authMiddleware = require('../components/authMiddleware');
const fs = require('fs');
const path = require('path');
const manageRouter = express.Router();

manageRouter.use(authMiddleware, (req, res, next) => {
    if (req.userRole != 'admin') {
        return res.status(500).send('你无权访问');
    }
    next();
});

// 查询获取所有用户账号信息
manageRouter.get('/allUsers', (req, res) => {
    db.all('SELECT * FROM users', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // 将查询结果发送给客户端
        res.json(rows);
    });
})
// 添加用户
manageRouter.post('/add', (req, res) => {
    const { username, userRole, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], function (err, row) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        if (row) {
            res.status(409).send(`用户名已存在`);
        } else {
            db.run(`INSERT INTO users (username, password,userRole) VALUES (?, ?,?)`, [username, bcrypt.hashSync(password, 10), userRole], function (err) {
                if (err) {
                    res.status(500).send(err.message);
                } else {
                    delete req.body.password;
                    res.status(200).json({id:this.lastID,...req.body})
                }
            });
        }
    })
});

// 删除用户
manageRouter.post('/delete', authMiddleware, (req, res) => {
    const { rUsername, userRole } = req.body;
    // 外键约束要求先删除files表所有username为rUsername的行
    // 删除该用户的所有文件,表和本地文件都要删除
    db.all(`SELECT * FROM files WHERE username = ?`, [rUsername], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return console.error(err.message);
        } else {
            // 删除uploads文件夹中该用户的所有文件
            rows.forEach(row => {
                const filePath = path.join(__dirname, '../uploads', row.timestamp+'-'+row.filename); // 文件存储在 uploads 文件夹下
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('删除' + row.filename + '时出错:', err);
                        return console.error(err.message);
                    } else {
                        // console.log('成功删除文件:', row.filename);
                    }
                });
            });
            // 删除表中数据
            db.run("DELETE FROM files WHERE username = ?", [rUsername], function (err) {
                if (err) {
                    res.status(500).send("删除失败")
                    return console.error(err.message);
                }
                // 删除users表数据
                db.run("DELETE FROM users WHERE username = ?", [rUsername], function (err) {
                    if (err) {
                        res.status(500).send(err.message)
                        return console.error(err.message);
                    }
                    console.log(`User  ${rUsername} has been deleted`);
                    res.status(200).json({ message: "删除成功" })
                });
            });

        }
    });

})
// 获取打印记录
manageRouter.get('/printLogs', (req, res) => {
    const {'0': startTimestamp, '1':endTimestamp } = req.query;
    db.all(`SELECT * FROM printLogs WHERE printTimestamp BETWEEN ? AND ?`, [startTimestamp, endTimestamp], (err, rows) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    })
})
manageRouter.get('/allPrintLogs', (req, res) => {
    db.all(`SELECT * FROM printLogs `, (err, rows) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    })
})

// 获取文件信息
manageRouter.get('/allFiles', (req, res) => {
    db.all('SELECT * FROM files', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // 将查询结果发送给客户端
        res.json(rows);
    });
})

manageRouter.get('/getFile', (req, res) => {
    const { timestamp, filename } = req.query;
    const completeFilename = `${timestamp}-${filename}`;
    let filePath = path.join(__dirname, '../uploads', completeFilename);
    if (filename) {
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(err.status).end();
            }
        });
    } else {
        res.status(400).send('未选择文件');
    }
})
module.exports = manageRouter;

