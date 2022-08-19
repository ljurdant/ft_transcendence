import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack'
import Messages from './Messages';
import Channels from './Channels';
import Box from '@mui/material/Box';
import '../../styles/Chat/Chat.css';
import {User, Room} from 'interfaces';
import {socket} from 'App';
import { useAuth } from "components/AuthProvider";


const ChatBoxComponentStyle = {	
    width: '87vw',
    minWidth: '510px',
    height: '78vh',
	
	justifyContent: 'center',
	display: 'flex',

	border: '3px solid black',
    backgroundColor: 'rgb(120, 110, 220, 0.95)',
    backgroundPosition: 'bottom left',
	backgroundRepeat: 'no-repeat',
    filter: 'drop-shadow(20px 20px 1px black)',
	// padding: '0px',
}

const OverallChatStyle = {
	minheight: '812px',
	width: '100%',
	height: '100%',
	justifyContent: 'center', 
	display: 'flex', 
	paddingTop: '5vh',
}

function Chat(props: { users: User[], statusMap: Map<number, string>}) {
	
	let [status, setStatus] = useState('waiting for connection');
	let [currentRoom, setCurrentRoom] = useState<Room> ({id: 1, name: "general", ownerId: 60040, visibility: "public", password:""});
	let [canWrite, setCanWrite] = useState<boolean>(true);
	let [roomAdmins, setRoomAdmins] = useState<User[]>([]);
	let [blocked, setBlocked] = useState<User[]>([]);

	let auth = useAuth();

	useEffect(() => {
        socket.emit('get blocked', auth.user.id);
    }, [auth.user.id])


    useEffect(() => {
        const handler = (data: User[]) => {setBlocked(data);};
        socket.on('get blocked', handler);
        return () => {
            socket.off('get blocked');
        }
    }, [])

	
	useEffect (() => {
		const handler = (data: User[]) => { 
			setRoomAdmins(data);
		};
		socket.on('get admins', handler);
		return () => {
			socket.off('get admins', handler);
		}
	}, [])

	useEffect(() => {
		const handler = () => { 
			socket.emit('get admins', currentRoom.id);
		};
		socket.on('admin added to room', handler);
		return () => {
			socket.off('admin added to room', handler);
		}
	})

	useEffect(() => {
		const handler = () => { 
			socket.emit('get admins', currentRoom.id);
		};
		socket.on('admin removed from room', handler);
		return () => {
			socket.off('admin removed from room', handler);
		}
	})

	useEffect(() => {
	const init = () => {
		setStatus('connected');
		if (auth.user)
		{
			socket.emit('get rooms', auth.user.id);
			socket.emit('get public rooms', auth.user.id);
			socket.emit('get all messages', auth.user.id);
		}
		if (!socket.connected)
			setStatus('disconnected');
		}
		if (socket.connected)
			init();
		else
			socket.on('connect', init)
	}, [auth.user])

	return (
		<Box sx={OverallChatStyle}>
			<Box sx={ChatBoxComponentStyle}>
				{auth.user?
					<Stack direction='row' className='chmsg'>
						<Stack>
							{status}
							<Channels user={auth.user} users={props.users} currentRoom={currentRoom} setCurrentRoom = {setCurrentRoom} setCanWrite = {setCanWrite} roomAdmins={roomAdmins} statusMap={props.statusMap} blocked={blocked}/>
						</Stack>
						<Messages user={auth.user} users={props.users} currentRoom={currentRoom} canWrite = {canWrite} blocked={blocked}/>
					</Stack>
					:
					<div/>
				}
			</Box>
		</Box>
	);
}

export default Chat;