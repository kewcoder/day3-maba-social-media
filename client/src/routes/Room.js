import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";



const StyledVideo = styled.video`
        width:0;
        height:0;
        background:black
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
            props.peer.on("stream", stream => {
                ref.current.srcObject = stream;
            })

    }, [props]);

        return (
            <div>
                <StyledVideo playsInline autoPlay ref={ref} />
            </div>
        );
}

const Room = (props) => {
    // const [joined, setJoined] = useState(false);

    const [peers, setPeers] = useState([]);
    const [roomData, setRoomData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [leaveUser, setLeaveUser] = useState([]);

    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;


    useEffect(() => {    
        const login = JSON.parse(localStorage.getItem('login'))

       
        if(login === null || login === undefined){
                props.history.push(`/`);
        }else{
            

            const roomMax = props.match.params.max;
            const roomName = props.match.params.name;
            const roomCode = props.match.params.code;
            


         
        
            socketRef.current = io.connect('/');

            
            navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(stream => {
                userVideo.current.srcObject = stream;
                
                let joinData = {
                    max: roomMax,
                    name: roomName,
                    code: roomCode,
                    roomID: roomID,
                    user: {...login, id:socketRef.current.id }
                }

                socketRef.current.emit("join room", joinData);

                socketRef.current.on("room data", data => {
                    console.log(data)
                    setRoomData(data.roomData[0])
                    setUsersData(data.usersData)
                })

                socketRef.current.on("user leave", data => {
                    // console.log(data+" leave")
                    leaveUser.push(data)
                    setLeaveUser(leaveUser)
                })

                socketRef.current.on("all users", users => {
                
                    const peers = [];
                    users.forEach(userID => {
                        const peer = createPeer(userID, socketRef.current.id, stream);
                        peersRef.current.push({
                            peerID: userID,
                            peer,
                        })
                        
                        peers.push(peer);


                    })

                    setPeers(peers);


                })

                socketRef.current.on("user joined", payload => {
                    
            
                    const peer = addPeer(payload.signal, payload.callerID, stream);

                    peersRef.current.push({
                        peerID: payload.callerID,
                        peer,
                    })

                    setPeers(users => [...users, peer]);
                });

                socketRef.current.on("receiving returned signal", payload => {
                    const item = peersRef.current.find(p => p.peerID === payload.id);
                    item.peer.signal(payload.signal);
                });

            })


        
        }
        
    }, [roomID,props,leaveUser]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    function showUsers(){
            return usersData.map(d => {
                return (
                    <div key={d.id} className="item-user" >
                        <img src={d.avatar} alt="avatar" />
                        <span className="name"> { d.name } </span>
                    </div>
                )
            })
        
    }

    return (
        <div className="main">

               <StyledVideo muted ref={userVideo} autoPlay playsInline />
                {peers.map((peer, index) => {
                    return (
                        <Video key={index} peer={peer} />
                    );
                })}
                

           
           <div className="left">
                <div className="content">
                {showUsers()}
                </div>
           </div>
           <div className="right">
               <div className="content">
                    <div className="item">
                        Room Name :{ roomData.name }
                    </div>
                    <div className="item">
                        Room Code :{ roomData.code }
                    </div>
                    <div className="item">
                        Users : { roomData.length } joined
                    </div>
               </div>
           </div>
        </div>
    );
};

export default Room;
