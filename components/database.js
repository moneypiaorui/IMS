const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// 连接到 SQLite 数据库
const db = new sqlite3.Database('user.db', (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
        return;
    }
    console.log("Connected to the SQLite database.");
});

//启用外键约束
db.run("PRAGMA foreign_keys = ON");

// 创建文件表
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, userRole TEXT)");
    db.get(`SELECT * FROM users WHERE username = "admin"`, function (err, row) {
        if (!row) {
            db.run(`INSERT INTO users (username, password,userRole) VALUES ("admin", ?, "admin")`,[bcrypt.hashSync("admin", 10)]);
        }
    })
    db.run("CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY, username TEXT, filename TEXT,timestamp INTEGER, FOREIGN KEY(username) REFERENCES users(username))");
    db.run("CREATE TABLE IF NOT EXISTS printLogs (id INTEGER PRIMARY KEY, username TEXT, filename TEXT,printTimestamp INTEGER, pages INTEGER)");
});



module.exports = db;