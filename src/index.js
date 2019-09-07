// Back End File

// Express Variables

const express = require('express')
const app = express()

// Node Variables

const http = require('http')
const server = http.createServer(app)
const port = process.env.PORT || 3000
const path = require('path')

// Socket IO Variables

const socketIO = require('socket.io')
const io = socketIO(server)

// Bad Words Variables

const Filter = require('bad-words')

// Import Utilities

const { generateMessage, generateLocation } = require('./utils/messages')
const { addUser, removeUser, getUser, getRoomUsers } = require('./utils/users')

// Get To The 'Public' Directory From The Current Folder

const publicDirectoryPath = path.join(__dirname, '../public')

// Serve The 'Index' File From A Given Root Directory

app.use(express.static(publicDirectoryPath))

// Print 'New WebSocket Connection!' For Every New Connection

io.on('connection', socket => {

    // Everytime A Socket Joins A Chat Room..

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username, room })
        
        if (error)
            return callback(error)

        socket.join(user.room)

        // Welcome Him

        socket.emit('message', generateMessage('רובוט', `ברוכים הבאים ${user.username}!`))

        // Deliver A Message For Every Single Connection In This Specific Room,
        // Except The Particular Socket
    
        socket.broadcast.to(user.room).emit('message', generateMessage('רובוט', `${user.username} הצטרפ/ה לחדר!`))

        // After Joining, Update All Connections In This Room About The Current List Of Users

        io.to(user.room).emit('roomData', {

            room: user.room,
            users: getRoomUsers(user.room)

        })

        callback()

    }) 

    // Everytime A Socket Sends A Message, Send It To All Connections

    socket.on('sendMessage', (msg, callback) => {
        
        const user = getUser(socket.id)
        const filter = new Filter()

        // If The Message Is Written In Profane Language, Clarify To The User
        // That Profanity Is Not Allowed

        if (filter.isProfane(msg))
            return callback('Profanity Is Not Allowed!')

        // If Message Is Empty, Don't Send It

        if (msg.trim())
            io.to(user.room).emit('message', generateMessage(user.username, msg))

        callback()
        
    })

    // Everytime A Socket Sends A Location, Share It With All Connections

    socket.on('sendLocation', (coords, callback) => {

        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://google.com/maps?q=${coords.lat},${coords.long}`))
        callback()

    })

    // Everytime A Socket Disconnects, Inform Every Connection About It

    socket.on('disconnect', () => {

        const removedUser = removeUser(socket.id)

        if (removedUser) {

            io.to(removedUser.room).emit('message', generateMessage('רובוט', `${removedUser.username} עזב/ה את החדר!`))
            io.to(removedUser.room).emit('roomData', {

                room: removedUser.room,
                users: getRoomUsers(removedUser.room)

            })

        }

    })

})

// Start Server

server.listen(port, () => console.log(`Server Is Up On Port ${port}!`))