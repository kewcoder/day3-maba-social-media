
import React, {  useRef,useEffect, useState } from "react";
import io from "socket.io-client";
import { v1 as uuid } from "uuid";

const Home = (props) => {
    

    let [login, setLogin] = useState({
        login: false,
        avatar: '',
        name: '',
        // major: '',
        // year: '',
        gender: ''
    });
    const [roomName, setRoomName] = useState('');
    const [rooms, setRooms] = useState([]);
    const [avatarList, setAvatarList] = useState('avatars');
    const socketRef = useRef();

  

    useEffect(() => {




        socketRef.current = io.connect('/',{transports: ['websocket']});

        socketRef.current.emit("find room");

        socketRef.current.on("all rooms", data => {
            console.log(data)
            setRooms(data)
        })
        
        if(localStorage.getItem("login")){
            if(props.location.search === '?login=true'){
                setLogin({...JSON.parse(localStorage.getItem("login")), login:true})
            }else{
                setLogin(JSON.parse(localStorage.getItem("login")))
            }
        }

        

        
    }, [props,setRooms]);


    function findRoom(){
        socketRef.current.emit("find room");
        
    }
    function create() {
        if(roomName !== ''){
            const id = uuid();
            props.history.push(`/room/${id}/${roomName}/${socketRef.current.id}/100`);

        }
    }

    function joinRoom(room) {
        props.history.push(`/room/${room.roomID}/${room.name}/${room.code}/${room.max}`);
    }


    function updateLogin(){

        // cek if null
        if(login.avatar === '' || login.name === '' || login.gender === ''){
        
            // Isi dulu Boss

        }else{
            setLogin({ ...login, login:true }) 
            localStorage.setItem('login',JSON.stringify({
                avatar: login.avatar,
                name: login.name,
                // major: login.major,
                // year: login.year,
                gender: login.gender
            }))
        }
       

    }

    function showRoom(){
        return rooms.map((room, index) => {
            return  <div className="item"
            
            style={{flexWrap:'wrap'}}
            key={room.code} onClick={ () => joinRoom(room)}>
                <img src={'/avatar/kawaii-animals/_'+(index+1)+'.svg'} alt="" width="50px" 
                style={{marginRight:'10px'}}
                />
                <h4>{ room.name } ({ room.length })</h4>
            </div>
        })
    }

    function setAvatar(d){

        setLogin({...login,avatar: d})


    }

    const Avatars1 = () => {
        let avatars = []

        for(let no = 1; no <= 50;no++){
            avatars.push(no)
        }

        return (<>
                { avatars.map(i => {
                    return <img  key={i} alt="avatar" className="img"  src={`/avatar/kawaii-avatars/_${i}.svg`} onClick={ () => { setAvatar(`/avatar/kawaii-avatars/_${i}.svg`)}}/>
                }) }
            </> )
        
    }

    const Avatars2 = () => {
        let avatars = []

        for(let no = 1; no <= 50;no++){
            avatars.push(no)
        }

        return (<>
                { avatars.map(i => {
                    return <img  key={i} alt="avatar" className="img"  src={`/avatar/kawaii-animals/_${i}.svg`} onClick={ () => { setAvatar(`/avatar/kawaii-animals/_${i}.svg`)}}/>
                }) }
            </> )
        
    }

    const Avatars3 = () => {
        let avatars = []

        for(let no = 1; no <= 50;no++){
            avatars.push(no)
        }

        return (<>
                { avatars.map(i => {
                    return <img  key={i} alt="avatar" className="img"  src={`/avatar/monster-emojis/_${i}.svg`} onClick={ () => { setAvatar(`/avatar/monster-emojis/_${i}.svg`)}}/>
                }) }
            </> )
        
    }

    return (
        <div className="main">
            { (login.login) ? 
                <>
                    <div className="left">
                        <div className="content">
                            <h1>Maba. </h1>
                            <input value={roomName} onChange={(e)=> setRoomName(e.target.value)} className="item" type="text" placeholder="Room Name" />
                            <div className="item active" onClick={create}>Create Room</div>
                            {/* <div className="item">Unsil One Access</div> */}
                            <div className="item" onClick={ () => setLogin({ ...login, login: false }) }>Profile</div>
                            <a href="https://saweria.co/akew" target="_BLANK" className="item">Donate</a>

                        </div>
                    </div>  
                    <div className="right">
                        <div className="content">
                            <h2 style={{padding:'10px'}}>Room Recomendation : </h2>
                            {
                                showRoom()
                            }
                            <div className="item"  onClick={findRoom}>Reload</div>

                        </div>
                    </div>
                </>

            : <div className="right">
                <form id="login-form" className="content">
                
                <input type="text" className="item" value={login.name} onChange={(e)=>{ setLogin({...login,name: e.target.value})}} placeholder="Name" />
                {/* <select className="item" value={login.major} onChange={(e)=>{ setLogin({...login,major: e.target.value})}} >
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
                </select> */}
                    <div className="item twoitem">
                        <div className={(login.gender === 1) ? 'item_ active' : 'item_'} onClick={()=>{ setLogin({...login,gender: 1})}} >
                            Male
                        </div>
                        <div className={(login.gender === 2) ? 'item_ active' : 'item_'} onClick={()=>{ setLogin({...login,gender: 2})}}>
                            Female
                        </div>
                    </div>
                        
                    {(login.avatar) ?
                    <div className="item">
                        <img alt="" style={{width:'150px',height:'150px',margin: 'auto'}} src={login.avatar} /> 
                    </div>
                    : ''}
               
                { (avatarList === 'avatars') ? 
                    <div className="item">
                        <Avatars1 />
                    </div>
                : ''}
                { (avatarList === 'animals') ? 
                    <div className="item">
                        <Avatars2 />
                    </div>
                : ''}

                { (avatarList === 'monsters') ? 
                    <div className="item">
                        <Avatars3 />
                    </div>
                : ''}

                <div className="item twoitem">
                    <div className={(avatarList === 'avatars') ? 'item_ active' : 'item_'} onClick={ () => setAvatarList('avatars')}>Avatar</div>
                    <div className={(avatarList === 'animals') ? 'item_ active' : 'item_'} onClick={ () => setAvatarList('animals')}>Animals</div>
                    <div className={(avatarList === 'monsters') ? 'item_ active' : 'item_'} onClick={ () => setAvatarList('monsters')}>Monsters</div>
                </div>

                <div className="item active" onClick={updateLogin}>Login</div>
                </form>
            </div> 
            }
            
        </div>
    );
};

export default Home;
