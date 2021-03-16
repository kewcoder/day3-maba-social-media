import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import { useHistory } from 'react-router-dom'




let messagesEnd = '';

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


    const history = useHistory()


    const [peers, setPeers] = useState([]);
    const [roomData, setRoomData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [leaveUser, setLeaveUser] = useState([]);
    // const [mute, setMute] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;


    useEffect(() => {    

        scrollToBottom();

    
        history.listen( () => {
            socketRef.current.emit("leave");
        })

        window.onbeforeunload = (event) => {
            const e = event || window.event;
            // Cancel the event
            e.preventDefault();

            socketRef.current.emit("leave");

            if (e) {
                e.returnValue = ''; // Legacy method for cross browser support
            }
            return ''; // Legacy method for cross browser support

        };
            
    
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
                    user: {...login, id: socketRef.current.id, mute: true }
                }
                
                socketRef.current.emit("join room", joinData);

                socketRef.current.on("room data", data => {
                    setRoomData(data.roomData[0])
                    setUsersData(data.usersData)
                })

                socketRef.current.on("messages", data => {
                    setMessages(data)
                    scrollToBottom()
                })

                socketRef.current.on("user leave", data => {
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
        
    }, [roomID,props,leaveUser,history]);

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

    function showUsers(m){

            let data = usersData.filter(u => {
                let id = leaveUser.includes(u.id)
                if(id){
                    return u.id !== id;
                }else{
                    if(m === 1){
                        return u.mute !== true;
                    }else{
                        return u.mute !== false;
                    }
                }
                 
            })
            // console.log(data)
            // console.log(leaveUser)
            return data.map((d,index) => {
                return (
                    <div key={index} className="item-user" >
                        <img src={d.avatar} alt="avatar" />
                        <span className="name"> { d.name } </span>
                    </div>
                )
            })
        
    }


    const Emojis = () => {
        let emojis = []

        for(let no = 1; no <= 50;no++){
            emojis.push(no)
        }

        return (<>
                { emojis.map(i => {
                    return <img style={{margin:'5px'}}  key={i} alt="r" className="img"  src={`/emoji/icon/_${i}.svg`} onClick={() => sendStiker(`/emoji/icon/_${i}.svg`)} />
                }) }
            </> )
        
    }

    function sendMessage(m){
        socketRef.current.emit("send message", { text:m, stiker: ""});
        setMessage("")
    }
    function sendStiker(stiker){
        socketRef.current.emit("send message", { text:"", stiker: stiker });
    }

    function leaveRoom(){
        socketRef.current.emit("leave");
        props.history.push('/?login=true')
    }


    function scrollToBottom () {
        // console.log(messagesEnd)
        messagesEnd.scrollIntoView({ behavior: "smooth" });
    }

    function showMessages(){
        return (<>
            {
                messages.map((m,index) => {

                    let classChat = {width:'100%',fontSize:'1rem',textAlign: 'right',padding:'10px',borderBottom:'1px solid var(--primary)'};

                    if(m.id === socketRef.current.id){
                        classChat = {width:'100%',float:'left',fontSize:'1rem',padding:'10px',borderBottom:'1px solid var(--primary)'};
                    }

                    return <>
                    { (m.stiker === '') ?
                        <div key={index} style={classChat}>
                                <span>{m.name}</span> 
                                <img src={m.avatar} style={{width:'20px',height:'20px',border:'2px solid var(--primary)',borderRadius:'100px'}} alt="" />
                                <span style={{fontSize:'1.2rem'}}> { m.text }</span> 
            
                        </div> : ''} 
                    { (m.text === '') ?
                        <div style={classChat}>
                                <span>{m.name}</span> 
                                <img src={m.avatar} style={{width:'20px',height:'20px',border:'2px solid var(--primary)',borderRadius:'100px'}} alt="" />
                                
                                <img src={m.stiker} style={{width:'100px',height:'100px'}} alt="" />
                        </div>
                    : ''}

                    

                    </>
                    
                })

                
                
            }
            {scrollToBottom}
        </>)
        
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
                <div className="content"
                style={{
                    maxHeight:'80vh',
                    overflowY:'scroll'
                }}>
                <h1 >
                    Maba. 
                    <button className="item" style={{width:'100px',fontSize:'1rem',marginLeft:'auto',padding:'10px'}} onClick={leaveRoom}>Leave</button>
                </h1>
                <br />
                {/* <h6 style={{width:'100%',padding:'30px'}}>Speakers :</h6> */}
                {showUsers(1)}
                {/* <h6 style={{width:'100%',padding:'30px'}}>Listeners :</h6> */}
                {showUsers(2)}
                </div>
           </div>
           <div className="right">

               <div className="content">

                <div className="item" style={{
                    height:'40vh',
                }}>
                    <div style={
                        {
                            width:'100%',
                            height: '100%',
                            overflowY:'scroll'
                        }
                    }>

                
                <div className="item" onClick={() => sendMessage("Hai ..")}>
                    Join Chat ( { roomData.length } User)
                </div>

                {
                    showMessages()
                }
               
                

                <div  style={{ float:"left", clear: "both" }}
                    ref={(el) => { messagesEnd = el; }}>
                </div>

                </div>


                </div>
                <div className="item" style={{justifyContent:'left'}}>
                    <Emojis />
                </div>
                <div className="item" >
                    <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} className="item" />
                    <button onClick={()=>sendMessage(message)} className="item" style={{width:'100px',fontSize: '1rem',textAlign:'center'}}>
                        Send
                    </button>
                </div>


               </div>

               {/* <div className="content">
                    <div className="item">
                        Room Name : { roomData.name }
                    </div>
                    <div className="item">
                        Room Code :{ roomData.code }
                    </div>
                    <div className="item">
                        Users : { roomData.length } joined
                    </div>
                    <div className="item twogender">
                        <div className={(mute) ? 'gender active': 'gender'} onClick={()=> {setMute(!mute)}} >
                            Mute
                        </div>
                        <div className="gender" >
                            leave
                        </div>
                    </div>
               </div> */}
           </div>
        </div>
    );
};

export default Room;
