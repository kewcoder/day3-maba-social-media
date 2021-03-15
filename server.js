require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io")
const io = socket(server)
const path = require('path');
const users = {};

const socketToRoom = {};

let roomData = [];
let userData = [];

app.use(express.static('client/build'))

app.get('/*', (req, res, next) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});
  


io.on('connection', socket => {

    socket.on("find room", () => {
        let filterRoomData  = roomData.filter(d => d.length >= 1);
        roomData = filterRoomData
        socket.emit("all rooms", filterRoomData);
    })

    socket.on("join room", data => {
        const roomID = data.roomID
        const name = data.name
        const code = data.code
        const max = data.max
        const user = data.user

        userData[socket.id] = user

        if (users[roomID]) {
            let objIndex = roomData.findIndex((obj => obj.roomID == roomID));
            let roomlength = users[roomID].length
            if(roomlength < max){
                
                users[roomID].push(socket.id);

                roomData[objIndex].length = users[roomID].length
            }
        } else {

            users[roomID] = [socket.id];

            roomData.push({
                name: name,
                code: code,
                roomID: roomID,
                max: max,
                length: 1,
            })

        }


        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        const roomData0 = roomData.filter(d => d.roomID == roomID);
        let userDataInRoom = []
        let userIDInRoom = []
        usersInThisRoom.map((u) =>{
        
            if(userData[u] !== null){
                userDataInRoom.push(userData[u])
                userIDInRoom.push(u)
            }
        })

        socket.emit("all users", userIDInRoom);

        users[roomID].map((u) =>{
            if(userData[u] !== null){
                io.to(u).emit("room data", {usersData: userDataInRoom, roomData: roomData0});
            }
        })

    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {

        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
            let objIndex = roomData.findIndex((obj => obj.roomID == roomID));
            roomData[objIndex].length = users[roomID].length


            const roomData0 = roomData.filter(d => d.roomID == roomID);
            
            let userDataInRoom = []
            let userIDInRoom = []

            users[roomID].map((u) =>{
                if(userData[u] !== null){
                    userDataInRoom.push(userData[u])
                    userIDInRoom.push(u)
                }
            })
            
            // console.log(socket.id+" Leaver")

            users[roomID].map(d => {
                // emit
                io.to(d).emit("user leave", socket.id)
                io.to(d).emit("room data", {usersData: userDataInRoom, roomData: roomData0});
               
            })

        }


    });

});

server.listen(process.env.PORT || 8000, () => console.log('server is running on port 8000'));


