const express = require('express');
const axios = require('axios');

const background = express.Router();
background.get('/pc', (req, res) => {
        axios.get('https://api.lolicon.app/setu/v2', {
            params: {
                r18: 0,
                // tag: '碧蓝航线|AzurLane',
                aspectRatio:'gt1'//横图
            }
        }).then(result => {
            res.redirect(result.data.data[0].urls.original)
        })
        .catch(error => {
            console.error('Error:', error);
        });
})

background.get('/mp', (req, res) => {
    axios.get('https://api.lolicon.app/setu/v2', {
        params: {
            r18: 0,
            // tag: '碧蓝航线|AzurLane',
            aspectRatio:'lt1'//竖图
        }
    }).then(result => {
        res.redirect(result.data.data[0].urls.original)
    })
    .catch(error => {
        console.error('Error:', error);
    });
})

module.exports = background;