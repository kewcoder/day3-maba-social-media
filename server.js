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
let messages = [];

app.use(express.static('client/build'))

app.get('/*', (req, res, next) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
});
 

io.on('connection', socket => {

   

    socket.on("join room", data => {
        const roomID = data.roomID
        const name = data.name
        const code = data.code
        const max = data.max
        const user = data.user

        userData[socket.id] = user



        if (users[roomID]) {
            let roomlength = users[roomID].length
            if(roomlength < max){
                
                users[roomID].push(socket.id);
            }
        } else {

            users[roomID] = [socket.id];

            roomData.push({
                name: name,
                code: code,
                roomID: roomID,
                max: max,
                length: 1
            })

             messages[roomID] = []




        }


        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
        socket.emit("all users", usersInThisRoom);

        socket.emit("messages", messages[roomID]);



        const roomData0 = roomData.filter(d => {
            d.length = users[d.roomID].length
            return d.roomID == roomID
        });
        let userDataInRoom = []
        users[roomID].map((u) =>{
            if(userData[u] !== null){
                userDataInRoom.push(userData[u])
            }
        })
        users[roomID].map((u) =>{
            io.to(u).emit("room data", {usersData: userDataInRoom, roomData: roomData0});
        })

    });

    socket.on("sending signal", payload => {
        
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    
    
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on("find room", data => {
        let filterRoomData  = roomData.filter(d => {

            d.length = users[d.roomID].length

            return users[d.roomID].length >= 1
        });
        roomData = filterRoomData

        socket.emit("all rooms", filterRoomData);
    })

    socket.on("send message", message => {

        const roomID = socketToRoom[socket.id];

        let newMessage = {}

        if(userData[socket.id]){
            newMessage = { ...message, avatar: userData[socket.id].avatar, name:userData[socket.id].name, id: socket.id}

        }else{
            newMessage = { ...message, avatar: '', name: '', id: socket.id}

        }
        
        // console.log(newMessage)
        if(messages[roomID]){
            messages[roomID].push(newMessage)
        }else{
            messages[roomID] = []
            messages[roomID].push(newMessage)
        }

        // get All Message
        console.log(users[roomID])

        if(users[roomID] !== undefined || users[roomID] !== ''){
            
            users[roomID].map(d => {
                // emit
                io.to(d).emit("messages", messages[roomID]);
               
            })
        }
       
    });

    socket.on("leave",() => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;

            const roomData0 = roomData.filter(d => {
                d.length = users[d.roomID].length
                return d.roomID == roomID
            });
            
            let userDataInRoom = []
            let userIDInRoom = []

            users[roomID].map((u) =>{
                if(userData[u] !== null){
                    userDataInRoom.push(userData[u])
                    userIDInRoom.push(u)
                }
            })
            

            users[roomID].map(d => {
                // emit
                io.to(d).emit("user leave", socket.id)
                io.to(d).emit("room data", {usersData: userDataInRoom, roomData: roomData0});
               
            })

        }
    });

    socket.on('disconnect', () => {

        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;


            const roomData0 = roomData.filter(d => {
                d.length = users[d.roomID].length
                return d.roomID == roomID
            });
            
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


