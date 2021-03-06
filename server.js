require('dotenv').config();
const express = require('express');
const app = express();
const {
    v4: uuidv4
} = require('uuid');
const server = require('http').Server(app)
const io = require('socket.io')(server);

// FOR LOCAL PEER SERVER
// const { PeerServer } = require('peer');
// const peerServer = PeerServer({ port: 3001, path: '/' });

app.set('view engine', 'ejs')
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.redirect(`/${uuidv4()}`);
});

app.get('/close', function (req, res) {
    res.render('close');
})

app.get('/:room', function (req, res) {
    res.render('room', {
        roomId: req.params.room
    })
})

// Triggers if any new connection occurs.
io.on("connection", (socket) => {
    socket.on('join-room', function (roomd, userid) {
        socket.join(roomd);
        socket.broadcast.to(roomd).emit('user-connected', userid);

        // New message received
        socket.on('message', (message) => {
            io.to(roomd).emit('createMessage', message);
        });
        // Name of new user received
        socket.on('name', (names) => {
            socket.broadcast.to(roomd).emit('nameReceived', names);
        });
        // Name send to new user
        socket.on('nameSend', (names) => {
            socket.broadcast.to(roomd).emit('nameSended', names);
        });
        // User disconnected
        socket.on('disconnect', function () {
            socket.broadcast.to(roomd).emit("user-disconnected", userid);
        });
    });
});


server.listen(process.env.PORT || 3000, function (req, res) {
    console.log('Server running ...')
});