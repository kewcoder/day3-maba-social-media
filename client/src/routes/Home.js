
import React, {  useRef,useEffect, useState } from "react";
import io from "socket.io-client";
import { v1 as uuid } from "uuid";

const Home = (props) => {
    

    let [login, setLogin] = useState({
        login: false,
        avatar: '',
        name: '',
        major: '',
        year: '',
        gender: ''
    });
    const [rooms, setRooms] = useState([]);
    
    const socketRef = useRef();

    useEffect(() => {
      
        socketRef.current = io.connect('/');

        socketRef.current.emit("find room");
        socketRef.current.on("all rooms", data => {
            setRooms(data)
        })
        
        if(localStorage.getItem("login")){
            setLogin(JSON.parse(localStorage.getItem("login")))
        }
        
    }, []);

    function create() {
        const id = uuid();
        props.history.push(`/room/${id}/Room Name/${socketRef.current.id}/3000`);
    }

    function joinRoom(room) {
        props.history.push(`/room/${room.roomID}/${room.name}/${room.code}/${room.max}`);
    }


    function updateLogin(){

        // cek if null
        if(login.avatar === '' || login.name === '' || login.major === '' || login.year === '' || login.gender === ''){
        
            // Isi dulu Boss

        }else{
            setLogin({ ...login, login:true }) 
            localStorage.setItem('login',JSON.stringify({
                avatar: login.avatar,
                name: login.name,
                major: login.major,
                year: login.year,
                gender: login.gender
            }))
        }
       

    }

    function showRoom(){
        return rooms.map(room => {
            return <div className="item" key={room.code} onClick={ () => joinRoom(room)}>
                <h4>{ room.name }</h4>
                <span>{ room.length } User | Room Code </span>
                <span>{ room.code }</span>
            </div>
        })
    }

    function setAvatar(d){

        setLogin({...login,avatar: d})


    }

    return (
        <div className="main">
            { (login.login) ? 
                <>
                    <div className="left">
                        <div className="content">
                            <h1>Maba. </h1>
                            <div className="item" >Kenalan Yuk !</div>
                            <div className="item active" onClick={create}>Buat Room</div>
                            <div className="item">Donasi</div>
                            <div className="item">Back to Home</div>

                        </div>
                    </div>  
                    <div className="right">
                        <div className="content">
                            {
                                showRoom()
                            }
                        </div>
                    </div>
                </>

            : <div className="right">
                <form id="login-form" className="content">
                 <div className="item">
                     <label>Avatar</label>
                     <img alt="avatar" className={(login.avatar === '/avatar/1.png') ? 'img active' : 'img'}  src="./avatar/1.png" onClick={ () => { setAvatar('/avatar/1.png')}}/>
                     <img alt="avatar" className={(login.avatar === '/avatar/2.png') ? 'img active' : 'img'}  src="./avatar/2.png" onClick={ () => { setAvatar('/avatar/2.png')}}/>
                     <img alt="avatar" className={(login.avatar === '/avatar/3.png') ? 'img active' : 'img'}  src="./avatar/3.png" onClick={ () => { setAvatar('/avatar/3.png')}}/>
                     <img alt="avatar" className={(login.avatar === '/avatar/4.png') ? 'img active' : 'img'}  src="./avatar/4.png" onClick={ () => { setAvatar('/avatar/4.png')}}/>
                     <img alt="avatar" className={(login.avatar === '/avatar/5.png') ? 'img active' : 'img'}  src="./avatar/5.png" onClick={ () => { setAvatar('/avatar/5.png')}}/>
                     <img alt="avatar" className={(login.avatar === '/avatar/6.png') ? 'img active' : 'img'}  src="./avatar/6.png" onClick={ () => { setAvatar('/avatar/6.png')}}/>
                 </div>
                <input type="text" className="item" value={login.name} onChange={(e)=>{ setLogin({...login,name: e.target.value})}} placeholder="Name" />
                <select className="item" value={login.major} onChange={(e)=>{ setLogin({...login,major: e.target.value})}} >
                    <option value="">
                            Select Major
                    </option>
                    <option value="Informatika">
                            Informatika
                    </option>
                    <option value="Bahasa Inggris">
                            Bahasa Inggris
                    </option>
                </select>
                <select className="item" value={login.year} onChange={(e)=>{ setLogin({...login,year: e.target.value})}} >
                    <option value="">
                            Select Student Year
                    </option>
                    <option value="2018">
                            Student Year 2018
                    </option>
                    <option value="2021">
                            Student Year 2021
                    </option>
                </select>
                    <div className="item twogender">
                        <div className={(login.gender === 1) ? 'gender active' : 'gender'} onClick={()=>{ setLogin({...login,gender: 1})}} >
                            Male
                        </div>
                        <div className={(login.gender === 2) ? 'gender active' : 'gender'} onClick={()=>{ setLogin({...login,gender: 2})}}>
                            Female
                        </div>
                    </div>
                <div className="item active" onClick={updateLogin}>Login</div>
                </form>
            </div> 
            }
            
        </div>
    );
};

export default Home;
