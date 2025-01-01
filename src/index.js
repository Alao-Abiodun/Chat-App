const path = require('path');
const http = require('http');
const express = require('express');
const SOCKETIO = require('socket.io');
// const { Filter } = require('bad-words');

const PORT = process.env.PORT || 3000;

const APP = express();
const SERVER = http.createServer(APP);
const IO = SOCKETIO(SERVER);

APP.use(express.json());
APP.use(express.urlencoded({extended: true}))

APP.use(express.static(path.join(__dirname, '../public')));

let message = 'Welcome!'

IO.on('connection', (socket) => {
    console.log('New WebSocket connected');

    socket.emit('message', message)

    socket.broadcast.emit('message', 'A new user has joined.');

    socket.on('sendMessage', (clientMessage, callback) => {
        // const filter = new Filter()

        // if (filter.isProfane(message)) {
        //     return callback('Profanity is not allowed!');
        // }

        IO.emit('message', clientMessage);
        callback()
    })

    socket.on('sendLocation', ({ latitude, longitude}, callback) => {
        IO.emit('message', `https://google.com/maps?q=${latitude},${longitude}`)
        callback();
    })

    socket.on('disconnect', () => {
        IO.emit('message', 'A user has left!');
    })
})

SERVER.listen(PORT, () => {
    console.clear();
    console.log(`The Server is listening on port ${PORT}`)
})

