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
// app.use('/peerjs',peerServer);                 


app.get('/', function (req, res) {
    res.redirect(`/${uuidv4()}`);
});

app.get('/close',function(req,res){
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
        socket.on('message', (message) => {
            io.to(roomd).emit('createMessage', message);
        });
        socket.on('name',(names)=>{
            socket.broadcast.to(roomd).emit('nameReceived', names);
        });
        socket.on('nameSend',(names)=>{
            socket.broadcast.to(roomd).emit('nameSended', names);
        });
        socket.on('disconnect', function (){
            socket.broadcast.to(roomd).emit("user-disconnected", userid);
        });
    });
});


server.listen(process.env.PORT || 3000, function (req, res) {
    console.log('Server running ...')
});
