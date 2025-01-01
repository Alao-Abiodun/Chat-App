const path = require('path');
const http = require('http');
const express = require('express');
const SOCKETIO = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

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

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Admin', message));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));
        IO.to(user.room).emit('roomData', { 
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    })

    socket.on('sendMessage', (clientMessage, callback) => {
        const user = getUser(socket.id);

        if (!user) {
            return callback('User not found!');
        }

        IO.to(user.room).emit('message', generateMessage(user.username, clientMessage));
        callback()
    })

    socket.on('sendLocation', ({ latitude, longitude}, callback) => {
        const user = getUser(socket.id);

        if (!user) {
            return callback('User not found!');
        }

        IO.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            IO.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
            IO.to(user.room).emit('roomData', { 
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

SERVER.listen(PORT, () => {
    console.clear();
    console.log(`The Server is listening on port ${PORT}`)
})