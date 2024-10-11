const express = require('express');
const logsRouter = express.Router();
const authMiddleware = require('../components/authMiddleware');
const db = require('../components/database');

logsRouter.get('/print', authMiddleware, (req, res) => {
    const { startTimestamp, endTimestamp } = req.body;
    db.all(`SELECT * FROM printLogs WHERE timestamp BETWEEN ? AND ? AND username = ?`, [startTimestamp, endTimestamp, req.username], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    })
})

module.exports = logsRouter;