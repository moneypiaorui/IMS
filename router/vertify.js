const express = require('express');
const authMiddleware = require('../components/authMiddleware')

const vertifyRouter  =express.Router();

vertifyRouter.get('/',authMiddleware, (req, res)=>{
    res.status(200).json({username:req.username,userRole:req.userRole});
    console.log("用户"+req.username+"自动登录")
})

module.exports = vertifyRouter