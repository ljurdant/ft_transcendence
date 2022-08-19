import {useEffect, useState} from 'react';
import {socket} from 'App';
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'

import '../../styles/Chat/Messages.css';

import {User, Message, Room} from 'interfaces'
import { Typography } from '@mui/material';

interface CreateMessageDto {
    content: string;
    user: number;
    room: number;
    type: boolean;
}

function InputBox(props: {canWrite: boolean, mutedUsers: {userId: number, date: Date}[], user: User, currentRoom: Room}) {

	let muted: {userId: number, date: Date} | undefined = props.mutedUsers.find(user => user.userId === props.user.id);
	let mutedDate = muted ? new Date(muted.date).getTime() : 0;
	function handleSubmit(e: any) {
		e.preventDefault();
		const message: string = e.target[0].value;
		const messageDto: CreateMessageDto = {content: message, user: props.user.id, room: props.currentRoom.id, type: true} 
		if (message)
			socket.emit('chat message', messageDto);
		e.target[0].value = '';
	}
	if (props.canWrite)
	{
		if (mutedDate >= new Date().getTime())
			return (<Typography>Sorry, you're currently muted from this channel 🤫</Typography>);
		else
		{
			return (
			<form className="message-form" id="form" onSubmit={handleSubmit}>
				<Stack direction='row' spacing={1} justifyContent='space-between' className="message-form">
					<input className='input' type="text" />
					<button className='miauw-button'>Miauw</button>
				</Stack>
			</form>
			);
		}
	}
	else
		return (<Typography>Sorry, you don't have the necessary rights to write in this channel</Typography>);
}

function Messages(props : {user: User, users: User[], currentRoom: Room, canWrite: boolean, blocked: User[]}) {
	
	let [messages, setMessages] = useState<Message[]>([]);
	let [mutedUsers, setMutedUsers] = useState<{userId: number, date: Date}[]>([]);

	const addMessage = (newMessage: Message) => setMessages(state => [...state, {id: newMessage.id, content: newMessage.content, userId: newMessage.userId, roomId: newMessage.roomId ,type: newMessage.type}]);

		
	useEffect(() => {
		const handler = (newMessage: Message) => {
			addMessage(newMessage)
		}
		socket.on('chat message', handler)
		return () => {
			socket.off('chat message')
		}
	}, [])

	useEffect(() => {
		let objDiv = document.getElementById('messagebox');
		if (objDiv != null)
			objDiv.scrollTop = objDiv.scrollHeight;
	}, [messages])

	useEffect(() => {
		const handler = (data: Message[]) => {setMessages(data);};
		socket.on('get all messages', handler);
		return () => {
			socket.off('get all messages');
		}
	}, [])

	useEffect(() => {
		const handler = (data: {userId: number, date: Date}[]) => {setMutedUsers(data);};
		socket.on('get muted users', handler);
		socket.on('add mute to room', () => {
			socket.emit('get muted users', props.currentRoom.id);
		});
		return () => {
			socket.off('get muted users');
		}
	}, [ props.currentRoom.id])
	
    return (
	<Box sx={{width:'100%'}}>
        <Stack className='chat' spacing={2} justifyContent='space-between'>
			<ul className='messages' id='messagebox'>
				{messages.map(item=> (
					<div key={item.id}>
						{item.roomId === props.currentRoom.id && props.blocked.find(user => user.id === item.userId) === undefined?
								<div className='flexwrapper' >
									{item.userId === props.user.id ?
									<div className='message current flex'>
										<Stack direction="row" className='user' spacing={1}>
											<li className=''>{item.content}</li>
											<Avatar src={process.env.REACT_APP_BACK_URL + "/avatars/"+item.userId.toString()+".png"} sx={{ width: 35, height: 35 }}/>
										</Stack>
											<div className='user'>
												{props.users.find(user => user.id === item.userId)?.username}
											</div>
									</div>
									:
									<div className='message other flex'>
										<Stack direction="row" className='user' spacing={1}>
											<Avatar src={process.env.REACT_APP_BACK_URL + "/avatars/"+item.userId.toString()+".png"} sx={{ width: 35, height: 35 }}/>
											<li className=''>{item.content}</li>
										</Stack>
												<div className='user' >
													{props.users.find(user => user.id === item.userId)?.username}
											</div>
									</div>
									}
								</div>
							:
							<div/>
						}
					</div>
				))}
			</ul>
			<InputBox canWrite={props.canWrite} mutedUsers={mutedUsers} user={props.user} currentRoom={props.currentRoom}/>
        </Stack>
	</Box>
    )
}

export default Messages